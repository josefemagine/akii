/**
 * Token Refresh Handler
 * 
 * Implements proper error handling for token refresh operations following best practices.
 * This approach follows the suggested fix from the Supabase error message.
 */

import { supabase } from "./supabase-singleton.tsx";

// Track if we've already applied our handler
let handlerApplied = false;

/**
 * Apply token refresh error handler
 * 
 * This follows the best practices from the error suggestion:
 * - Detect token refresh failures (400 errors)
 * - Clear invalid tokens from storage
 * - Redirect to login when appropriate
 */
export function applyTokenRefreshHandler() {
  if (handlerApplied) {
    console.log("[TokenRefreshHandler] Handler already applied");
    return;
  }
  
  console.log("[TokenRefreshHandler] Applying token refresh handler");
  
  try {
    // Function to clear invalid tokens
    const clearStoredTokens = () => {
      console.log("[TokenRefreshHandler] Clearing invalid tokens from storage");
      
      // Find Supabase tokens
      const supabaseTokenKey = Object.keys(localStorage).find(k => 
        k.startsWith('sb-') || k.includes('supabase.auth.token'));
      
      // Clear Supabase tokens
      if (supabaseTokenKey) {
        localStorage.removeItem(supabaseTokenKey);
      }
      
      // Clear any other auth tokens we're using
      const tokensToRemove = [
        'akii-auth-access-token',
        'akii-auth-refresh-token',
        'akii-auth-token',
        'force-auth-login'
      ];
      
      tokensToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      });
      
      // Set flag to indicate we need to login
      localStorage.setItem('auth-needs-login', 'true');
    };
    
    // Function to redirect to login
    const redirectToLogin = () => {
      if (window.location.pathname.startsWith('/dashboard')) {
        console.log("[TokenRefreshHandler] Redirecting to login page");
        
        // Store the current location to redirect back after login
        localStorage.setItem('auth-redirect-after-login', window.location.pathname);
        
        // Use the router if available, otherwise fallback to location
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    };
    
    // Apply the token refresh handler - as recommended in the error suggestions
    if (supabase && supabase.auth) {
      // Get reference to original refreshAccessToken
      const originalRefreshAccessToken = (supabase.auth as any)._refreshAccessToken;
      
      if (originalRefreshAccessToken && typeof originalRefreshAccessToken === 'function') {
        // Replace with our wrapped version that handles errors properly
        (supabase.auth as any)._refreshAccessToken = async function(...args: any[]) {
          try {
            const result = await originalRefreshAccessToken.apply(this, args);
            
            if (result.error) {
              console.warn("[TokenRefreshHandler] Token refresh failed:", result.error);
              
              // If refresh token fails, clean up and redirect to login
              if (result.error.status === 401 || 
                  (result.error.message && result.error.message.toLowerCase().includes('invalid token'))) {
                console.log("[TokenRefreshHandler] Token invalid or expired, clearing auth data");
                
                clearStoredTokens();
                redirectToLogin();
              }
            }
            
            return result;
          } catch (error: unknown) {
            console.error("[TokenRefreshHandler] Error in refreshAccessToken:", error);
            
            // For uncaught errors, also clear tokens and redirect
            clearStoredTokens();
            redirectToLogin();
            
            // Return a properly formatted error
            return { 
              data: null, 
              error: {
                message: error instanceof Error ? error.message : "Error during token refresh",
                status: 500
              }
            };
          }
        };
        
        console.log("[TokenRefreshHandler] Successfully applied refresh token error handler");
        handlerApplied = true;
      } else {
        console.warn("[TokenRefreshHandler] Could not find _refreshAccessToken method");
      }
    } else {
      console.warn("[TokenRefreshHandler] Supabase client not available");
    }
  } catch (error) {
    console.error("[TokenRefreshHandler] Error applying token refresh handler:", error);
  }
}

// Auto-apply in browser environments
if (typeof window !== 'undefined') {
  setTimeout(() => {
    applyTokenRefreshHandler();
  }, 100);
}

// Expose for debugging
(window as any).tokenRefreshHandler = {
  apply: applyTokenRefreshHandler,
  handlerApplied
}; 