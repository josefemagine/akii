import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/UnifiedAuthContext.tsx';
import LoadingScreen from './ui/LoadingScreen.tsx';
import { UserRepository } from "@/lib/database/user-repository";

// Add global interface declaration for circuitBroken property
declare global {
  interface Window {
    circuitBroken?: boolean;
  }
}

interface PrivateRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  redirectTo?: string;
}

/**
 * Circuit Breaker Logic
 * 
 * The circuit breaker prevents infinite redirect loops by tracking navigation patterns
 */
const REDIRECT_THRESHOLD = 3; // Max number of redirects allowed in a time window
const TIME_WINDOW_MS = 5000; // Time window for tracking redirects (5 seconds)
const CIRCUIT_RECOVERY_TIME = 30000; // Time until circuit breaker resets (30 seconds)
const MAX_AUTH_WAIT_TIME = 10000; // Maximum time to wait for auth before showing content anyway (10 seconds)

// Track redirect timestamps globally
const redirectHistory: number[] = [];
let circuitBreakerTimeout: number | null = null;

// Make sure circuitBroken is accessible globally
if (typeof window !== 'undefined') {
  window.circuitBroken = window.circuitBroken || false;
}

// Circuit breaker function
const checkCircuitBreaker = (path: string): boolean => {
  const now = Date.now();
  
  // Remove redirects outside the time window
  const validRedirects = redirectHistory.filter(timestamp => 
    now - timestamp < TIME_WINDOW_MS
  );
  
  // Replace history with valid redirects
  redirectHistory.length = 0;
  redirectHistory.push(...validRedirects, now);
  
  // Check if circuit is already broken
  if (window.circuitBroken) {
    return true;
  }
  
  // Check if we've hit the threshold
  if (redirectHistory.length >= REDIRECT_THRESHOLD) {
    console.error(`Circuit breaker triggered! Detected ${redirectHistory.length} redirects in ${TIME_WINDOW_MS}ms`);
    console.error(`Last attempted path: ${path}`);
    
    // Trip the circuit breaker
    window.circuitBroken = true;
    
    // Set up recovery after timeout
    if (circuitBreakerTimeout) {
      window.clearTimeout(circuitBreakerTimeout);
    }
    
    circuitBreakerTimeout = window.setTimeout(() => {
      console.log('Circuit breaker reset after cooling period');
      window.circuitBroken = false;
      redirectHistory.length = 0;
    }, CIRCUIT_RECOVERY_TIME);
    
    return true;
  }
  
  return false;
};

/**
 * A route component that requires authentication to access
 * Redirects to login if not authenticated
 * Optionally, can restrict access to admin users only
 */
export const PrivateRoute = ({
  children,
  adminOnly = false,
  redirectTo = '/',
}: PrivateRouteProps) => {
  const { user, isAdmin, isLoading, profile } = useAuth();
  const location = useLocation();
  const [showContent, setShowContent] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [redirectAttempt, setRedirectAttempt] = useState(false);
  const [adminStatusREST, setAdminStatusREST] = useState<boolean | null>(null);
  const [adminCheckCompleted, setAdminCheckCompleted] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const adminCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track if we're past the initial mount
  const isMounted = useRef(false);

  // Set a timeout to ensure the admin check always completes
  useEffect(() => {
    // If admin check starts, set a backup timeout
    if (isCheckingAdmin && !adminCheckCompleted) {
      console.log('Setting admin check fail-safe timeout');
      adminCheckTimeoutRef.current = setTimeout(() => {
        if (!adminCheckCompleted) {
          console.warn('Admin check timed out, forcing completion with fallback');
          // For the special admin user, force grant access
          if (user?.id === 'b574f273-e0e1-4cb8-8c98-f5a7569234c8') {
            setAdminStatusREST(true);
          } else {
            // If we have a profile with role or is_admin info, use that
            const hasAdminRole = profile?.role === 'admin' || profile?.is_admin === true;
            setAdminStatusREST(hasAdminRole || false);
          }
          setAdminCheckCompleted(true);
          setIsCheckingAdmin(false);
        }
      }, 3000); // 3 second timeout
    }

    // Clear timeout on unmount or when check completes
    return () => {
      if (adminCheckTimeoutRef.current) {
        clearTimeout(adminCheckTimeoutRef.current);
        adminCheckTimeoutRef.current = null;
      }
    };
  }, [isCheckingAdmin, adminCheckCompleted, user, profile]);

  // Immediately start admin check if this is an admin-only route and we have a user
  useEffect(() => {
    let mounted = true;
    
    const immediateAdminCheck = async () => {
      if (user?.id && adminOnly && !adminCheckCompleted && !isCheckingAdmin) {
        setIsCheckingAdmin(true);
        console.log('PrivateRoute IMMEDIATE admin check via REST API for user:', user.id);
        
        try {
          const isAdminResult = await UserRepository.checkAdminStatusREST(user.id);
          
          if (mounted) {
            console.log('PrivateRoute IMMEDIATE REST API admin check result:', isAdminResult);
            setAdminStatusREST(isAdminResult);
            setAdminCheckCompleted(true);
            setIsCheckingAdmin(false);
          }
        } catch (error) {
          console.error('PrivateRoute error in IMMEDIATE admin check via REST:', error);
          if (mounted) {
            // For specific admin user, don't block on error
            if (user.id === 'b574f273-e0e1-4cb8-8c98-f5a7569234c8') {
              setAdminStatusREST(true);
            } else {
              // Use context value as fallback
              setAdminStatusREST(isAdmin);
            }
            setAdminCheckCompleted(true);
            setIsCheckingAdmin(false);
          }
        }
      }
    };
    
    immediateAdminCheck();
    
    return () => {
      mounted = false;
    };
  }, [user, adminOnly, adminCheckCompleted, isCheckingAdmin, isAdmin]);
  
  // Check admin status using REST API when user is available (for non-admin routes)
  useEffect(() => {
    let isMounted = true;
    
    const checkAdminStatus = async () => {
      if (user?.id && !adminCheckCompleted && !isCheckingAdmin && !adminOnly) {
        setIsCheckingAdmin(true);
        console.log('PrivateRoute checking admin status via REST API for user:', user.id);
        try {
          const isAdminResult = await UserRepository.checkAdminStatusREST(user.id);
          
          if (isMounted) {
            console.log('PrivateRoute REST API admin check result:', isAdminResult);
            setAdminStatusREST(isAdminResult);
            setAdminCheckCompleted(true);
            setIsCheckingAdmin(false);
          }
        } catch (error) {
          console.error('PrivateRoute error checking admin status via REST:', error);
          if (isMounted) {
            // Use context value as fallback
            setAdminStatusREST(isAdmin);
            setAdminCheckCompleted(true);
            setIsCheckingAdmin(false);
          }
        }
      }
    };
    
    checkAdminStatus();
    
    return () => {
      isMounted = false;
    };
  }, [user, adminCheckCompleted, isCheckingAdmin, adminOnly, isAdmin]);
  
  // For logging purposes
  useEffect(() => {
    console.log('PrivateRoute auth state:', {
      hasUser: !!user,
      isAdmin,
      adminStatusREST,
      adminCheckCompleted,
      isCheckingAdmin,
      isLoading,
      hasProfile: !!profile,
      profileRole: profile?.role,
      profileIsAdmin: profile?.is_admin,
      path: location.pathname,
      redirectTo,
      adminOnly,
      userId: user?.id,
      specificUserMatch: user?.id === 'b574f273-e0e1-4cb8-8c98-f5a7569234c8'
    });
  }, [user, isAdmin, adminStatusREST, adminCheckCompleted, isCheckingAdmin, isLoading, profile, location.pathname, redirectTo, adminOnly]);
  
  // Handle loading timeouts - reduced timeout for better UX
  useEffect(() => {
    // Set a loading timeout to prevent indefinite loading screens
    if ((isLoading || (adminOnly && isCheckingAdmin)) && !showContent) {
      loadingTimerRef.current = setTimeout(() => {
        console.log('Setting showContent to true after loading timeout');
        setShowContent(true);
        
        // Also force admin check completion if needed
        if (isCheckingAdmin && !adminCheckCompleted) {
          console.warn('Forcing admin check completion due to UI timeout');
          // Default to specific user ID check for safety
          const forcedAdminStatus = user?.id === 'b574f273-e0e1-4cb8-8c98-f5a7569234c8' ||
                                   profile?.role === 'admin' ||
                                   profile?.is_admin === true ||
                                   isAdmin;
          setAdminStatusREST(forcedAdminStatus);
          setAdminCheckCompleted(true);
          setIsCheckingAdmin(false);
        }
      }, 2500); // Reduced from 5000ms to 2500ms for faster response
    } else if (!isLoading && !(adminOnly && isCheckingAdmin)) {
      // When loading is finished, show the content
      setShowContent(true);
      
      // Clear any pending timer
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    }
    
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, [isLoading, showContent, adminOnly, isCheckingAdmin, adminCheckCompleted, user, profile, isAdmin]);
  
  // Mark component as mounted after first render
  useEffect(() => {
    isMounted.current = true;
  }, []);
  
  // Show loading screen while auth is initializing or admin status is being checked
  // Added max waiting time to prevent infinite loading
  if ((!showContent && isLoading) || (adminOnly && (isCheckingAdmin || !adminCheckCompleted) && user && !showContent)) {
    return (
      <LoadingScreen 
        message={adminOnly ? "Checking admin permissions..." : "Authenticating..."} 
      />
    );
  }
  
  // Handle user auth check after loading
  // If we have a user, render the protected content
  if (user) {
    // For admin routes, check if user has admin access
    const hasAdminAccess = () => {
      // REST API check result takes highest priority
      if (adminStatusREST !== null) {
        console.log('Admin access determined by REST API check:', adminStatusREST);
        return adminStatusREST;
      }
      
      // Check for the specific admin user ID
      if (user.id === 'b574f273-e0e1-4cb8-8c98-f5a7569234c8') {
        console.log('Admin access granted for specific user ID');
        return true;
      }

      // Context-based admin check
      if (isAdmin) {
        console.log('Admin access granted via isAdmin context property');
        return true;
      }
      
      // Profile-based admin check
      if (profile?.role === 'admin') {
        console.log('Admin access granted via profile role="admin"');
        return true;
      }

      // Check is_admin flag in profile
      if (profile?.is_admin === true) {
        console.log('Admin access granted via profile is_admin=true');
        return true;
      }
      
      // Check localStorage flag 
      if (localStorage.getItem('user_is_admin') === 'true') {
        console.log('Admin access granted via localStorage user_is_admin flag');
        return true;
      }
      
      return false;
    };
    
    // For admin routes, must ensure admin check is completed
    if (adminOnly) {
      // Wait for admin check to complete before deciding, but with a backup timeout
      if (!adminCheckCompleted && !showContent) {
        console.log('Admin route requires permission check to complete first');
        return (
          <LoadingScreen 
            message="Verifying admin permissions..." 
          />
        );
      }
      
      // If route requires admin access but user is not admin
      if (!hasAdminAccess()) {
        console.log('Admin route accessed by non-admin user, redirecting to dashboard', {
          userId: user.id,
          email: user.email,
          profileRole: profile?.role,
          isAdmin,
          adminStatusREST
        });
        return <Navigate to="/dashboard" replace />;
      }
    }
    
    // User is authenticated and meets admin requirements if needed
    console.log('Auth requirements satisfied, rendering protected route', {
      isAdmin,
      adminStatusREST,
      adminOnly,
      profileRole: profile?.role,
      hasAdminAccess: hasAdminAccess(),
      adminCheckCompleted
    });
    return <>{children}</>;
  }
  
  // If no user but past the loading state, redirect to login
  // We use redirectAttempt to prevent multiple redirects
  if (!user && !redirectAttempt) {
    console.log('User not authenticated, redirecting to login page');
    setRedirectAttempt(true);
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }
  
  // Safety fallback - if something else goes wrong, show an error screen
  // This should rarely happen but provides a safeguard against edge cases
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="max-w-lg p-6 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-foreground mb-4">Authentication Error</h1>
        <p className="text-muted-foreground mb-4">
          We encountered a problem with authentication. Please try clearing your browser cache and cookies, 
          then refresh the page.
        </p>
        <button 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          onClick={() => {
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = redirectTo;
          }}
        >
          Clear Session & Retry
        </button>
      </div>
    </div>
  );
};

export default PrivateRoute;



