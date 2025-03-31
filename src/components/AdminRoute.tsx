import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "./layout/DashboardLayout";

const AdminRoute: React.FC = () => {
  const { user, isAdmin, isLoading, bypassAdminCheck } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Josef override - special access for Josef's email
  const isJosef = user?.email === "josef@holm.com";

  // Check for admin override in localStorage
  const hasAdminOverride =
    user &&
    ((localStorage.getItem("akii_admin_override") === "true" &&
      localStorage.getItem("akii_admin_override_email") === user.email) ||
      (localStorage.getItem("admin_override") === "true" &&
        localStorage.getItem("admin_override_email") === user.email));

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsVerifying(false);

      // Force access for Josef
      if (isJosef) {
        console.log("Granting access to Josef via special override");
        setHasAccess(true);

        // Set admin override for Josef
        localStorage.setItem("akii_admin_override", "true");
        localStorage.setItem("akii_admin_override_email", "josef@holm.com");
        localStorage.setItem(
          "akii_admin_override_expiry",
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        );
      } else if (isAdmin || hasAdminOverride) {
        console.log("Access granted via admin role or override");
        setHasAccess(true);
      }
    }, 2000); // 2 second timeout

    return () => clearTimeout(timeoutId);
  }, [user, isAdmin, isJosef, hasAdminOverride]);

  // Debug logging
  console.log("AdminRoute debug:", {
    userExists: !!user,
    userEmail: user?.email,
    isAdmin,
    isJosef,
    hasAdminOverride,
    isLoading,
    isVerifying,
    hasAccess,
  });

  // Show loading state
  if (isLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Grant access if user is admin, Josef, or has admin override
  if (isAdmin || isJosef || hasAccess || hasAdminOverride) {
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
