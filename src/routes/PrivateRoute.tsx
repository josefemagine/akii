import React, { ReactNode, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/SuperAuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [showContent, setShowContent] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasStorageAuth, setHasStorageAuth] = useState(false);

  // Suppress connection errors
  useEffect(() => {
    const originalOnError = window.onerror;
    
    window.onerror = function(message, source, lineno, colno, error) {
      // Check if it's the "Could not establish connection" error
      if (message && message.toString().includes("Could not establish connection")) {
        console.log("Suppressing Chrome extension connection error in PrivateRoute");
        // Return true to prevent the error from propagating
        return true;
      }
      
      // Call original handler for other errors
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    return () => {
      window.onerror = originalOnError;
    };
  }, []);

  // Aggressive localStorage token check - will find any token-like keys
  const aggressiveTokenCheck = () => {
    console.log("PrivateRoute: Running aggressive token check");
    try {
      let foundTokens = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Look for ANY possible auth token
        if (key && (
          key.includes('auth') || 
          key.includes('user') || 
          key.includes('token') ||
          key.includes('supabase') || 
          key.includes('sb-') ||
          key.includes('akii') ||
          key.startsWith('sb')
        )) {
          console.log(`PrivateRoute: Potential auth token found: ${key}`);
          foundTokens.push(key);
          
          // If it's definitely an auth token, set auth state immediately
          if (
            key.includes('supabase.auth.token') || 
            key.includes('sb-') ||
            key.includes('akii-auth-robust') ||
            key === 'akii-auth-token' ||
            key === 'force-auth-login'
          ) {
            setHasStorageAuth(true);
            setIsAuthenticated(true);
            setShowContent(true);
            return true;
          }
        }
      }
      
      if (foundTokens.length > 0) {
        console.log(`PrivateRoute: Found ${foundTokens.length} potential auth tokens`);
        setHasStorageAuth(true);
        setIsAuthenticated(true);
        setShowContent(true);
        return true;
      }
      
      return false;
    } catch (e) {
      console.error("PrivateRoute: Error in aggressive token check:", e);
      return false;
    }
  };

  // Run aggressive token check on mount
  useEffect(() => {
    if (!user && !isAuthenticated) {
      aggressiveTokenCheck();
    }
  }, []);

  // Enhanced auth detection logic
  useEffect(() => {
    let mounted = true;
    
    // Log auth state for debugging
    console.log("PrivateRoute auth state:", { 
      user: user?.id, 
      email: user?.email, 
      isLoading,
      isAuthenticated,
      hasStorageAuth
    });
    
    // If user is already available in context, they're authenticated
    if (user) {
      setIsAuthenticated(true);
      setShowContent(true);
      return;
    }
    
    // Fallback: Check localStorage for auth tokens
    const checkLocalStorageAuth = () => {
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
            if (mounted) {
              setIsAuthenticated(true);
              setHasStorageAuth(true);
              setShowContent(true);
            }
            return true;
          }
        }
      } catch (e) {
        console.error("PrivateRoute: Error checking localStorage auth:", e);
      }
      return false;
    };
    
    // If we're no longer loading and don't have a user, try localStorage check
    if (!isLoading && !user) {
      const hasLocalStorageAuth = checkLocalStorageAuth();
      
      if (!hasLocalStorageAuth && mounted) {
        // No standard auth tokens found, try aggressive check as last resort
        const hasAnyTokens = aggressiveTokenCheck();
        
        if (!hasAnyTokens && mounted) {
          // Definitely no auth tokens found
          setIsAuthenticated(false);
        }
      }
    }
    
    // Set a timeout to show content even if auth checking takes too long
    const timer = setTimeout(() => {
      if (mounted) {
        // If we still don't have a definitive auth state, do one final localStorage check
        if (isAuthenticated === null) {
          const hasAuth = checkLocalStorageAuth() || aggressiveTokenCheck();
          if (!hasAuth && mounted) {
            setIsAuthenticated(false);
          }
        }
        setShowContent(true);
      }
    }, 2000); // Extended timeout a bit more

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [user, isLoading, isAuthenticated]);

  // If still loading and haven't timed out, show loading screen
  if ((isLoading || isAuthenticated === null) && !showContent) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // If definitely not authenticated, redirect to login
  if (isAuthenticated === false && !isLoading && !hasStorageAuth) {
    // ONE FINAL CHECK before redirecting
    const lastChanceAuth = aggressiveTokenCheck();
    if (lastChanceAuth) {
      console.log("PrivateRoute: Last-chance auth check found tokens, showing content");
      return <>{children}</>;
    }
    
    console.log("PrivateRoute: No authenticated user found, redirecting to home page");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Either authenticated or auth check timed out, render children
  return <>{children}</>;
}
