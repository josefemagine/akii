import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";

interface LoadingScreenProps {
  message?: string;
  disableAutoHide?: boolean;
  timeoutMs?: number;
  debugInfo?: Record<string, any>;
}

export function LoadingScreen({
  message = "Loading...",
  disableAutoHide = false,
  timeoutMs = 10000, // 10 seconds max loading time by default
  debugInfo
}: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const [longWait, setLongWait] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const startTime = useRef(Date.now());
  const debugRef = useRef(debugInfo);
  
  // Store debug info
  if (debugInfo) {
    debugRef.current = debugInfo;
  }

  // Force refresh function for stuck loading states
  const forceRefresh = () => {
    console.log("User initiated manual refresh");
    window.location.reload();
  };

  // Close loading screen when page is fully loaded
  useEffect(() => {
    // Skip auto-hide if disabled
    if (disableAutoHide) {
      return;
    }

    console.log("LoadingScreen mounted - checking page load status");

    // Check if document is already loaded
    if (document.readyState === "complete") {
      console.log("Document already complete - hiding loader");
      setVisible(false);
    } else {
      // Add event listener for load completion
      const handleLoad = () => {
        console.log("Page load complete - hiding loader");
        setVisible(false);
      };

      window.addEventListener("load", handleLoad);

      // Auto-hide after a short delay as fallback
      const autoHideTimer = window.setTimeout(() => {
        console.log("LoadingScreen auto-hide timeout triggered");
        setVisible(false);
      }, 1500); // 1.5 seconds fallback

      // Show "taking longer than expected" message after 3 seconds
      const longWaitTimer = window.setTimeout(() => {
        console.log("LoadingScreen long wait detected");
        setLongWait(true);
      }, 3000); // 3 seconds for long wait message
      
      // Show timeout message and refresh button after timeoutMs
      const timeoutTimer = window.setTimeout(() => {
        console.log("LoadingScreen timeout reached, showing refresh option");
        setTimedOut(true);
        // Log debug info on timeout
        if (debugRef.current) {
          console.warn("LoadingScreen timeout debug info:", debugRef.current);
        }
      }, timeoutMs);

      // Track loading time for telemetry
      const loadingTimeTracker = window.setInterval(() => {
        const currentTime = Date.now();
        const loadingTimeSeconds = (currentTime - startTime.current) / 1000;
        
        // Log every 2 seconds
        if (loadingTimeSeconds > 2 && Math.round(loadingTimeSeconds) % 2 === 0) {
          console.log(`Still loading after ${loadingTimeSeconds.toFixed(1)} seconds`);
        }
      }, 1000);

      return () => {
        window.removeEventListener("load", handleLoad);
        window.clearTimeout(autoHideTimer);
        window.clearTimeout(longWaitTimer);
        window.clearTimeout(timeoutTimer);
        window.clearInterval(loadingTimeTracker);
      };
    }
  }, [disableAutoHide, timeoutMs]);

  // If no longer visible, return null (nothing)
  if (!visible) {
    console.log("LoadingScreen has closed");
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
