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
      // Use a more concise log format
      console.log(`PrivateRoute: Auth state updated - ${newState.hasUser ? 'User✓' : 'NoUser'} ${newState.hasSession ? 'Session✓' : 'NoSession'}`);
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
  
  // Look for SUPABASE_AUTH_TOKEN_LOCAL_STORAGE_KEY directly in localStorage
  const checkForValidAuthToken = () => {
    try {
      // First check for the standard Supabase token format
      const tokenKey = Object.keys(localStorage).find(key => 
        key.startsWith('sb-') && key.includes('-auth-token')
      );
      
      if (tokenKey) {
        try {
          // If we have a token in localStorage, let's check if it's valid
          const tokenData = JSON.parse(localStorage.getItem(tokenKey) || '{}');
          
          // Check for either a valid access token or refresh token
          const hasAccessToken = Boolean(tokenData?.access_token);
          const hasRefreshToken = Boolean(tokenData?.refresh_token);
          const hasExpiry = Boolean(tokenData?.expires_at);
          
          // Only consider valid if it has at least one token
          if (hasAccessToken || hasRefreshToken) {
            // Check if token is expired
            if (hasExpiry) {
              const expiresAt = tokenData.expires_at * 1000; // Convert to ms
              const now = Date.now();
              if (expiresAt < now) {
                // Token is expired
                console.log('PrivateRoute: Found expired auth token, not using it');
                return false;
              }
            }
            
            // Token exists and is not expired
            console.log('PrivateRoute: Found valid auth token in storage, bypassing auth check');
            return true;
          }
        } catch (e) {
          console.error('Error parsing auth token from localStorage:', e);
        }
      }
    } catch (e) {
      console.error('Error checking localStorage for tokens:', e);
    }
    
    return false;
  };
  
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
    
    // Check for valid auth token as a shortcut
    if (checkForValidAuthToken()) {
      // Immediately set as valid - we'll trust the token and fix the context later
      setIsValid(true);
      
      // In the background, try to update the auth context
      setTimeout(() => {
        if (!componentMounted.current) return;
        
        // Try to refresh auth state in the background
        if (typeof auth.refreshAuthState === 'function') {
          auth.refreshAuthState().catch(e => {
            // Only log if not an auth session missing error
            if (!e.message?.includes('No current user') && 
                !e.message?.includes('No session')) {
              console.warn('Background refresh failed after token bypass:', e);
            }
          });
        }
      }, 500);
      
      return;
    }
    
    // Otherwise validate auth state
    validateAuthState();
    
    // Set a maximum wait time for authentication
    const maxAuthWaitTime = setTimeout(() => {
      if (isValid === null && componentMounted.current) {
        console.warn('PrivateRoute: Authentication timed out after waiting');
        
        // Check for any localStorage tokens as a last resort
        const hasAnyStorageToken = checkStorageForAuthTokens();
        
        if (hasAnyStorageToken) {
          console.log('PrivateRoute: Found auth tokens in storage, allowing access');
          setIsValid(true);
        } else {
          console.log('PrivateRoute: No auth tokens found after timeout, redirecting');
          setIsValid(false);
        }
      }
    }, 5000); // 5 second maximum wait time
    
    // Cleanup
    return () => {
      validateAuthState.cancel();
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      clearTimeout(maxAuthWaitTime);
    };
  }, [auth.user, auth.session, auth.isAdmin, auth.isLoading, adminOnly]);
  
  // Function to check localStorage for any auth tokens
  const checkStorageForAuthTokens = () => {
    try {
      // Look for Supabase tokens or custom auth markers in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('supabase.auth.token') || 
          key.includes('sb-') ||
          key.includes('akii-auth') ||
          key === 'force-auth-login'
        )) {
          console.log("PrivateRoute: Found auth token in localStorage:", key);
          return true;
        }
      }
    } catch (e) {
      console.error("PrivateRoute: Error checking localStorage auth:", e);
    }
    return false;
  };
  
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
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin mb-4"></div>
        <span className="text-lg">Authenticating...</span>
        {isValidating && (
          <p className="text-sm text-muted-foreground mt-2">
            Verifying your credentials...
          </p>
        )}
      </div>
    );
  }
  
  // Should never get here because of the redirect effect
  return null;
};



