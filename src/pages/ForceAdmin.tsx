import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const ForceAdmin = () => {
  const [status, setStatus] = useState("Ready to enable admin access");
  const navigate = useNavigate();

  const enableAdminAccess = () => {
    try {
      // Set the admin override flags in localStorage and sessionStorage
      localStorage.setItem("admin_override", "true");
      localStorage.setItem("admin_override_email", "josef@holm.com");
      sessionStorage.setItem("admin_override", "true");
      sessionStorage.setItem("admin_override_email", "josef@holm.com");
      
      // Force the role to be set
      localStorage.setItem("user_role", "admin");
      sessionStorage.setItem("user_role", "admin");
      
      // Set other necessary flags
      localStorage.setItem("akii-auth-fallback-user", JSON.stringify({
        email: "josef@holm.com",
        role: "admin"
      }));
      
      setStatus("Admin access enabled! You can now access the admin area.");
      
      toast({
        title: "Admin Access Enabled",
        description: "You now have admin access as josef@holm.com.",
      });
    } catch (err) {
      console.error("Error setting admin access:", err);
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
      
      toast({
        title: "Error",
        description: "Failed to enable admin access.",
        variant: "destructive",
      });
    }
  };
  
  const goToAdmin = () => {
    navigate("/admin");
  };
  
  const clearAdminAccess = () => {
    try {
      // Clear the admin override flags
      localStorage.removeItem("admin_override");
      localStorage.removeItem("admin_override_email");
      sessionStorage.removeItem("admin_override");
      sessionStorage.removeItem("admin_override_email");
      localStorage.removeItem("user_role");
      sessionStorage.removeItem("user_role");
      localStorage.removeItem("akii-auth-fallback-user");
      
      setStatus("Admin access cleared.");
      
      toast({
        title: "Admin Access Cleared",
        description: "Admin access has been removed.",
      });
    } catch (err) {
      console.error("Error clearing admin access:", err);
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
      
      toast({
        title: "Error",
        description: "Failed to clear admin access.",
        variant: "destructive",
      });
    }
  };
  
  // On component mount, check current status
  useEffect(() => {
    const adminOverride = localStorage.getItem("admin_override") === "true";
    const adminEmail = localStorage.getItem("admin_override_email");
    
    if (adminOverride && adminEmail === "josef@holm.com") {
      setStatus("Admin access is currently enabled for josef@holm.com");
    }
  }, []);

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Force Admin Access</CardTitle>
          <CardDescription>
            Directly enable admin access for josef@holm.com
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm">{status}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={clearAdminAccess}>
            Clear Admin Access
          </Button>
          <div className="space-x-2">
            <Button onClick={enableAdminAccess}>
              Enable Admin Access
            </Button>
            <Button variant="secondary" onClick={goToAdmin}>
              Go to Admin
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForceAdmin; 