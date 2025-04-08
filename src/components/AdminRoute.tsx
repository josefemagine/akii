import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/UnifiedAuthContext";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAdmin, isLoading, user } = useAuth();
  const location = useLocation();

  // If still loading auth state, return a minimal loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // First check if user is logged in
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Then check if user is admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // If user is logged in and is an admin, render the admin content
  return <DashboardLayout isAdmin={true}>{children}</DashboardLayout>;
};

export default AdminRoute;
