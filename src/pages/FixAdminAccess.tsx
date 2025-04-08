import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { Button } from "@/components/ui/button";

const FixAdminAccess: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshAuthState } = useAuth();

  useEffect(() => {
    const fixJosefAdmin = async () => {
      try {
        const email = "josef@holm.com";

        // Set admin override for 30 days
        const now = new Date();
        const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

        // Set in both localStorage and sessionStorage for maximum compatibility
        localStorage.setItem("akii_admin_override", "true");
        localStorage.setItem("akii_admin_override_email", email);
        localStorage.setItem(
          "akii_admin_override_expiry",
          expiry.toISOString(),
        );

        sessionStorage.setItem("akii_admin_override", "true");
        sessionStorage.setItem("akii_admin_override_email", email);
        sessionStorage.setItem(
          "akii_admin_override_expiry",
          expiry.toISOString(),
        );

        // Legacy support
        localStorage.setItem("admin_override", "true");
        localStorage.setItem("admin_override_email", email);
        localStorage.setItem("admin_override_time", Date.now().toString());

        sessionStorage.setItem("admin_override", "true");
        sessionStorage.setItem("admin_override_email", email);
        sessionStorage.setItem("admin_override_time", Date.now().toString());

        // Additional admin flags
        localStorage.setItem("auth-user-role", "admin");
        localStorage.setItem("user-role", "admin");
        localStorage.setItem("akii-auth-role", "admin");
        localStorage.setItem("akii-auth-robust-email", email);
        localStorage.setItem("akii-auth-robust-time", Date.now().toString());
        localStorage.setItem("akii-auth-success", "true");

        // Refresh user to update auth context
        await refreshAuthState();

        console.log("Admin access fixed for Josef");
      } catch (error) {
        console.error("Error fixing admin access:", error);
      }
    };

    if (user?.email === "josef@holm.com") {
      fixJosefAdmin();
    }
  }, [user, refreshAuthState]);

  const handleGoToAdmin = () => {
    navigate("/admin");
  };

  const handleGoToFix = () => {
    navigate("/admin-access-fix");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-6 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin Access Quick Fix</h1>
          <p className="text-muted-foreground mt-2">
            This page automatically applies admin overrides for josef@holm.com
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">
              Admin access overrides have been applied.
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <Button onClick={handleGoToAdmin} className="w-full">
              Go to Admin Dashboard
            </Button>

            <Button
              onClick={handleGoToFix}
              variant="outline"
              className="w-full"
            >
              Go to Advanced Fix Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixAdminAccess;
