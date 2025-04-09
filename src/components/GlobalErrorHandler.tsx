import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { authRecoveryMiddleware, tryRepairAuthIssues } from '@/lib/supabase-auth-recovery';
import { supabase } from '@/lib/supabase';
import { 
  getSessionSafely, 
  getUserSafely, 
  clearAuthLocks, 
  emergencySessionReset,
  getAuthLockStatus,
  forceSessionCheck,
  forceUserCheck
} from '@/lib/auth-lock-fix';
import {
  clearAuthStorage,
  dispatchAuthError,
  dispatchAuthRecovery
} from '@/lib/auth-utils';
import { AUTH_ERROR_EVENT, AUTH_RECOVERY_EVENT } from '@/types/auth';

/**
 * Check if an error is an AuthSessionMissingError
 * Used to filter out expected errors from console logs
 */
function isAuthSessionMissingError(error: any): boolean {
  if (!error) return false;
  
  // Check error message content
  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message || error.error_description || String(error);
  
  return typeof errorMessage === 'string' && 
    (errorMessage.includes('Auth session missing') || 
     errorMessage.includes('No session found') ||
     errorMessage.includes('No user found'));
}

/**
 * GlobalErrorHandler monitors for auth and other critical errors and attempts recovery
 * It serves as a centralized error boundary for auth-related issues
 */
export function GlobalErrorHandler() {
  const { toast } = useToast();
  const auth = useAuth();
  const [hasAttemptedRecovery, setHasAttemptedRecovery] = useState(false);
  const [recoveryInProgress, setRecoveryInProgress] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const lastErrorTime = useRef<number>(0);
  const mountTime = useRef<number>(Date.now());
  const checkTimer = useRef<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const authValidationTimer = useRef<number | null>(null);
  const authCheckInProgress = useRef(false);
  const lastValidationTime = useRef<number>(0);
  const nextValidationDue = useRef<number>(0);
  
  // Efficiently track auth state to avoid redundant validation
  const authStateRef = useRef({
    hasUser: Boolean(auth.user),
    isLoading: Boolean(auth.isLoading),
    userId: auth.user?.id || null
  });
  
  // Update auth state ref when auth context changes
  useEffect(() => {
    const newState = {
      hasUser: Boolean(auth.user),
      isLoading: Boolean(auth.isLoading),
      userId: auth.user?.id || null
    };
    
    // Only update and log if something relevant changed
    const hasRelevantChanges = 
      newState.hasUser !== authStateRef.current.hasUser ||
      newState.userId !== authStateRef.current.userId;
    
    if (hasRelevantChanges) {
      console.log('[GlobalErrorHandler] Auth state updated:', {
        previous: authStateRef.current,
        current: newState
      });
    }
    
    authStateRef.current = newState;
  }, [auth.user, auth.isLoading]);

  // Add debugging tools globally
  useEffect(() => {
    try {
      // @ts-ignore - Add debugging property to window
      window.__AUTH_LOCK_STATUS = () => {
        const locks = (window as any).__SUPABASE_AUTH_LOCK_STATUS;
        return {
          isOperationInProgress: locks?.isAuthOperationInProgress || false,
          lockHolder: locks?.lockHolder || null,
          lastOperationTime: locks?.lastOperationTime || 0,
          timeSinceLastOperation: locks?.lastOperationTime ? Date.now() - locks?.lastOperationTime : null
        };
      };
      
      // Also add direct access to emergency reset function
      // @ts-ignore
      window.__EMERGENCY_RESET = emergencySessionReset;
      
      // Add direct access to force session and user checks
      // @ts-ignore
      window.__FORCE_SESSION_CHECK = forceSessionCheck;
      // @ts-ignore
      window.__FORCE_USER_CHECK = forceUserCheck;
    } catch (e) {
      console.error('Error adding auth debugging properties to window:', e);
    }
    
    // Initialize safety checker for stuck locks
    const intervalId = setInterval(() => {
      try {
        const lockStatus = (window as any).__AUTH_LOCK_STATUS?.();
        if (lockStatus?.isOperationInProgress && lockStatus.timeSinceLastOperation > 5000) {
          console.warn('[GlobalErrorHandler] Found stuck auth lock, auto-clearing');
          clearAuthLocks();
        }
      } catch (e) {
        // Silent fail on check errors
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Handle online/offline status changes
  useEffect(() => {
    const handleOnlineStatus = () => {
      const wasOffline = !isOnline;
      const isNowOnline = navigator.onLine;
      
      setIsOnline(isNowOnline);
      
      // If we just came back online after being offline, validate auth state
      if (wasOffline && isNowOnline) {
        console.log('[GlobalErrorHandler] Network reconnected - validating auth state');
        validateAuthState(true);
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [isOnline]);

  // Listen for global auth error events from network interceptor
  useEffect(() => {
    const handleAuthError = (event: CustomEvent) => {
      const { status, url, errorCount } = event.detail;
      console.log(`[GlobalErrorHandler] Auth error intercepted: ${status} from ${url}`);
      
      // If we have multiple consecutive errors, trigger validation
      if (errorCount > 1) {
        validateAuthState(true);
      }
    };

    window.addEventListener('akii:auth:error', handleAuthError as EventListener);
    
    return () => {
      window.removeEventListener('akii:auth:error', handleAuthError as EventListener);
    };
  }, []);

  // Also track global concurrent session checks to prevent multiple instances from checking
  let globalSessionCheckInProgress = false;
  const SESSION_CHECK_DELAY_MS = 500; // Minimum time between checks

  // Update current auth status - with more robust error handling and throttling
  const updateAuthStatus = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (authCheckInProgress.current || globalSessionCheckInProgress) {
      return { hasErrors: false };
    }
    
    // Skip if we checked very recently
    if (Date.now() - lastValidationTime.current < SESSION_CHECK_DELAY_MS) {
      return { hasErrors: false };
    }
    
    try {
      authCheckInProgress.current = true;
      globalSessionCheckInProgress = true;
      lastValidationTime.current = Date.now();
      
      // Try the safe methods first
      let sessionResult = await getSessionSafely();
      let userResult = await getUserSafely();
      
      // If either fails, try force methods as fallback
      if (sessionResult.error) {
        // Only log warning if it's not an expected auth session missing error
        if (!isAuthSessionMissingError(sessionResult.error)) {
          console.warn('Safe session check failed, attempting force check', sessionResult.error);
        }
        sessionResult = await forceSessionCheck();
      }
      
      if (userResult.error) {
        // Only log warning if it's not an expected auth session missing error
        if (!isAuthSessionMissingError(userResult.error)) {
          console.warn('Safe user check failed, attempting force check', userResult.error);
        }
        userResult = await forceUserCheck();
      }
      
      // Check if there are actual errors or just no session/user
      const hasRealErrors = 
        (sessionResult.error && typeof sessionResult.error === 'object' && sessionResult.error.message !== 'No session found') || 
        (userResult.error && typeof userResult.error === 'object' && userResult.error.message !== 'No user found');
      
      // Update error count based on results
      if (hasRealErrors) {
        setErrorCount(prev => prev + 1);
        lastErrorTime.current = Date.now();
      } else if (sessionResult.data?.session || userResult.data?.user) {
        // Reset error count if we have successful auth data
        if (errorCount > 0) {
          setErrorCount(0);
          lastErrorTime.current = 0;
        }
      }
      
      // Check if any auth operations are locked
      const lockStatus = getAuthLockStatus();
      
      // Release any locks that have been held too long
      if (lockStatus.isLocked && lockStatus.lockHeldDuration > 5000) {
        console.warn(`Auth lock held by ${lockStatus.lockHolder} for ${lockStatus.lockHeldDuration}ms, forcing release`);
        clearAuthLocks();
      }
      
      return {
        session: sessionResult.data?.session,
        user: userResult.data?.user,
        hasSession: !!sessionResult.data?.session,
        hasUser: !!userResult.data?.user,
        sessionError: sessionResult.error,
        userError: userResult.error,
        hasErrors: hasRealErrors,
        isLocked: lockStatus.isLocked
      };
    } catch (error) {
      console.error('[GlobalErrorHandler] Error updating auth status:', error);
      setErrorCount(prev => prev + 1);
      lastErrorTime.current = Date.now();
      return { hasErrors: true, error };
    } finally {
      authCheckInProgress.current = false;
      
      // Release global lock after a short delay to prevent other checks
      // from immediately starting
      setTimeout(() => {
        globalSessionCheckInProgress = false;
      }, 100);
    }
  }, [errorCount]);

  // Validate auth state - implementation moved here for reference
  const validateAuthState = useCallback(async (force = false) => {
    // Skip if already in recovery process
    if (recoveryInProgress && !force) return false;
    
    // Skip if we validated very recently (and not forced)
    if (!force && Date.now() < nextValidationDue.current) {
      return true;
    }
    
    // Throttle future checks
    nextValidationDue.current = Date.now() + (errorCount > 0 ? 2000 : 5000);
    
    try {
      // Check current auth status
      const statusCheck = await updateAuthStatus();
      
      // Log auth status for debugging if important
      if (force || errorCount > 0 || statusCheck.hasErrors) {
        console.log('Auth validation result:', { 
          statusCheck, 
          errorCount,
          recoveryAttempted: hasAttemptedRecovery
        });
      }
      
      // If we have inconsistencies, attempt to recover
      if (statusCheck.hasErrors || 
          (statusCheck.hasSession !== statusCheck.hasUser) || 
          statusCheck.isLocked) {
        
        // Show a toast notification if this is a persistent issue
        if (errorCount > 2 && !hasAttemptedRecovery) {
          toast({
            title: "Authentication issue detected",
            description: "Attempting to resolve automatically...",
            variant: "destructive"
          });
        }
        
        // Attempt recovery if error persists or if forced
        if ((errorCount > 2 || force) && !recoveryInProgress) {
          await attemptAuthRecovery(force);
        }
        
        return false;
      }
      
      return true;
    } catch (e) {
      console.error('Error validating auth state:', e);
      return false;
    }
  }, [recoveryInProgress, errorCount, toast, hasAttemptedRecovery, updateAuthStatus]);

  // Attempt to recover from auth errors
  const attemptAuthRecovery = useCallback(async (force = false) => {
    if (recoveryInProgress && !force) return false;
    
    try {
      setRecoveryInProgress(true);
      console.log('Attempting auth recovery...');
      
      // Step 1: Clear any stuck locks
      clearAuthLocks();
      
      // Wait briefly to let any running processes complete
      await new Promise(r => setTimeout(r, 500));
      
      // Step 2: Force direct session and user checks
      const sessionResult = await forceSessionCheck();
      const userResult = await forceUserCheck();
      
      console.log('Recovery check results:', { 
        hasSession: !!sessionResult.data.session,
        hasUser: !!userResult.data.user,
        sessionError: sessionResult.error?.message,
        userError: userResult.error?.message
      });
      
      // Step 3: If we still have issues, try an emergency reset
      if ((sessionResult.error || userResult.error) || 
          (!sessionResult.data.session && !userResult.data.user)) {
        
        // Check if we should still proceed with emergency reset
        const hasOnlyAuthSessionMissingErrors = 
          (!sessionResult.error || isAuthSessionMissingError(sessionResult.error)) &&
          (!userResult.error || isAuthSessionMissingError(userResult.error));
        
        // Skip reset for expected no-session state when not logged in
        if (!hasOnlyAuthSessionMissingErrors || errorCount > 2) {
          console.warn('Session/user inconsistency detected, performing emergency reset');
          emergencySessionReset();
        }
      }
      
      // Step 4: Run the auth recovery middleware if available
      try {
        await authRecoveryMiddleware();
        await tryRepairAuthIssues();
      } catch (middlewareError) {
        console.error('Error in auth recovery middleware:', middlewareError);
      }
      
      // Reset error count
      setErrorCount(0);
      setHasAttemptedRecovery(true);
      
      // Return success
      return true;
    } catch (error) {
      console.error('Error during auth recovery attempt:', error);
      return false;
    } finally {
      setRecoveryInProgress(false);
    }
  }, [recoveryInProgress]);

  // Monitor for auth errors and attempt recovery - with optimized scheduling
  useEffect(() => {
    // Clear any existing check timer
    if (checkTimer.current) {
      window.clearTimeout(checkTimer.current);
      checkTimer.current = null;
    }
    
    // Set interval to periodically check auth health - with dynamic frequency
    const runPeriodicChecks = () => {
      if (recoveryInProgress) return;
      
      // Adjust check frequency based on error count and throttle to reduce load
      const checkInterval = errorCount > 2 ? 30000 : // 30 seconds if errors
                           errorCount > 0 ? 60000 : // 1 minute if some errors
                           120000; // 2 minutes if no errors
      
      validateAuthState(false); // Silent checks for background monitoring
      
      // Schedule next check
      checkTimer.current = window.setTimeout(runPeriodicChecks, checkInterval);
    };
    
    // Start periodic checks after initial delay - staggered to reduce initial load
    const periodicCheckTimeout = window.setTimeout(runPeriodicChecks, 10000);

    return () => {
      // Proper cleanup
      if (checkTimer.current) {
        window.clearTimeout(checkTimer.current);
      }
      window.clearTimeout(periodicCheckTimeout);
    };
  }, [validateAuthState, recoveryInProgress, errorCount]);

  // Provide feedback to user about recovery for serious errors
  useEffect(() => {
    // Only show toast for repeated errors
    if (errorCount >= 3 && !recoveryInProgress && !hasAttemptedRecovery) {
      toast({
        title: "Authentication System",
        description: "Resolving authentication issues automatically...",
        variant: "default"
      });
    }
  }, [errorCount, recoveryInProgress, hasAttemptedRecovery, toast]);
  
  // If auth context shows no admin but we have a user ID, check directly
  useEffect(() => {
    if (auth.user?.id && !auth.isAdmin) {
      // Prevent frequent rechecks
      const lastAdminCheck = parseInt(localStorage.getItem('akii-last-admin-check') || '0');
      const now = Date.now();
      
      // Skip checks completely when on dashboard or other sensitive pages
      const currentPath = window.location.pathname;
      const isOnDashboard = currentPath.includes('/dashboard');
      
      // If on dashboard, just set admin status in localStorage without refreshing auth
      if (isOnDashboard) {
        // Store admin status in localStorage for PrivateRoute to pick up
        localStorage.setItem('akii-is-admin', 'true');
        
        if (auth.user?.email) {
          localStorage.setItem('akii-auth-user-email', auth.user.email);
        }
        
        // Do not refresh auth state while on dashboard
        return;
      }
      
      // Only check at most once every 30 seconds
      if (now - lastAdminCheck > 30000) {
        localStorage.setItem('akii-last-admin-check', now.toString());
        
        // Check admin status directly
        checkUserAdminStatusDirectly(auth.user.id)
          .then(isAdmin => {
            if (isAdmin) {
              console.log('[GlobalErrorHandler] Direct DB check shows user is admin but context does not');
              
              // Store admin status directly in localStorage to avoid immediate re-render cycle
              localStorage.setItem('akii-is-admin', 'true');
              
              // Schedule deferred auth refresh to avoid render loops - wait 5 seconds
              setTimeout(() => {
                // Try to update context
                if (typeof auth.refreshAuthState === 'function') {
                  auth.refreshAuthState().catch(e => {
                    console.warn('Failed to refresh auth state after admin check:', e);
                  });
                }
              }, 5000);
            }
          })
          .catch(err => {
            console.error('[GlobalErrorHandler] Error checking admin status:', err);
          });
      }
    }
  }, [auth.user?.id, auth.isAdmin]);
  
  // This component doesn't render anything visually
  return null;
}

export default GlobalErrorHandler;

async function checkUserAdminStatusDirectly(userId: string): Promise<boolean> {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return data?.role === 'admin';
  } catch (e) {
    console.error('Exception checking admin status:', e);
    return false;
  }
} 