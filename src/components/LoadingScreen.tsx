import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button.tsx";

interface LoadingScreenProps {
  message?: string;
  disableAutoHide?: boolean;
  timeoutMs?: number;
}

export function LoadingScreen({
  message = "Loading...",
  disableAutoHide = false,
  timeoutMs = 5000 // Reduced from 10000 to 5000 (5 seconds)
}: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const [longWait, setLongWait] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const startTime = useRef(Date.now());

  // Force refresh function for stuck loading states
  const forceRefresh = () => {
    window.location.reload();
  };

  // Close loading screen when page is fully loaded
  useEffect(() => {
    // Skip auto-hide if disabled
    if (disableAutoHide) {
      return;
    }

    // Check if document is already loaded
    if (document.readyState === "complete") {
      setVisible(false);
    } else {
      // Add event listener for load completion
      const handleLoad = () => {
        setVisible(false);
      };

      window.addEventListener("load", handleLoad);

      // Auto-hide after a short delay as fallback
      const autoHideTimer = window.setTimeout(() => {
        setVisible(false);
      }, 1000); // Reduced from 1500 to 1000 milliseconds

      // Show "taking longer than expected" message after 2 seconds (reduced from 3)
      const longWaitTimer = window.setTimeout(() => {
        setLongWait(true);
      }, 2000); 
      
      // Show timeout message and refresh button after timeoutMs
      const timeoutTimer = window.setTimeout(() => {
        setTimedOut(true);
      }, timeoutMs);

      return () => {
        window.removeEventListener("load", handleLoad);
        window.clearTimeout(autoHideTimer);
        window.clearTimeout(longWaitTimer);
        window.clearTimeout(timeoutTimer);
      };
    }
  }, [disableAutoHide, timeoutMs]);

  // If no longer visible, return null (nothing)
  if (!visible) {
    return null;
  }

  // Calculate how long we've been loading
  const loadingTime = Date.now() - startTime.current;
  const showForceRefresh = loadingTime > 3000; // Show refresh button after 3 seconds

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-primary rounded-full"></div>
        {message && <p className="text-lg text-muted-foreground">{message}</p>}
        
        {timedOut ? (
          <div className="flex flex-col items-center mt-4 space-y-2">
            <p className="text-sm text-destructive">
              Loading timed out. There might be a problem.
            </p>
            <Button variant="secondary" onClick={forceRefresh}>
              Refresh Page
            </Button>
          </div>
        ) : showForceRefresh ? (
          <div className="flex flex-col items-center mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              {longWait ? "This is taking longer than expected." : "Loading is slow."}
            </p>
            <Button variant="outline" size="sm" onClick={forceRefresh}>
              Force Refresh
            </Button>
          </div>
        ) : longWait ? (
          <p className="text-sm text-muted-foreground mt-2">
            This is taking longer than expected. Please wait...
          </p>
        ) : null}
      </div>
    </div>
  );
}
