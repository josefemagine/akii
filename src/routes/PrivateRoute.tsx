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

  useEffect(() => {
    let mounted = true;
    
    const timer = setTimeout(() => {
      if (mounted) {
        setShowContent(true);
      }
    }, 1000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  // If still loading and haven't timed out, show loading screen
  if (isLoading && !showContent) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // If not authenticated, redirect to login
  if (!user && !isLoading) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Either authenticated or timed out, render children
  return <>{children}</>;
}
