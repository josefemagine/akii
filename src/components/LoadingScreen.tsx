import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";

interface LoadingScreenProps {
  message?: string;
  disableAutoHide?: boolean;
  timeoutMs?: number;
}

export function LoadingScreen({
  message = "Loading...",
  disableAutoHide = false,
  timeoutMs = 10000 // 10 seconds max loading time by default
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
      }, 1500); // 1.5 seconds fallback

      // Show "taking longer than expected" message after 3 seconds
      const longWaitTimer = window.setTimeout(() => {
        setLongWait(true);
      }, 3000); // 3 seconds for long wait message
      
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
        ) : longWait ? (
          <p className="text-sm text-muted-foreground mt-2">
            This is taking longer than expected. Please wait...
          </p>
        ) : null}
      </div>
    </div>
  );
}
