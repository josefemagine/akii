import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  redirectTo?: string;
}

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
  const { user, isLoading, isAdmin } = useSupabaseAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="w-12 h-12 border-t-4 border-primary rounded-full animate-spin mb-4"></div>
        <p className="text-foreground text-lg">Loading...</p>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    // Store the current location they were trying to go to
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // If route requires admin privileges and user is not admin, redirect to dashboard
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated (and is admin if required), render the protected route
  return <>{children}</>;
};



