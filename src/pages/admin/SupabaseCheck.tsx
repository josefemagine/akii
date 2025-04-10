import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth.ts";
import { DiagnosticDashboard } from "@/components/admin/diagnostics/DiagnosticDashboard.tsx";

/**
 * SupabaseCheck Page
 * 
 * This page provides diagnostic tools for troubleshooting Supabase services.
 * It has been refactored to use a modular component architecture with:
 * - Diagnostic services (src/services/supabaseDiagnostics.ts)
 * - Custom hooks (src/hooks/useDiagnostics.ts)
 * - Reusable UI components (src/components/admin/diagnostics/*)
 */
export default function SupabaseCheck() {
  const { user, isAdmin } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Check if user is authorized to access this page
  useEffect(() => {
    if (user && isAdmin) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [user, isAdmin]);
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Authentication Required</h1>
          <p className="text-muted-foreground mt-2">
            Please sign in to access Supabase diagnostics.
          </p>
        </div>
      </div>
    );
  }
  
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            Only administrators can access Supabase diagnostics.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <DiagnosticDashboard />
    </div>
  );
} 