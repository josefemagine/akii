import React from "react";
/**
 * Token Refresh Handler
 *
 * Implements proper error handling for token refresh operations following best practices.
 * This approach follows the suggested fix from the Supabase error message.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { supabase } from "./supabase-singleton.tsx";
interface token-refresh-handlerProps {}

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
        const clearStoredTokens = (): void => {
            console.log("[TokenRefreshHandler] Clearing invalid tokens from storage");
            // Find Supabase tokens
            const supabaseTokenKey = Object.keys(localStorage).find(k => k.startsWith('sb-') || k.includes('supabase.auth.token'));
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
        const redirectToLogin = (): void => {
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
            const originalRefreshAccessToken = supabase.auth._refreshAccessToken;
            if (originalRefreshAccessToken && typeof originalRefreshAccessToken === 'function') {
                // Replace with our wrapped version that handles errors properly
                supabase.auth._refreshAccessToken = function (...args) {
                    return __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        try {
                            // Call the original method
                            const result = yield originalRefreshAccessToken.apply(this, args);
                            // If successful, return the result
                            if (result && !result.error) {
                                return result;
                            }
                            // If we got a 400 error, handle it according to best practices
                            if (((_a = result === null || result === void 0 ? void 0 : result.error) === null || _a === void 0 ? void 0 : _a.status) === 400) {
                                console.log("[TokenRefreshHandler] Received 400 error during token refresh:", result.error);
                                console.error("Refresh token is invalid. Logging out and redirecting to login.");
                                // Clear invalid tokens
                                clearStoredTokens();
                                // Redirect to login if we're on a protected page
                                redirectToLogin();
                                // Return the error to let the application know
                                return result;
                            }
                            // Return the original result for other errors
                            return result;
                        }
                        catch (error) {
                            console.error("[TokenRefreshHandler] Error in refreshAccessToken:", error);
                            // For uncaught errors, also clear tokens and redirect
                            clearStoredTokens();
                            redirectToLogin();
                            // Return a properly formatted error
                            return {
                                data: null,
                                error: {
                                    message: error.message || "Error during token refresh",
                                    status: 500
                                }
                            };
                        }
                    });
                };
                console.log("[TokenRefreshHandler] Successfully applied refresh token error handler");
                handlerApplied = true;
            }
            else {
                console.warn("[TokenRefreshHandler] Could not find _refreshAccessToken method");
            }
        }
        else {
            console.warn("[TokenRefreshHandler] Supabase client not available");
        }
    }
    catch (error) {
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
window.tokenRefreshHandler = {
    apply: applyTokenRefreshHandler,
    handlerApplied
};
