import React from "react";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Set up network interceptors to detect authentication errors
 * and refresh the token or redirect to login as needed.
 */
export function setupNetworkInterceptors() {
    console.log('Network interceptors set up for auth error detection');
    // Keep track of active retries to avoid infinite loops
    const retryMap = new Map();
    const maxRetries = 3;
    // Only set up interceptors in browser environment
    if (typeof window === 'undefined')
        return;
    const originalFetch = window.fetch;
    window.fetch = (input, init) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
        const requestKey = `${(init === null || init === void 0 ? void 0 : init.method) || 'GET'}-${url}`;
        const currentRetryCount = retryMap.get(requestKey) || 0;
        try {
            // Handle resource errors with retries
            if (url.includes('supabase.co') && currentRetryCount < maxRetries) {
                try {
                    // Log important profile requests for debugging
                    if (url.includes('/profiles?') || url.includes('/profiles/')) {
                        console.log(`[Network] Fetching profile: ${url.split('?')[0]}`);
interface network-utilsProps {}

                    }
                    const response = yield originalFetch(input, init);
                    // Clear retry count on success
                    if (response.status !== 429 && response.ok) {
                        retryMap.delete(requestKey);
                        // Log successful profile fetches for debugging
                        if (url.includes('/profiles?') || url.includes('/profiles/')) {
                            console.log(`[Network] Profile fetch success: ${url.split('?')[0]}`);
                        }
                    }
                    return response;
                }
                catch (error) {
                    // Only retry on resource errors
                    if (((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('ERR_INSUFFICIENT_RESOURCES')) ||
                        error.code === 429 ||
                        error.name === 'AbortError') {
                        // Increment retry count
                        retryMap.set(requestKey, currentRetryCount + 1);
                        // Calculate exponential backoff delay
                        const delay = Math.min(2 ** currentRetryCount * 500, 5000);
                        console.log(`[Network] Resource error (${error.message}). Retrying ${url.split('?')[0]} in ${delay}ms (${currentRetryCount + 1}/${maxRetries})`);
                        // Wait and retry
                        yield new Promise(resolve => setTimeout(resolve, delay));
                        return window.fetch(input, init);
                    }
                    // For other errors, pass through
                    throw error;
                }
            }
            // Normal fetch for non-Supabase requests
            return yield originalFetch(input, init);
        }
        catch (error) {
            // Standard error handling
            console.log(`[Network] Error in fetch to ${url.split('?')[0]}:`, error.message || error);
            throw error;
        }
    });
}
/**
 * Check network connection status
 */
export const isOnline = (): void => {
    return navigator.onLine;
};
/**
 * Add event listener for online status changes
 */
export const addOnlineListener = (callback): void => {
    window.addEventListener('online', callback);
};
/**
 * Add event listener for offline status changes
 */
export const addOfflineListener = (callback): void => {
    window.addEventListener('offline', callback);
};
/**
 * Remove event listener for online status changes
 */
export const removeOnlineListener = (callback): void => {
    window.removeEventListener('online', callback);
};
/**
 * Remove event listener for offline status changes
 */
export const removeOfflineListener = (callback): void => {
    window.removeEventListener('offline', callback);
};
