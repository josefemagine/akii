import { useEffect, useState } from "react";

interface LoadingScreenProps {
  message?: string;
  disableAutoHide?: boolean;
}

export function LoadingScreen({
  message = "Loading...",
  disableAutoHide = false,
}: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const [longWait, setLongWait] = useState(false);

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

      // Auto-hide after a very short delay as fallback
      const autoHideTimer = setTimeout(() => {
        console.log("LoadingScreen auto-hide timeout triggered");
        setVisible(false);
      }, 1500); // Reduced from 3000ms to 1500ms

      // Show "taking longer than expected" message after 3 seconds
      const longWaitTimer = setTimeout(() => {
        console.log("LoadingScreen long wait detected");
        setLongWait(true);
      }, 3000); // Reduced from 5000ms to 3000ms

      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(autoHideTimer);
        clearTimeout(longWaitTimer);
      };
    }
  }, [disableAutoHide]);

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
        {longWait && (
          <p className="text-sm text-muted-foreground mt-2">
            This is taking longer than expected. Please wait...
          </p>
        )}
      </div>
    </div>
  );
}
