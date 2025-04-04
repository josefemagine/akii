import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-compatibility';
import { useDirectAuth } from '@/contexts/direct-auth-context';
import { isLoggedIn } from '@/lib/direct-db-access';
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
  redirectTo = '/login',
}) => {
  const compatAuth = useAuth();
  const directAuth = useDirectAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastValidationTimeRef = useRef<number>(0);
  const validationCount = useRef(0);
  const componentMounted = useRef(true);
  const firstRender = useRef(true);
  
  // Check if we're already at the login page to prevent loops
  const isLoginPage = location.pathname === '/login';
  
  // Determine effective auth state by checking both auth systems
  const effectiveAuthState = {
    // Prioritize direct auth over compatibility layer
    hasUser: Boolean(directAuth.user) || Boolean(compatAuth.user),
    userId: directAuth.user?.id || compatAuth.user?.id,
    hasProfile: Boolean(directAuth.profile) || false,
    isAdmin: directAuth.isAdmin || compatAuth.isAdmin || false,
    isLoading: directAuth.isLoading || compatAuth.isLoading
  };
  
  // Log initial auth state
  useEffect(() => {
    console.log('PrivateRoute: Initial auth state', {
      ...effectiveAuthState,
      currentPath: location.pathname,
      isLoginPage
    });
    
    firstRender.current = false;
  }, []);
  
  // Check if we're on the wrong port
  useEffect(() => {
    // Skip if already on login page
    if (isLoginPage) return;
    
    const currentPort = window.location.port;
    const knownPorts = localStorage.getItem('akii-dev-ports');
    
    // Log port information
    console.log('PrivateRoute: Port check', {
      currentPort,
      knownPorts: knownPorts ? JSON.parse(knownPorts) : null,
      pathname: location.pathname
    });
    
    // If we're on port 5187 (known wrong port), redirect to a known good port
    if (currentPort === '5187' && import.meta.env.DEV) {
      console.log('PrivateRoute: Detected wrong port 5187, redirecting');
      
      // Get the target port from localStorage if available
      const runningInstances = localStorage.getItem('akii-dev-ports');
      const targetPort = runningInstances ? JSON.parse(runningInstances)[0] : '5188';
      
      // Store the current path to redirect after login
      localStorage.setItem('akii-redirect-after-login', location.pathname);
      
      // Create the correct URL
      const correctUrl = window.location.href.replace(`:${currentPort}`, `:${targetPort}`);
      
      // Redirect to the correct port
      window.location.href = correctUrl;
    }
  }, [location.pathname, isLoginPage]);
  
  // Direct check for login status as final fallback
  const checkDirectLoginStatus = () => {
    // Log storage state
    console.log('PrivateRoute: AUTHENTICATION DEBUG - localStorage state:');
    const allStorage = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        allStorage[key] = localStorage.getItem(key);
      }
    }
    console.log(allStorage);
    
    // Ensure localStorage is initialized with defaults before checking
    try {
      // Initialize with default values if not set
      if (!localStorage.getItem('akii-is-logged-in')) {
        localStorage.setItem('akii-is-logged-in', 'false');
      }
      
      if (!localStorage.getItem('akii-login-timestamp')) {
        localStorage.setItem('akii-login-timestamp', '0');
      }
      
      if (!localStorage.getItem('akii-session-duration')) {
        localStorage.setItem('akii-session-duration', (8 * 60 * 60 * 1000).toString());
      }
    } catch (error) {
      console.error('PrivateRoute: Error initializing localStorage', error);
    }
    
    // Check for emergency login state first
    const emergencyLogin = localStorage.getItem('akii-auth-emergency') === 'true';
    if (emergencyLogin) {
      console.log('PrivateRoute: Emergency login detected!');
      const emergencyTimestamp = localStorage.getItem('akii-auth-emergency-time');
      const emergencyUser = localStorage.getItem('akii-auth-fallback-user');
      
      // If emergency data is available, force login state
      if (emergencyTimestamp && emergencyUser) {
        console.log('PrivateRoute: Using emergency login credentials');
        
        // If emergency login was within the last hour, consider it valid
        const currentTime = Date.now();
        const timestamp = parseInt(emergencyTimestamp, 10);
        if (!isNaN(timestamp) && (currentTime - timestamp) < (60 * 60 * 1000)) {
          localStorage.setItem('akii-is-logged-in', 'true');
          
          // Extract user ID from emergency user data
          try {
            const userData = JSON.parse(emergencyUser);
            if (userData && userData.id) {
              console.log('PrivateRoute: Setting user ID from emergency data:', userData.id);
            }
          } catch (error) {
            console.error('PrivateRoute: Error parsing emergency user data', error);
          }
          
          return true;
        } else {
          console.log('PrivateRoute: Emergency login expired, clearing');
          localStorage.removeItem('akii-auth-emergency');
          localStorage.removeItem('akii-auth-emergency-time');
        }
      }
    }
    
    // Check for login in progress state
    const loginInProgress = localStorage.getItem('akii-login-in-progress') === 'true';
    if (loginInProgress) {
      console.log('PrivateRoute: Login in progress detected');
      
      // If there's a user ID, consider it valid during login process
      const userId = localStorage.getItem('akii-auth-user-id');
      if (userId) {
        console.log('PrivateRoute: Using in-progress login state with user ID:', userId);
        return true;
      }
    }
    
    // Check isLoggedIn function result
    const loginStatus = isLoggedIn();
    const userId = localStorage.getItem('akii-auth-user-id');
    
    console.log('PrivateRoute: Direct login check', { 
      loginStatus, 
      userId,
      currentPath: location.pathname
    });
    
    // Analyze individual criteria
    const storedLoginFlag = localStorage.getItem('akii-is-logged-in');
    const loginTimestampStr = localStorage.getItem('akii-login-timestamp');
    
    // Parse the timestamp safely
    let loginTimestamp = 0;
    if (loginTimestampStr && loginTimestampStr !== 'null') {
      try {
        loginTimestamp = parseInt(loginTimestampStr, 10);
        if (isNaN(loginTimestamp)) loginTimestamp = 0;
      } catch (error) {
        console.error('PrivateRoute: Error parsing timestamp', error);
      }
    }
    
    const currentTime = Date.now();
    const timeDiff = currentTime - loginTimestamp;
    const sessionDuration = parseInt(localStorage.getItem('akii-session-duration') || '28800000', 10);
    
    console.log('PrivateRoute: AUTHENTICATION DEBUG - criteria analysis:', {
      storedLoginFlag: storedLoginFlag === 'true',
      hasTimestamp: loginTimestamp > 0,
      hasUserId: !!userId,
      sessionValid: timeDiff < sessionDuration,
      allValid: storedLoginFlag === 'true' && loginTimestamp > 0 && !!userId && timeDiff < sessionDuration
    });
    
    return loginStatus && !!userId;
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      componentMounted.current = false;
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);
  
  // Effect to validate auth and redirect if necessary
  useEffect(() => {
    // Skip validation if already at login page
    if (isLoginPage) {
      console.log('PrivateRoute: Already at login page, skipping validation');
      setIsValid(true);
      return;
    }
    
    // Skip repeated validations if already validated
    if (isValid !== null) return;
    
    const validateAuth = async () => {
      // Avoid multiple validations running simultaneously
      if (isValidating) return;
      
      setIsValidating(true);
      
      try {
        console.log('PrivateRoute: Validating authentication, current path:', location.pathname);
        
        // First priority: Check Direct Auth (our new system)
        console.log('PrivateRoute: Checking direct auth context:', { 
          user: !!directAuth.user,
          userId: directAuth.user?.id,
          profile: !!directAuth.profile,
          isLoading: directAuth.isLoading
        });
        
        if (directAuth.user) {
          console.log('PrivateRoute: User authenticated via Direct Auth');
          
          // If admin route, check admin status
          if (adminOnly && !directAuth.isAdmin) {
            console.log('PrivateRoute: User not an admin, redirecting from admin route');
            setIsValid(false);
            navigate('/dashboard', { replace: true });
            return;
          }
          
          setIsValid(true);
          return;
        }
        
        // Second priority: Check Compatibility Auth
        console.log('PrivateRoute: Checking compatibility auth context:', { 
          user: !!compatAuth.user,
          session: !!compatAuth.session,
          isLoading: compatAuth.isLoading
        });
        
        if (compatAuth.user && compatAuth.session) {
          console.log('PrivateRoute: User authenticated via Compatibility Auth');
          
          // If admin route, check admin status
          if (adminOnly && !compatAuth.isAdmin) {
            console.log('PrivateRoute: User not an admin (compat), redirecting from admin route');
            setIsValid(false);
            navigate('/dashboard', { replace: true });
            return;
          }
          
          setIsValid(true);
          return;
        }
        
        // Third priority: Check direct login status via localStorage
        console.log('PrivateRoute: Falling back to direct localStorage check');
        const directLoginCheck = checkDirectLoginStatus();
        
        if (directLoginCheck) {
          console.log('PrivateRoute: User authenticated via direct localStorage check');
          
          // Force refresh auth on next tick to synchronize contexts
          console.log('PrivateRoute: Triggering auth refresh to synchronize contexts');
          setTimeout(() => {
            directAuth.refreshAuthState();
          }, 0);
          
          setIsValid(true);
          return;
        }
        
        // No authentication at all, redirect to login
        console.log('PrivateRoute: Not authenticated, redirecting to login from:', location.pathname);
        setIsValid(false);
        
        // Prevent redirect loops by checking if we're already being sent to login
        if (location.pathname !== redirectTo) {
          navigate(redirectTo, { 
            replace: true,
            state: { from: location.pathname }
          });
        }
      } catch (error) {
        console.error('PrivateRoute: Error validating auth', error);
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };
    
    // Don't validate while auth is still loading
    if (!effectiveAuthState.isLoading && !isValidating) {
      validateAuth();
    }
  }, [
    directAuth, 
    compatAuth, 
    adminOnly, 
    navigate, 
    redirectTo, 
    location, 
    isValid, 
    isValidating,
    effectiveAuthState.isLoading,
    isLoginPage
  ]);
  
  // If validation is complete and user is authenticated, render children
  if (isValid) {
    return <>{children}</>;
  }
  
  // Otherwise show a loading state
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="w-16 h-16 border-t-4 border-primary rounded-full animate-spin mb-4"></div>
      <p className="text-foreground text-lg">Authenticating...</p>
      <p className="text-muted-foreground text-sm mt-2">Checking login status...</p>
    </div>
  );
};



