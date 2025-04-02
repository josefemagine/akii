import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/StandardAuthContext';

interface PrivateRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

/**
 * A route component that requires authentication to access
 * Redirects to login if not authenticated
 * Optionally, can restrict access to admin users only
 */
export function PrivateRoute({ children, adminOnly = false }: PrivateRouteProps) {
  const { user, profile, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  // Log authentication state for debugging
  useEffect(() => {
    console.log("PrivateRoute auth state:", { 
      hasUser: !!user, 
      userId: user?.id,
      isLoading,
      isAdmin
    });
  }, [user, isLoading, isAdmin]);

  // If authentication is still loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    // Redirect to login page, but save the current location to redirect back later
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For admin routes, still check if the user is an admin when a user exists
  if (adminOnly && user && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Access is granted - render the children
  return <>{children}</>;
}



