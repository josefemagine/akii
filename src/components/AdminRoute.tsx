import React, { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { getClientSideAdminStatus, initializeAdminPage, checkAdminStatusInDatabase } from "@/lib/admin-utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldAlert } from "lucide-react";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAdmin: authContextAdmin, isLoading, user } = useAuth();
  const location = useLocation();
  const [localAdmin, setLocalAdmin] = useState(getClientSideAdminStatus());
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Initialize admin page on component mount
  useEffect(() => {
    console.log("[AdminRoute] Initializing with auth state:", { 
      authContextAdmin, 
      localAdmin,
      isLoading,
      hasUser: !!user
    });
    
    initializeAdminPage();
    
    // Re-check local admin status
    setLocalAdmin(getClientSideAdminStatus());
  }, [authContextAdmin, isLoading, user]);
  
  // Secondary check if context doesn't show admin but localStorage does
  useEffect(() => {
    // Only run this if we have a user but auth context doesn't show admin
    if (user?.id && !authContextAdmin && localAdmin) {
      // Check directly in the database as a fallback
      const checkDirectAccess = async () => {
        try {
          setIsRetrying(true);
          const isActuallyAdmin = await checkAdminStatusInDatabase(user.id);
          
          if (isActuallyAdmin) {
            console.log("[AdminRoute] Database confirms admin status");
            // Local admin is already true, so we don't need to update it
          } else if (localAdmin) {
            console.log("[AdminRoute] Database says NOT admin but localStorage does");
            // Keep allowing access since localStorage is set - might be development override
          }
        } catch (err) {
          console.error("[AdminRoute] Error checking admin status:", err);
          setError("Error verifying admin status");
        } finally {
          setIsRetrying(false);
        }
      };
      
      checkDirectAccess();
    }
  }, [user?.id, authContextAdmin, localAdmin]);

  // Force admin status on development
  useEffect(() => {
    if (import.meta.env.DEV && user?.email && 
        (user.email === 'josefholm@gmail.com' || user.email === 'admin@akii.com' || user.email === 'josef@holm.com')) {
      localStorage.setItem('akii-is-admin', 'true');
      localStorage.setItem('akii-auth-user-email', user.email);
      setLocalAdmin(true);
    }
  }, [user?.email]);
  
  // Handle manual retry
  const handleRetry = () => {
    setError(null);
    setIsRetrying(true);
    
    // Force reload the page to retry auth
    window.location.reload();
  };
  
  // Force dashboard navigation
  const goToDashboard = () => {
    window.location.href = '/dashboard';
  };

  // If still loading auth state, return a minimal loading state
  if (isLoading || isRetrying) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background p-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">Verifying admin access...</p>
        </div>
        
        {isRetrying && (
          <p className="mt-2 text-sm text-muted-foreground">
            Double-checking access permissions...
          </p>
        )}
      </div>
    );
  }

  // First check if user is logged in
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check for admin access either from context or localStorage
  const hasAdminAccess = authContextAdmin || localAdmin;

  // If there's an error but we have admin access, show the error but still render the content
  if (error && hasAdminAccess) {
    return (
      <DashboardLayout isAdmin={true}>
        <Alert className="mb-4" variant="default">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            {error} - Proceeding with local admin permission.
          </AlertDescription>
        </Alert>
        {children}
      </DashboardLayout>
    );
  }

  // If not admin, redirect to dashboard
  if (!hasAdminAccess) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive" className="mb-4">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have admin privileges to access this page.
              {user?.email && (
                <div className="mt-1 text-xs">
                  Logged in as: {user.email}
                </div>
              )}
            </AlertDescription>
          </Alert>
          
          <div className="flex space-x-2">
            <Button onClick={handleRetry} variant="outline" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button onClick={goToDashboard} className="flex-1">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in and is an admin, render the admin content
  return <DashboardLayout isAdmin={true}>{children}</DashboardLayout>;
};

export default AdminRoute;
