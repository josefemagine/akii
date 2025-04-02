/**
 * Supabase Authentication Refactor
 * 
 * This module provides direct fixes for Supabase's refresh token mechanism
 * by implementing the recommended approach from the error suggestions.
 */

import { supabase } from './supabase-singleton';

// Save original methods
let originalRefreshAccessToken: any = null;

/**
 * Apply targeted fixes to handle expired/invalid refresh tokens gracefully
 * 
 * Implements the suggestions from the Chrome error explanation:
 * 1. Gracefully handle token expiration
 * 2. Redirect to login when tokens are invalid
 * 3. Ensure tokens are securely stored
 */
export function applySupabaseRefactor() {
  console.log("[SupabaseRefactor] Starting Supabase refactoring");
  
  try {
    if (!supabase || !supabase.auth) {
      console.error("[SupabaseRefactor] Supabase client not available");
      return;
    }
    
    // Patch the _refreshAccessToken method
    if ((supabase.auth as any)._refreshAccessToken) {
      console.log("[SupabaseRefactor] Found _refreshAccessToken method, applying patch");
      
      // Store original method
      originalRefreshAccessToken = (supabase.auth as any)._refreshAccessToken;
      
      // Replace with our implementation that properly handles 400 errors
      (supabase.auth as any)._refreshAccessToken = async function(...args: any[]) {
        console.log("[SupabaseRefactor] Executing patched _refreshAccessToken");
        
        try {
          // Try original method first
          const result = await originalRefreshAccessToken.apply(this, args);
          
          // If successful, great!
          if (result && !result.error) {
            return result;
          }
          
          // Handle failure scenarios (400 Bad Request)
          console.log("[SupabaseRefactor] Token refresh failed:", result?.error);
          
          // If we detect a 400 error, it means the refresh token is invalid or expired
          if (result?.error?.status === 400 || (result?.error && 
              (result.error.message?.includes('invalid') || 
               result.error.message?.includes('expired')))) {
            
            console.log("[SupabaseRefactor] Handling expired/invalid refresh token");
            
            // 1. Store a flag indicating we need to re-authenticate
            localStorage.setItem('auth-needs-login', 'true');
            
            // 2. Clear invalid tokens from localStorage to prevent repetitive errors
            // Find Supabase token key
            const supabaseTokenKey = Object.keys(localStorage).find(k => 
              k.startsWith('sb-') || k.includes('supabase.auth.token'));
            
            if (supabaseTokenKey) {
              try {
                // Get current token data to preserve any needed info
                const tokenData = JSON.parse(localStorage.getItem(supabaseTokenKey) || '{}');
                
                // Create a clean version without the invalid refresh token
                if (tokenData.currentSession?.refresh_token) {
                  console.log("[SupabaseRefactor] Cleaning up invalid refresh token");
                  // Mark the token as requiring refresh
                  tokenData.currentSession.expires_at = 0;
                  tokenData.expiresAt = 0;
                  localStorage.setItem(supabaseTokenKey, JSON.stringify(tokenData));
                }
              } catch (e) {
                console.error("[SupabaseRefactor] Error processing token data:", e);
              }
            }
            
            // 3. If we're on the dashboard, redirect to login
            if (window.location.pathname.startsWith('/dashboard')) {
              console.log("[SupabaseRefactor] Redirecting to login due to invalid token");
              // We'll handle the actual redirect in the UI components
              return { 
                data: null, 
                error: { 
                  message: "Session expired - please log in again",
                  status: 401
                }
              };
            }
          }
          
          return result;
        } catch (e) {
          console.error("[SupabaseRefactor] Error in patched _refreshAccessToken:", e);
          
          // Return proper error format
          return { 
            data: null, 
            error: { 
              message: e.message || "Error refreshing token", 
              status: 500 
            }
          };
        }
      };
      
      console.log("[SupabaseRefactor] Successfully patched _refreshAccessToken method");
    } else {
      console.warn("[SupabaseRefactor] Could not find _refreshAccessToken method");
    }
    
    // Also patch the _callRefreshToken method if it exists
    if ((supabase.auth as any)._callRefreshToken) {
      console.log("[SupabaseRefactor] Found _callRefreshToken method, applying patch");
      
      const original_callRefreshToken = (supabase.auth as any)._callRefreshToken;
      
      (supabase.auth as any)._callRefreshToken = async function(...args: any[]) {
        console.log("[SupabaseRefactor] Intercepted _callRefreshToken call");
        
        try {
          // Try original method
          const result = await original_callRefreshToken.apply(this, args);
          return result;
        } catch (error) {
          console.error("[SupabaseRefactor] Error in _callRefreshToken:", error);
          
          // For 400 errors, handle gracefully
          if (error.status === 400 || error.message?.includes('refresh')) {
            localStorage.setItem('auth-needs-login', 'true');
            
            // Return standardized error
            return {
              data: null,
              error: {
                message: "Refresh token expired - please log in again",
                status: 401
              }
            };
          }
          
          throw error;
        }
      };
      
      console.log("[SupabaseRefactor] Successfully patched _callRefreshToken method");
    }
    
    console.log("[SupabaseRefactor] Completed Supabase refactoring");
    
  } catch (e) {
    console.error("[SupabaseRefactor] Error applying Supabase refactor:", e);
  }
}

// Auto-apply in browser environments
if (typeof window !== 'undefined') {
  setTimeout(() => {
    applySupabaseRefactor();
  }, 100);
}

// Export for debugging
(window as any).supabaseRefactor = {
  applySupabaseRefactor,
  originalRefreshAccessToken
}; 