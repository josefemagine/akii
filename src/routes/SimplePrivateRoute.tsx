import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/SimpleDashboardLayout";
import { LoadingScreen } from "@/components/LoadingScreen";

interface PrivateRouteProps {
  children?: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <DashboardLayout>{children || <Outlet />}</DashboardLayout>;
};

export default PrivateRoute;
