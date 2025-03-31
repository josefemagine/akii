import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "./layout/DashboardLayout";

const AdminRoute: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  
  // Josef override - special access for Josef's email
  const isJosef = user?.email === "josef@holm.com";
  
  // Debug logging
  console.log("AdminRoute debug:", {
    userExists: !!user,
    userEmail: user?.email,
    isAdmin,
    isJosef,
    isLoading
  });
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }
  
  // Grant access if user is admin or Josef
  if (isAdmin || isJosef) {
    return (
      <DashboardLayout isAdmin={true}>
        <Outlet />
      </DashboardLayout>
    );
  }
  
  // Try emergency admin override as last resort
  if (user && localStorage.getItem('akii_admin_override') === 'true' && 
      localStorage.getItem('akii_admin_override_email') === user.email) {
    console.log("Emergency admin override active for:", user.email);
    return (
      <DashboardLayout isAdmin={true}>
        <Outlet />
      </DashboardLayout>
    );
  }
  
  // Redirect non-admin users
  console.warn("Access denied: User is not an admin");
  return <Navigate to="/" replace />;
};

export default AdminRoute;





