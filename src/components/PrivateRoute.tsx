import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/UnifiedAuthContext';

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
export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  adminOnly = false,
  redirectTo = '/',
}) => {
  const { user, sessionLoaded } = useUser();
  const { isAdmin: directIsAdmin, user: directUser } = useAuth();
  const location = useLocation();
  const [circuitOpen, setCircuitOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin using multiple auth contexts
  useEffect(() => {
    // First check standard user context
    const standardAuthAdmin = !!(
      user?.app_metadata?.role === 'admin' || 
      user?.user_metadata?.isAdmin === true ||
      user?.app_metadata?.is_admin === true
    );
    
    // Then check direct auth context admin status
    const directAuthAdmin = !!directIsAdmin;
    
    // Check local storage for admin status (for direct navigation)
    const localStorageAdmin = localStorage.getItem('akii-is-admin') === 'true';
    
    // Special case for specific accounts (especially for development)
    const isJosefUser = 
      (user?.email === 'josef@holm.com') || 
      (directUser?.email === 'josef@holm.com') ||
      (localStorage.getItem('akii-auth-user-email') === 'josef@holm.com');
    
    // Set admin status based on any valid source
    const finalIsAdmin = standardAuthAdmin || directAuthAdmin || localStorageAdmin || isJosefUser;
    
    // Always set local storage based on current determination
    if (finalIsAdmin) {
      localStorage.setItem('akii-is-admin', 'true');
      // Also save email for special case detection
      if (user?.email) {
        localStorage.setItem('akii-auth-user-email', user.email);
      } else if (directUser?.email) {
        localStorage.setItem('akii-auth-user-email', directUser.email);
      }
    }
    
    console.log('PrivateRoute Admin Check:', {
      path: location.pathname,
      standardAuthAdmin,
      directAuthAdmin,
      localStorageAdmin,
      isJosefUser,
      finalIsAdmin,
      userEmail: user?.email || directUser?.email,
      storedEmail: localStorage.getItem('akii-auth-user-email')
    });
    
    setIsAdmin(finalIsAdmin);
  }, [user, directIsAdmin, directUser, location.pathname]);

  // Monitor for redirect loops
  useEffect(() => {
    // Check if circuit breaker should trip
    if (checkCircuitBreaker(location.pathname)) {
      setCircuitOpen(true);
    }
    
    // Regular redirect count logic (as a backup)
    const redirectCount = parseInt(sessionStorage.getItem('redirect-count') || '0');
    const MAX_REDIRECTS = 5;
    const currentTimestamp = Date.now();
    const lastRedirectTime = parseInt(sessionStorage.getItem('last-redirect-time') || '0');
    const ONE_SECOND = 1000;
    
    // Reset redirect count if it's been more than 5 seconds since the last redirect
    if (currentTimestamp - lastRedirectTime > 5 * ONE_SECOND) {
      sessionStorage.setItem('redirect-count', '0');
    } else if (redirectCount >= MAX_REDIRECTS) {
      console.error('PrivateRoute: Too many redirects detected, stopping redirect chain');
      sessionStorage.setItem('redirect-count', '0');
    }
  }, [location.pathname]);

  // Show loading state while checking authentication
  if (!sessionLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="w-12 h-12 border-t-4 border-primary rounded-full animate-spin mb-4"></div>
        <p className="text-foreground text-lg">Loading...</p>
      </div>
    );
  }

  // Circuit breaker triggered - show error screen
  if (circuitOpen) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="max-w-lg p-6 bg-card rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-foreground mb-4">Authentication Circuit Breaker Triggered</h1>
          <p className="text-muted-foreground mb-4">
            We detected a problem with authentication navigation flows. This usually happens when
            the application gets into a redirect loop. The circuit breaker has been triggered to protect your browser.
          </p>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded text-sm font-mono">
              <p>Time: {new Date().toISOString()}</p>
              <p>Path: {location.pathname}</p>
              <p>Redirect Count: {redirectHistory.length}</p>
            </div>
            <button 
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              onClick={() => {
                // Clear all storage that might be causing the loop
                sessionStorage.clear();
                localStorage.clear();
                
                // Manually reset circuit breaker
                window.circuitBroken = false;
                redirectHistory.length = 0;
                if (circuitBreakerTimeout) {
                  window.clearTimeout(circuitBreakerTimeout);
                }
                
                // Force full page reload to start fresh
                window.location.href = '/';
              }}
            >
              Reset Authentication & Start Fresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    // Check if we're already in a redirect loop
    const redirectCount = parseInt(sessionStorage.getItem('redirect-count') || '0');
    const MAX_REDIRECTS = 5;
    
    if (redirectCount >= MAX_REDIRECTS) {
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
    }
    
    // Increment redirect count and store the current time
    sessionStorage.setItem('redirect-count', (redirectCount + 1).toString());
    sessionStorage.setItem('last-redirect-time', Date.now().toString());
    
    // Store the current location they were trying to go to
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // If route requires admin privileges and user is not admin, redirect to dashboard
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Reset redirect count since authentication was successful
  sessionStorage.setItem('redirect-count', '0');
  
  // User is authenticated (and is admin if required), render the protected route
  return <>{children}</>;
};



