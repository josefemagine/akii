import React, { useEffect, useState } from "react";
import { isExtensionContext } from "@/lib/browser-check";
import { LoadingScreen } from "../LoadingScreen";

interface DashboardSafeWrapperProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that safely handles potential Chrome extension API calls
 * by checking the environment before rendering the dashboard content
 */
const DashboardSafeWrapper: React.FC<DashboardSafeWrapperProps> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasExtensionError, setHasExtensionError] = useState(false);

  useEffect(() => {
    // Check if we're in an extension context but missing listeners
    const checkEnvironment = async () => {
      try {
        // If we're in an extension context, check if listeners are ready
        if (isExtensionContext()) {
          // Set up a promise that will resolve when the listener responds or timeout
          const checkListenerPromise = new Promise<boolean>((resolve) => {
            try {
              // Try to send a test message
              chrome.runtime.sendMessage({ action: "ping" }, (response) => {
                // If we get a response, listeners are working
                if (response && response.status === "ok") {
                  resolve(true);
                } else {
                  resolve(false);
                }
              });

              // Set a timeout in case we don't get a response
              setTimeout(() => resolve(false), 500);
            } catch (err) {
              console.warn("Error checking extension listener:", err);
              resolve(false);
            }
          });

          const hasListener = await checkListenerPromise;
          setHasExtensionError(!hasListener);
        }
      } catch (error) {
        console.error("Error checking extension environment:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkEnvironment();
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Initializing dashboard..." />;
  }

  if (hasExtensionError) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong className="font-medium">Warning:</strong> Extension
                communication error detected. Some features may not work
                correctly. Please refresh the page or check your browser
                extension settings.
              </p>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
};

export default DashboardSafeWrapper;
