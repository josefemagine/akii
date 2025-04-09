import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/UnifiedAuthContext';
import { LoadingScreen } from '../components/LoadingScreen';

// Debug logging
const debug = (...args: any[]) => console.log('[PrivateRoute]', ...args);

interface PrivateRouteProps {
  requireAdmin?: boolean;
  requireProfile?: boolean;
}

export function PrivateRoute({ 
  requireAdmin = false, 
  requireProfile = true 
}: PrivateRouteProps) {
  const { 
    user, 
    profile, 
    hasProfile,
    authLoading,
    isAdmin
  } = useAuth();

  // Derived states for cleaner logic
  const isAuthenticated = !!user;
  const hasValidProfile = !!profile && hasProfile;

  // Debug state info
  debug('PrivateRoute auth state:', {
    hasUser: isAuthenticated,
    isAdmin,
    isLoading: authLoading,
    hasProfile,
    requireAdmin,
    requireProfile,
    profileRole: profile?.role
  });

  // Still initializing the application
  if (authLoading) {
    return <LoadingScreen message="Loading authentication data..." />;
  }

  // Authentication failed - redirect to login
  if (!isAuthenticated) {
    debug('User not authenticated, redirecting to login page');
    return <Navigate to="/auth/login" replace />;
  }

  // Profile required but missing - redirect to profile setup
  if (requireProfile && !hasValidProfile) {
    debug('Profile required but missing, redirecting to profile setup');
    return <Navigate to="/profile/setup" replace />;
  }

  // Admin access required but user is not admin
  if (requireAdmin && !isAdmin) {
    debug('Admin access required but user is not admin');
    return <Navigate to="/dashboard" replace />;
  }

  // All checks passed - render the protected content
  debug('Auth requirements satisfied, rendering protected route', {
    isAdmin,
    adminOnly: requireAdmin,
    profileRole: profile?.role,
    hasProfile: hasValidProfile
  });
  
  return <Outlet />;
}

export default PrivateRoute;
