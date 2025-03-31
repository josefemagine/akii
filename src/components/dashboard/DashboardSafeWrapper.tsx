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
    if (isBrowser()) {
      setIsSafe(true);
    }
  }, []);

  if (!isSafe) {
    return null;
  }

  return <>{children}</>;
}
