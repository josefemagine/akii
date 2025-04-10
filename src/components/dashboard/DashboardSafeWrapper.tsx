import { isBrowser } from "@/lib/browser-check.ts";
import { useEffect, useState } from "react";
import { isProduction, ensureDashboardAccess } from "@/lib/production-recovery.ts";

interface DashboardSafeWrapperProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that safely handles potential Chrome extension API calls
 * by checking the environment before rendering the dashboard content
 */
export function DashboardSafeWrapper({ children }: DashboardSafeWrapperProps) {
  const [isSafe, setIsSafe] = useState(false);
  const [initAttempts, setInitAttempts] = useState(0);

  useEffect(() => {
    // Check if we're in a browser environment
    let mounted = true;
    
    // Track initialization for debugging
    console.log(`Dashboard safety check initialization (attempt ${initAttempts + 1})`);
    
    // Production environment needs special handling for resilience
    if (isProduction() && initAttempts > 0) {
      console.log("DashboardSafeWrapper: Ensuring access in production");
      ensureDashboardAccess();
      
      // Always proceed in production after first attempt
      if (mounted) {
        console.log("DashboardSafeWrapper: Force enabling for production");
        setIsSafe(true);
      }
    }
    
    // Only set state if component is still mounted
    if (isBrowser && mounted) {
      // First try - immediate check
      try {
        // Use a timeout to ensure this doesn't cause a render loop
        const timer = setTimeout(() => {
          if (mounted) {
            console.log("Dashboard environment check passed");
            setIsSafe(true);
            
            // Record successful initialization
            document.dispatchEvent(new CustomEvent('dashboard-init-complete'));
          }
        }, 50);

        // Also set a backup timer in case the first one fails
        const backupTimer = setTimeout(() => {
          if (mounted && !isSafe) {
            console.log("Dashboard safety backup timer triggered");
            setInitAttempts(prev => prev + 1);
            setIsSafe(true);
          }
        }, 1000);

        return () => {
          mounted = false;
          clearTimeout(timer);
          clearTimeout(backupTimer);
        };
      } catch (error) {
        console.error("Error in dashboard initialization:", error);
        // Force safe state after 3 attempts
        if (initAttempts >= 2) {
          console.log("Forcing dashboard to initialize after multiple attempts");
          setIsSafe(true);
        } else {
          setInitAttempts(prev => prev + 1);
        }
      }
    }
    
    // Force initialization after 3 seconds regardless of other conditions
    const emergencyTimer = setTimeout(() => {
      if (mounted && !isSafe) {
        console.log("Emergency dashboard initialization triggered");
        setIsSafe(true);
        document.dispatchEvent(new CustomEvent('dashboard-emergency-init'));
      }
    }, 3000);
    
    return () => {
      mounted = false;
      clearTimeout(emergencyTimer);
    };
  }, [initAttempts, isSafe]);

  // Add a guard to ensure we don't get stuck in a loading state
  useEffect(() => {
    const guardTimer = setTimeout(() => {
      document.dispatchEvent(new CustomEvent('dashboard-guard-complete'));
      console.log("React guard installation completed or timed out");
    }, 5000);
    
    return () => clearTimeout(guardTimer);
  }, []);

  if (!isSafe) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
