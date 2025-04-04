import { emergencySessionReset, forceSessionCheck } from "./auth-lock-fix";
import { toast } from "@/components/ui/use-toast";

/**
 * Setup network interceptors for auth error handling
 * Intercepts all fetch requests to detect authentication issues
 */
export const setupNetworkInterceptors = () => {
  // Store the original fetch function
  const originalFetch = window.fetch;
  let lastAuthErrorTime = 0;
  let authErrorCount = 0;
  
  // Override the fetch function to intercept all network requests
  window.fetch = async function(input, init) {
    try {
      // Make the original request
      const response = await originalFetch(input, init);
      
      // Check for auth-related error responses (401, 403)
      if (response.status === 401 || response.status === 403) {
        const now = Date.now();
        
        // Get URL from input
        let requestUrl = '';
        if (typeof input === 'string') {
          requestUrl = input;
        } else if (input instanceof Request) {
          requestUrl = input.url;
        } else if (input instanceof URL) {
          requestUrl = input.toString();
        }
        
        // Avoid showing too many errors for the same issue
        if (now - lastAuthErrorTime > 10000) {
          console.warn(`Auth error on fetch to ${requestUrl}: ${response.status}`);
          lastAuthErrorTime = now;
          authErrorCount++;
          
          // Dispatch a global auth error event that GlobalErrorHandler can listen for
          window.dispatchEvent(new CustomEvent('akii:auth:error', { 
            detail: { 
              status: response.status,
              url: requestUrl,
              errorCount: authErrorCount
            }
          }));
          
          // If we're seeing persistent auth errors, attempt recovery
          if (authErrorCount > 2) {
            // Force a session check
            try {
              const sessionResult = await forceSessionCheck();
              
              // If no session exists after multiple auth errors, try emergency reset
              if (!sessionResult.data?.session && authErrorCount > 3) {
                console.warn('Multiple auth errors detected with no valid session, performing emergency reset');
                emergencySessionReset();
                window.dispatchEvent(new Event('akii:auth:reset'));
                
                // Show a toast notification to the user
                toast({
                  title: "Authentication Issue",
                  description: "Please try again or refresh the page.",
                  variant: "destructive"
                });
                
                // Reset the error count
                authErrorCount = 0;
              }
            } catch (e) {
              console.error('Error checking session during fetch interceptor:', e);
            }
          }
        } else if (response.ok) {
          // Reset error count on successful requests
          authErrorCount = 0;
        }
      }
      
      return response;
    } catch (error) {
      // Handle network errors
      console.error('Network error in fetch interceptor:', error);
      
      // Pass the error through
      throw error;
    }
  };
  
  console.log('Network interceptors set up for auth error detection');
};

/**
 * Check network connection status
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Add event listener for online status changes
 */
export const addOnlineListener = (callback: () => void): void => {
  window.addEventListener('online', callback);
};

/**
 * Add event listener for offline status changes
 */
export const addOfflineListener = (callback: () => void): void => {
  window.addEventListener('offline', callback);
};

/**
 * Remove event listener for online status changes
 */
export const removeOnlineListener = (callback: () => void): void => {
  window.removeEventListener('online', callback);
};

/**
 * Remove event listener for offline status changes
 */
export const removeOfflineListener = (callback: () => void): void => {
  window.removeEventListener('offline', callback);
}; 