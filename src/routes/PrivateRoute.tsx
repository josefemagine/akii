import React, { ReactNode, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [showContent, setShowContent] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [forceRender, setForceRender] = useState(false);

  // Force show content after a timeout to prevent infinite loading
  useEffect(() => {
    const shortTimer = setTimeout(() => {
      setShowContent(true);
      console.log("PrivateRoute - Short timeout reached, showing content");
    }, 500); // Reduced from 1000ms to 500ms for initial display

    const longTimer = setTimeout(() => {
      setTimeoutReached(true);
      setForceRender(true);
      console.log(
        "PrivateRoute - Long timeout reached, forcing render regardless of auth state",
      );
    }, 1500); // Reduced from 3000ms to 1500ms for forcing render

    return () => {
      clearTimeout(shortTimer);
      clearTimeout(longTimer);
    };
  }, []);

  // Log auth state changes
  useEffect(() => {
    console.log("PrivateRoute - Auth state updated:", {
      isLoading,
      hasUser: !!user,
      timeoutReached,
      showContent,
      forceRender,
      path: location.pathname,
    });
  }, [
    isLoading,
    user,
    timeoutReached,
    showContent,
    forceRender,
    location.pathname,
  ]);

  // Show loading indicator while checking auth, but with a timeout
  if (isLoading && !showContent && !forceRender) {
    console.log("PrivateRoute - Auth is loading, showing loading indicator");
    return <LoadingScreen message="Checking authentication..." />;
  }

  // If not authenticated and not in loading state, and we haven't forced rendering yet
  if (!user && !isLoading && !forceRender) {
    console.log("PrivateRoute - User not authenticated, redirecting to login");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If we've reached the timeout or user is authenticated, render children
  console.log("PrivateRoute - Rendering children", {
    forceRender,
    hasUser: !!user,
    isLoading,
  });

  // Always render children if we've reached the timeout
  if (forceRender) {
    return <>{children}</>;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
