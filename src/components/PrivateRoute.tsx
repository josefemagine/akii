import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from './LoadingScreen';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!user) {
    console.log("PrivateRoute - Access denied, redirecting to login");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  console.log("PrivateRoute - Access granted");
  return <>{children}</>;
}



