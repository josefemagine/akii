import { useEffect, useState } from "react";

interface LoadingScreenProps {
  message?: string;
  disableAutoHide?: boolean;
}

export function LoadingScreen({ message = "Loading...", disableAutoHide = false }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  
  // Close loading screen when page is fully loaded
  useEffect(() => {
    // Skip auto-hide if disabled
    if (disableAutoHide) {
      return;
    }
    
    console.log("LoadingScreen mounted - checking page load status");
    
    // Check if document is already loaded
    if (document.readyState === 'complete') {
      console.log("Document already complete - hiding loader");
      setVisible(false);
    } else {
      // Add event listener for load completion
      const handleLoad = () => {
        console.log("Page load complete - hiding loader");
        setVisible(false);
      };
      
      window.addEventListener('load', handleLoad);
      
      // Auto-hide after a short delay as fallback
      const autoHideTimer = setTimeout(() => {
        console.log("LoadingScreen auto-hide timeout triggered");
        setVisible(false);
      }, 5000);
      
      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(autoHideTimer);
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
      <div className="logo-pulse mb-4">
        <div className="w-16 h-16 rounded-full bg-primary animate-pulse-glow"></div>
      </div>
      {message && (
        <p className="text-lg text-muted-foreground">{message}</p>
      )}
    </div>
  );
} 