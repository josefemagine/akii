import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/StandardAuthContext';
import { getSessionSafely, forceSessionCheck, forceUserCheck } from '@/lib/auth-lock-fix';
import { debounce } from 'lodash';

interface PrivateRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  redirectTo?: string;
}

// Reduce log frequency to prevent console spam
const LOG_THROTTLE_MS = 1000; // Only log once per second
let lastLogTime = 0;

// Throttle console logs within PrivateRoute
function throttledLog(message: string, data?: any) {
  const now = Date.now();
  if (now - lastLogTime > LOG_THROTTLE_MS) {
    lastLogTime = now;
    console.log(message, data);
  }
}

// Shared promise for session checks to prevent concurrent requests
let pendingSessionCheck: Promise<any> | null = null;
let lastSessionCheckTime = 0;
const SESSION_CHECK_CACHE_MS = 2000; // Cache session check results for 2 seconds

/**
 * A route component that requires authentication to access
 * Redirects to login if not authenticated
 * Optionally, can restrict access to admin users only
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  adminOnly = false,
  redirectTo = '/auth/login',
}) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastValidationTimeRef = useRef<number>(0);
  const validationCount = useRef(0);
  const componentMounted = useRef(true);
  
  // Keep track of authentication state within the component
  const authStateRef = useRef({
    hasUser: Boolean(auth.user),
    userId: auth.user?.id,
    hasSession: Boolean(auth.session),
    isLoading: auth.isLoading,
    isValidatingSession: isValidating
  });
  
  // Centralize auth state tracking to reduce re-renders
  useEffect(() => {
    const newState = {
      hasUser: Boolean(auth.user),
      userId: auth.user?.id,
      hasSession: Boolean(auth.session),
      isLoading: auth.isLoading,
      isValidatingSession: isValidating
    };
    
    // Only log state changes that would affect the routing decision
    // and limit log frequency to reduce spam
    const hasRelevantChanges = 
      newState.hasUser !== authStateRef.current.hasUser ||
      newState.hasSession !== authStateRef.current.hasSession ||
      (newState.isLoading !== authStateRef.current.isLoading && !newState.isLoading);
    
    if (hasRelevantChanges && !isValidating && !auth.isLoading) {
      throttledLog('PrivateRoute auth state:', newState);
    }
    
    authStateRef.current = newState;
  }, [auth.user, auth.session, auth.isLoading, isValidating]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      componentMounted.current = false;
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);
  
  // Reliable session check that safely reuses in-flight checks
  const checkSessionReliably = async () => {
    const now = Date.now();
    
    // Reuse cached session check if recent enough
    if (pendingSessionCheck && (now - lastSessionCheckTime < SESSION_CHECK_CACHE_MS)) {
      return pendingSessionCheck;
    }
    
    // Create a new session check and cache it
    lastSessionCheckTime = now;
    pendingSessionCheck = (async () => {
      try {
        // First try normal safe method
        const sessionResult = await getSessionSafely();
        
        // If that fails, fall back to force check
        if (sessionResult.error) {
          return await forceSessionCheck();
        }
        
        return sessionResult;
      } catch (err) {
        console.error('Session check failed with both methods:', err);
        // Last resort attempt with direct force check
        return await forceSessionCheck();
      } finally {
        // Clear pending check after a short delay to allow batching
        setTimeout(() => {
          pendingSessionCheck = null;
        }, 100);
      }
    })();
    
    return pendingSessionCheck;
  };
  
  // Debounced validation function to prevent excessive auth checks
  const validateAuthState = useRef(
    debounce(async () => {
      // Skip if already validating or if we validated very recently
      const now = Date.now();
      if (isValidating || (now - lastValidationTimeRef.current < 1000) || !componentMounted.current) {
        return;
      }
      
      try {
        validationCount.current++;
        lastValidationTimeRef.current = now;
        setIsValidating(true);
        
        // If we already have a user and session, we're good
        if (auth.user && auth.session && !adminOnly) {
          setIsValid(true);
          return;
        }
        
        // If admin-only route, check admin status
        if (adminOnly && (!auth.user || !auth.isAdmin)) {
          setIsValid(false);
          return;
        }
        
        // If auth is still loading, wait for it
        if (auth.isLoading) {
          // Set a timeout to prevent hanging indefinitely
          if (validationTimeoutRef.current) {
            clearTimeout(validationTimeoutRef.current);
          }
          
          validationTimeoutRef.current = setTimeout(() => {
            if (!componentMounted.current) return;
            
            console.log('PrivateRoute: Auth validation timed out');
            setIsValidating(false);
            
            // If we have a stale state, try force check
            if (validationCount.current < 3) {
              console.log('PrivateRoute: Using force check after timeout');
              
              Promise.all([
                forceSessionCheck(),
                forceUserCheck()
              ]).then(([sessionResult, userResult]) => {
                if (!componentMounted.current) return;
                
                const hasValidAuth = Boolean(
                  sessionResult.data?.session && userResult.data?.user
                );
                setIsValid(hasValidAuth);
              }).catch(() => {
                if (!componentMounted.current) return;
                setIsValid(false);
              });
            } else {
              // After multiple attempts, make a decision based on what we have
              setIsValid(Boolean(auth.user && auth.session));
            }
          }, 3000);
          
          return;
        }
        
        // Try refreshing auth state if needed
        let hasRefreshed = false;
        if (!auth.user || !auth.session) {
          throttledLog('PrivateRoute: Starting validation and refresh');
          
          try {
            // First try context's refresh method
            await auth.refreshAuthState();
            hasRefreshed = true;
          } catch (refreshError) {
            console.warn('Context refresh failed, falling back to direct checks:', refreshError);
            
            // Fall back to direct session and user checks
            const [sessionResult, userResult] = await Promise.all([
              checkSessionReliably(),
              forceUserCheck()
            ]);
            
            // If we have valid session and user, try to update context manually
            if (sessionResult.data?.session && userResult.data?.user) {
              try {
                // Check if auth context has updateSession using type assertion
                const authWithUpdate = auth as any;
                if (typeof authWithUpdate.updateSession === 'function') {
                  await authWithUpdate.updateSession(sessionResult.data.session);
                } else {
                  // Otherwise, try to re-run the standard refresh
                  await auth.refreshAuthState();
                }
                hasRefreshed = true;
              } catch (e) {
                console.error('Failed to update auth context with fresh session:', e);
              }
            }
          }
        }
        
        if (hasRefreshed) {
          throttledLog('PrivateRoute: Auth state refreshed');
        }
        
        // After refresh, check if user is authenticated
        const authValid = Boolean(auth.user && auth.session);
        
        // If admin route, also check admin status
        if (adminOnly && (!auth.user || !auth.isAdmin)) {
          setIsValid(false);
        } else {
          setIsValid(authValid);
        }
      } catch (error) {
        console.error('Error validating auth state:', error);
        setIsValid(false);
      } finally {
        if (componentMounted.current) {
          setIsValidating(false);
        }
        
        // Clean up timeout
        if (validationTimeoutRef.current) {
          clearTimeout(validationTimeoutRef.current);
          validationTimeoutRef.current = null;
        }
      }
    }, 300)
  ).current;
  
  // Validate on mount and when auth state changes
  useEffect(() => {
    // Immediately set valid if auth state is clearly valid
    if (auth.user && auth.session && !adminOnly) {
      setIsValid(true);
      return;
    }
    
    // For admin routes, check admin status immediately
    if (adminOnly) {
      if (auth.user && auth.session && auth.isAdmin) {
        setIsValid(true);
      } else if (auth.user && auth.session && !auth.isAdmin) {
        setIsValid(false);
      } else {
        validateAuthState();
      }
      return;
    }
    
    // Otherwise validate auth state
    validateAuthState();
    
    // Cleanup
    return () => {
      validateAuthState.cancel();
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [auth.user, auth.session, auth.isAdmin, auth.isLoading, adminOnly]);
  
  // Redirect if invalid
  useEffect(() => {
    if (isValid === false) {
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`${redirectTo}?returnUrl=${returnUrl}`, { replace: true });
    }
  }, [isValid, navigate, location, redirectTo]);
  
  // Show children if authenticated
  if (isValid === true) {
    return <>{children}</>;
  }
  
  // Show loading state while validating
  if (isValid === null || auth.isLoading || isValidating) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin"></div>
        <span className="ml-2">Authenticating...</span>
      </div>
    );
  }
  
  // Should never get here because of the redirect effect
  return null;
};



