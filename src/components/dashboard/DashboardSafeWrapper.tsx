import { isBrowser } from "@/lib/browser-check";
import { useEffect, useState } from "react";

interface DashboardSafeWrapperProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that safely handles potential Chrome extension API calls
 * by checking the environment before rendering the dashboard content
 */
export function DashboardSafeWrapper({ children }: DashboardSafeWrapperProps) {
  const [isSafe, setIsSafe] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    let mounted = true;
    // Only set state if component is still mounted
    if (isBrowser && mounted) {
      // Use a timeout to ensure this doesn't cause a render loop
      const timer = setTimeout(() => {
        if (mounted) {
          setIsSafe(true);
        }
      }, 0);

      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }
    return () => {
      mounted = false;
    };
  }, []);

  if (!isSafe) {
    return null;
  }

  return <>{children}</>;
}
