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
 * SUPABASE SINGLETON CLIENT
 * Ensures a single instance of Supabase clients across the application
 */
import { createClient } from '@supabase/supabase-js';
// Environment variables with better error handling and fallbacks
function getSupabaseConfig() {
    // Try to get values from different sources
    let url = '';
    let anonKey = '';
    let serviceKey = '';
    try {
        // First try import.meta.env (Vite standard)
        url = import.meta.env.VITE_SUPABASE_URL || '';
        anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
        serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
interface SUPABASE_SINGLETON_KEYProps {}

        // Check if we have values from a global ENV object (sometimes used in production)
        if ((!url || !anonKey) && typeof window !== 'undefined' && window.ENV) {
            url = url || window.ENV.VITE_SUPABASE_URL || window.ENV.SUPABASE_URL || '';
            anonKey = anonKey || window.ENV.VITE_SUPABASE_ANON_KEY || window.ENV.SUPABASE_ANON_KEY || '';
            serviceKey = serviceKey || window.ENV.VITE_SUPABASE_SERVICE_ROLE_KEY || window.ENV.SUPABASE_SERVICE_KEY || '';
        }
    }
    catch (error) {
        console.error('Error accessing Supabase environment variables:', error);
    }
    // Validate and warn
    if (!url) {
        console.error('Missing required Supabase URL. Authentication will not work.');
    }
    if (!anonKey) {
        console.error('Missing required Supabase anon key. Authentication will not work.');
    }
    return { url, anonKey, serviceKey };
}
const { url: supabaseUrl, anonKey: supabaseAnonKey, serviceKey: supabaseServiceKey } = getSupabaseConfig();
// Use Symbol for truly private singleton storage
const SUPABASE_SINGLETON_KEY = Symbol.for('__SUPABASE_GLOBAL_SINGLETON__');
// Create global singleton object with our symbol key
const globalSingleton = Object.create({});
// Use a function to create and get the client to prevent duplication
function getOrCreateSupabaseClient() {
    var _a;
    // Check if we already have an instance in the window object (browser-only)
    if (typeof window !== 'undefined') {
        // Check any of the possible window globals that might contain a client instance
        if (window.__supabaseClient) {
            console.log('Using existing Supabase client from window.__supabaseClient');
            return window.__supabaseClient;
        }
        if (window.__supabase) {
            console.log('Using existing Supabase client from window.__supabase');
            return window.__supabase;
        }
        if ((_a = window.__SUPABASE_SINGLETON) === null || _a === void 0 ? void 0 : _a.client) {
            console.log('Using existing Supabase client from window.__SUPABASE_SINGLETON');
            return window.__SUPABASE_SINGLETON.client;
        }
    }
    // Check if we already have a singleton instance
    if (SUPABASE_SINGLETON_KEY in globalSingleton) {
        console.log('Using existing Supabase client from singleton');
        return globalSingleton[SUPABASE_SINGLETON_KEY].client;
    }
    // Create a new Supabase client if none exists
    console.log('Creating new Supabase singleton client with URL:', supabaseUrl || 'MISSING URL');
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Critical error: Missing Supabase configuration. Authentication will not work properly.');
    }
    // Configure a more reliable fetch function with enhanced error handling
    const enhancedFetch = (url, options) => __awaiter(this, void 0, void 0, function* () {
        // Use a longer timeout for auth requests
        const isAuthRequest = url.toString().includes('/auth/') ||
            url.toString().includes('/token?') ||
            url.toString().includes('/oidc/');
        // Set timeout based on request type - auth requests need more time
        const timeout = isAuthRequest ? 60000 : 30000; // 60 seconds for auth, 30 for others
        // Create an abort controller for the timeout
        const controller = new AbortController();
        // Save the original signal if one was provided
        const originalSignal = options === null || options === void 0 ? void 0 : options.signal;
        // Create a combined signal that aborts if either original signal or our timeout aborts
        if (originalSignal) {
            // Listen for abort on the original signal
            const abortListener = (): void => {
                controller.abort(originalSignal.reason);
            };
            if (originalSignal.aborted) {
                // Original signal was already aborted before we got here
                controller.abort(originalSignal.reason);
            }
            else {
                // Add abort listener
                originalSignal.addEventListener('abort', abortListener);
                // Clean up the listener if our controller aborts
                controller.signal.addEventListener('abort', () => {
                    originalSignal.removeEventListener('abort', abortListener);
                });
            }
        }
        // Add the signal to the options
        const fetchOptions = Object.assign(Object.assign({}, (options || {})), { signal: controller.signal, keepalive: true, mode: 'cors' });
        // If this is an auth request, use a specific configuration for auth endpoints
        if (isAuthRequest) {
            // Override existing options for auth requests specifically
            fetchOptions.credentials = 'omit'; // Explicitly omit credentials for auth requests
        }
        // Create the timeout
        const timeoutId = setTimeout(() => {
            console.warn(`[Supabase] Request timeout (${timeout}ms): ${url.toString()}`);
            controller.abort(new DOMException('Request timed out', 'TimeoutError'));
        }, timeout);
        try {
            // Add retry logic for auth requests
            if (isAuthRequest) {
                let retries = 0;
                const maxRetries = 2;
                while (retries <= maxRetries) {
                    try {
                        const response = yield fetch(url, fetchOptions);
                        clearTimeout(timeoutId);
                        return response;
                    }
                    catch (error) {
                        retries++;
                        console.warn(`[Supabase] Auth request retry ${retries}/${maxRetries}: ${url.toString()}`);
                        // If the request was aborted by our timeout or we've exceeded max retries, throw
                        if (error instanceof DOMException && error.name === 'AbortError' ||
                            retries > maxRetries) {
                            throw error;
                        }
                        // Wait before retrying (exponential backoff)
                        yield new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries - 1)));
                    }
                }
            }
            // For non-auth requests or if auth retries exceeded, make a normal request
            const response = yield fetch(url, fetchOptions);
            clearTimeout(timeoutId);
            return response;
        }
        catch (error) {
            clearTimeout(timeoutId);
            // Better classify the error
            if (error instanceof DOMException && error.name === 'AbortError') {
                // Check if this was our timeout or an external abort
                const isOurTimeout = error.message === 'Request timed out' ||
                    error.message.includes('timed out');
                if (isOurTimeout) {
                    console.error(`[Supabase] Request timed out after ${timeout}ms: ${url.toString()}`);
                }
                else {
                    console.warn(`[Supabase] Request was aborted: ${url.toString()}`);
                }
            }
            else {
                // Log detailed error information
                console.error(`[Supabase] Fetch error for ${url.toString()}:`, error);
            }
            // Enhance the error with additional context
            if (error instanceof Error) {
                error.message = `Supabase request failed: ${error.message} (URL: ${url.toString().substring(0, 100)}...)`;
            }
            // Rethrow the error
            throw error;
        }
    });
    const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            storageKey: 'sb-injxxchotrvgvvzelhvj-auth-token',
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
            debug: false, // Always disable debug mode to reduce console noise and lock issues
            // Configure to store data more reliably with better error handling
            storage: {
                getItem: (key) => {
                    try {
                        const item = localStorage.getItem(key);
                        return item;
                    }
                    catch (error) {
                        console.error('[Supabase Storage] Error accessing localStorage:', error);
                        // Try to gracefully handle localStorage errors
                        if (typeof sessionStorage !== 'undefined') {
                            try {
                                return sessionStorage.getItem(key);
                            }
                            catch (e) {
                                console.error('[Supabase Storage] Fallback storage error:', e);
                            }
                        }
                        return null;
                    }
                },
                setItem: (key, value) => {
                    try {
                        localStorage.setItem(key, value);
                    }
                    catch (error) {
                        console.error('[Supabase Storage] Error writing to localStorage:', error);
                        // Try to gracefully handle localStorage errors
                        if (typeof sessionStorage !== 'undefined') {
                            try {
                                sessionStorage.setItem(key, value);
                            }
                            catch (e) {
                                console.error('[Supabase Storage] Fallback storage error:', e);
                            }
                        }
                    }
                },
                removeItem: (key) => {
                    try {
                        localStorage.removeItem(key);
                    }
                    catch (error) {
                        console.error('[Supabase Storage] Error removing from localStorage:', error);
                        // Try to gracefully handle localStorage errors
                        if (typeof sessionStorage !== 'undefined') {
                            try {
                                sessionStorage.removeItem(key);
                            }
                            catch (e) {
                                console.error('[Supabase Storage] Fallback storage error:', e);
                            }
                        }
                    }
                }
            }
        },
        // Global fetch options to improve reliability
        global: {
            fetch: enhancedFetch,
            headers: {
                'X-Client-Info': 'Akii WebApp'
            }
        }
    });
    // Prevent CORS issues by patching the auth API fetch
    try {
        // Monkey patch the auth API method to fix CORS issues
        const originalSignIn = client.auth.signInWithPassword;
        // @ts-ignore - We're intentionally patching this
        client.auth.signInWithPassword = function (credentials) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                try {
                    // Try the normal method first
                    return yield originalSignIn.call(this, credentials);
                }
                catch (error) {
                    // If we hit a CORS error, try the direct method
                    if (((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('CORS')) ||
                        ((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes('Failed to fetch')) ||
                        error.name === 'TypeError') {
                        console.log('[Auth] Caught CORS error in signInWithPassword, using direct approach');
                        // Use direct API approach that avoids CORS issues
                        // Access safely from credentials with type checking
                        const email = 'email' in credentials ? credentials.email : '';
                        const password = 'password' in credentials ? credentials.password : '';
                        if (!email || !password) {
                            throw new Error('Email and password are required');
                        }
                        const supabaseAuthUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;
                        const response = yield fetch(supabaseAuthUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'apikey': supabaseAnonKey,
                                'X-Client-Info': 'Akii Web App'
                            },
                            body: JSON.stringify({ email, password }),
                            credentials: 'omit' // Important! Don't include credentials
                        });
                        if (!response.ok) {
                            const errorData = yield response.json();
                            throw new Error(errorData.error_description || errorData.error || 'Authentication failed');
                        }
                        const data = yield response.json();
                        // Manually set the token in localStorage
                        try {
                            const key = `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
                            localStorage.setItem(key, JSON.stringify({
                                access_token: data.access_token,
                                refresh_token: data.refresh_token,
                                expires_at: Math.floor(Date.now() / 1000) + data.expires_in
                            }));
                        }
                        catch (storageError) {
                            console.error('[Auth] Error storing auth token:', storageError);
                        }
                        // Return in expected format
                        return {
                            data: {
                                session: {
                                    access_token: data.access_token,
                                    refresh_token: data.refresh_token,
                                    expires_in: data.expires_in,
                                    user: data.user
                                },
                                user: data.user
                            },
                            error: null
                        };
                    }
                    // If it's not a CORS error, rethrow
                    throw error;
                }
            });
        };
        console.log('[Supabase] Client auth methods patched for CORS protection');
    }
    catch (patchError) {
        console.error('[Supabase] Failed to patch auth methods:', patchError);
    }
    // Store the client in global singleton
    globalSingleton[SUPABASE_SINGLETON_KEY] = {
        client,
        initialized: true,
    };
    // Store in window for cross-reference detection (browser-only)
    if (typeof window !== 'undefined') {
        window.__supabaseClient = client;
        window.__supabase = client;
        window.__SUPABASE_SINGLETON = {
            client,
            initialized: true
        };
    }
    return client;
}
// Initialize the client once and export it
export const supabase = getOrCreateSupabaseClient();
// For backward compatibility
export const auth = supabase.auth;
// Create a minimal admin client that just forwards to the regular client
// This maintains backwards compatibility with existing code
export const supabaseAdmin = supabase;
// Admin client capabilities are initialized lazily
let adminInitialized = false;
// Create browser-specific client for browser environments
export function createBrowserClient() {
    // Return the singleton instance for browser
    return supabase;
}
// Get cookie-based client (only relevant for SSR/Next.js, here just returns the normal client)
export function createServerClient() {
    return supabase;
}
// Initialize admin capabilities if needed
export function initAdminCapabilities() {
    return __awaiter(this, void 0, void 0, function* () {
        if (adminInitialized)
            return;
        console.log('Initializing admin client capabilities...');
        // Here we could set up admin-specific functionality
        adminInitialized = true;
    });
}
// Refresh session - similar to the middleware function in Next.js
export function refreshSession() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield supabase.auth.getSession();
            if (error)
                throw error;
            if (data === null || data === void 0 ? void 0 : data.session) {
                // Refresh user if session exists
                const { data: userData, error: userError } = yield supabase.auth.getUser();
                if (userError)
                    throw userError;
                return {
                    session: data.session,
                    user: (userData === null || userData === void 0 ? void 0 : userData.user) || null
                };
            }
            return { session: null, user: null };
        }
        catch (error) {
            console.error('Error refreshing session:', error);
            return { session: null, user: null, error };
        }
    });
}
// Helper to clear all auth data from localStorage
export function clearAllAuthData() {
    try {
        const authRelatedKeys = [];
        // Find all auth-related keys with more comprehensive pattern matching
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('supabase') ||
                key.includes('sb-') ||
                key.includes('akii-auth') ||
                key.includes('force-auth-login') ||
                key.includes('token') ||
                key.includes('auth') ||
                key.startsWith('auth-') ||
                key.endsWith('-auth') ||
                key.includes('-auth-'))) {
                authRelatedKeys.push(key);
            }
        }
        // Remove all auth-related keys
        if (authRelatedKeys.length > 0) {
            console.log(`Found ${authRelatedKeys.length} auth tokens to remove:`, authRelatedKeys);
            // Remove each key
            authRelatedKeys.forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        }
        return false;
    }
    catch (e) {
        console.error('Error clearing auth tokens:', e);
        return false;
    }
}
// Export a default client for convenience
export default supabase;
/**
 * Get the admin client instance
 * For backward compatibility with existing code
 */
export function getAdminClient() {
    return supabaseAdmin;
}
/**
 * Get the auth instance
 * For backward compatibility with existing code
 */
export function getAuth() {
    return auth;
}
/**
 * Get the Supabase client instance
 * For backward compatibility with existing code
 */
export function getSupabaseClient() {
    return supabase;
}
/**
 * Debug function to verify Supabase instances
 */
export function debugSupabaseInstances() {
    return {
        supabaseExists: !!supabase,
        adminExists: !!supabaseAdmin,
        authExists: !!auth,
    };
}
// Add a function to check if we're using the same instance everywhere
export function isUsingSameInstance(otherInstance) {
    return otherInstance === supabase;
}
/**
 * Check if the Supabase connection is healthy
 * @returns Promise<boolean> - true if healthy, false otherwise
 */
export function checkSupabaseHealth() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Use auth.getSession instead of a DB query for more reliable health check
            // This avoids 404 errors on tables that might not exist
            const { error } = yield supabase.auth.getSession();
            if (error) {
                console.warn('Supabase health check error:', error);
                return { isHealthy: false, error };
            }
            // Also try a basic endpoint that should always be available
            try {
                // Use a standard endpoint check without accessing protected properties
                const response = yield fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`);
                if (!response.ok) {
                    console.warn('Supabase API endpoint check failed:', response.status);
                    return { isHealthy: false, error: { status: response.status, message: response.statusText } };
                }
            }
            catch (apiError) {
                console.warn('Supabase API endpoint check error:', apiError);
                // Don't fail the overall health check just on the API endpoint
            }
            return { isHealthy: true };
        }
        catch (error) {
            console.error('Supabase health check failed:', error);
            return { isHealthy: false, error };
        }
    });
}
// Add a proper initialization function
let isInitialized = false;
let initErrors = [];
/**
 * Ensure Supabase client is properly initialized
 * This prevents race conditions when multiple components try to use Supabase
 * before it's fully ready
 */
export function ensureSupabaseInitialized() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isInitialized) {
            return { success: true };
        }
        try {
            // Check if client exists
            if (!supabase) {
                throw new Error('Supabase client has not been created');
            }
            // Do a simple health check to verify client is working
            const { isHealthy, error } = yield checkSupabaseHealth();
            if (!isHealthy) {
                throw error || new Error('Supabase health check failed');
            }
            // Mark as initialized
            isInitialized = true;
            console.log('Supabase client fully initialized and verified');
            return { success: true };
        }
        catch (error) {
            const typedError = error instanceof Error ? error : new Error(String(error));
            console.error('Error initializing Supabase:', typedError);
            // Store error for diagnostics
            initErrors.push(typedError);
            return { success: false, error: typedError };
        }
    });
}
/**
 * Return initialization status for diagnostics
 */
export function getSupabaseInitStatus() {
    return {
        isInitialized,
        hasErrors: initErrors.length > 0,
        errors: [...initErrors]
    };
}
// Export a specialized authentication function with retry logic
export function signInWithEmailPasswordRetry(email_1, password_1) {
    return __awaiter(this, arguments, void 0, function* (email, password, maxRetries = 2) {
        var _a, _b, _c, _d;
        let retries = 0;
        let lastError = null;
        // First make sure we have a valid client
        const client = getSupabaseClient();
        if (!client) {
            console.error('[Auth] Failed to get Supabase client for authentication');
            throw new Error('Authentication client initialization failed');
        }
        // Function to try the direct API approach when CORS is failing
        const tryDirectApiLogin = () => __awaiter(this, void 0, void 0, function* () {
            console.log('[Auth] Attempting direct API login without credentials mode');
            try {
                // Create a basic request without credentials mode
                const supabaseAuthUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;
                const response = yield fetch(supabaseAuthUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseAnonKey,
                        'X-Client-Info': 'Akii Web App'
                    },
                    body: JSON.stringify({ email, password }),
                    // No credentials: 'include' here
                });
                if (!response.ok) {
                    const errorData = yield response.json();
                    throw new Error(errorData.error_description || errorData.error || 'Authentication failed');
                }
                const data = yield response.json();
                // Handle the successful response
                console.log('[Auth] Direct API login successful');
                // Manually set the token in localStorage to make sure Supabase client picks it up
                try {
                    const key = `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
                    localStorage.setItem(key, JSON.stringify({
                        access_token: data.access_token,
                        refresh_token: data.refresh_token,
                        expires_at: Math.floor(Date.now() / 1000) + data.expires_in
                    }));
                }
                catch (storageError) {
                    console.error('[Auth] Error storing auth token:', storageError);
                }
                // Return in expected format
                return {
                    data: {
                        session: {
                            access_token: data.access_token,
                            refresh_token: data.refresh_token,
                            expires_in: data.expires_in,
                            user: data.user
                        },
                        user: data.user
                    },
                    error: null
                };
            }
            catch (error) {
                console.error('[Auth] Direct API login failed:', error);
                throw error;
            }
        });
        while (retries <= maxRetries) {
            try {
                console.log(`[Auth] Signin attempt ${retries + 1}/${maxRetries + 1} for ${email}`);
                // If we've already had a CORS error on a previous attempt, try the direct approach
                if (lastError &&
                    (((_a = lastError.message) === null || _a === void 0 ? void 0 : _a.includes('CORS')) ||
                        ((_b = lastError.message) === null || _b === void 0 ? void 0 : _b.includes('Failed to fetch')) ||
                        lastError.name === 'TypeError')) {
                    return yield tryDirectApiLogin();
                }
                // Use a longer timeout for sign-in requests
                const signInPromise = client.auth.signInWithPassword({ email, password });
                // Implement a race with a manual timeout
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => {
                        reject(new Error('Sign-in request timed out after 30 seconds'));
                    }, 30000);
                });
                // Race the sign-in promise against the timeout
                const result = yield Promise.race([signInPromise, timeoutPromise]);
                // If we got an error, throw it to be caught by the retry logic
                if (result.error) {
                    throw result.error;
                }
                console.log(`[Auth] Signin successful for ${email}`);
                return result;
            }
            catch (error) {
                lastError = error;
                console.warn(`[Auth] Signin error (attempt ${retries + 1}/${maxRetries + 1}):`, error);
                // Check for CORS errors - if we detect one, immediately try the direct approach
                if (((_c = error.message) === null || _c === void 0 ? void 0 : _c.includes('CORS')) ||
                    ((_d = error.message) === null || _d === void 0 ? void 0 : _d.includes('Failed to fetch')) ||
                    error.name === 'TypeError') {
                    console.log('[Auth] Detected CORS or fetch error, trying direct API approach');
                    try {
                        return yield tryDirectApiLogin();
                    }
                    catch (directError) {
                        // If direct approach also fails, continue with regular retry logic
                        console.error('[Auth] Direct API approach also failed:', directError);
                        lastError = directError;
                    }
                }
                // Special handling for specific errors that should not be retried
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (errorMessage.includes('Invalid login credentials') ||
                    errorMessage.includes('Email not confirmed') ||
                    errorMessage.includes('Invalid email or password')) {
                    // Don't retry for invalid credentials
                    console.log('[Auth] Not retrying due to credential error:', errorMessage);
                    throw error;
                }
                // For other errors like timeouts, network issues, etc., retry
                retries++;
                if (retries > maxRetries) {
                    console.error('[Auth] Max retries exceeded for signin');
                    throw error;
                }
                // Wait before retrying (exponential backoff)
                const backoffTime = 1000 * Math.pow(2, retries - 1); // 1s, 2s, 4s, etc.
                console.log(`[Auth] Waiting ${backoffTime}ms before retry ${retries}`);
                yield new Promise(r => setTimeout(r, backoffTime));
            }
        }
        // This shouldn't be reached due to the throw in the retry loop, but just in case
        throw lastError || new Error('Authentication failed after retries');
    });
}
