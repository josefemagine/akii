/**
 * SUPABASE SINGLETON CLIENT
 * Ensures a single instance of Supabase clients across the application
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

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

    // Check if we have values from a global ENV object (sometimes used in production)
    if ((!url || !anonKey) && typeof window !== 'undefined' && window.ENV) {
      url = url || window.ENV.VITE_SUPABASE_URL || window.ENV.SUPABASE_URL || '';
      anonKey = anonKey || window.ENV.VITE_SUPABASE_ANON_KEY || window.ENV.SUPABASE_ANON_KEY || '';
      serviceKey = serviceKey || window.ENV.VITE_SUPABASE_SERVICE_ROLE_KEY || window.ENV.SUPABASE_SERVICE_KEY || '';
    }
  } catch (error) {
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

// Define custom window properties for Supabase clients
declare global {
  interface Window {
    __supabaseClient?: ReturnType<typeof createClient<Database>>;
    __supabaseAdminClient?: ReturnType<typeof createClient<Database>>;
    __supabase?: ReturnType<typeof createClient<Database>>;
    __SUPABASE_SINGLETON?: {
      auth?: any;
      client?: ReturnType<typeof createClient<Database>>;
      initialized?: boolean;
    };
    ENV?: {
      VITE_SUPABASE_URL?: string;
      SUPABASE_URL?: string;
      VITE_SUPABASE_ANON_KEY?: string;
      SUPABASE_ANON_KEY?: string;
      VITE_SUPABASE_SERVICE_ROLE_KEY?: string;
      SUPABASE_SERVICE_KEY?: string;
      [key: string]: string | undefined;
    };
  }
}

// Use Symbol for truly private singleton storage
const SUPABASE_SINGLETON_KEY = Symbol.for('__SUPABASE_GLOBAL_SINGLETON__');

// Global singleton type
interface GlobalSingleton {
  client: SupabaseClient;
  initialized: boolean;
}

// Create global singleton object with our symbol key
const globalSingleton = Object.create({});

// Use a function to create and get the client to prevent duplication
function getOrCreateSupabaseClient(): SupabaseClient<Database> {
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
    
    if (window.__SUPABASE_SINGLETON?.client) {
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
  const enhancedFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
    // Use a longer timeout for auth requests
    const isAuthRequest = url.toString().includes('/auth/') || 
                         url.toString().includes('/token?') ||
                         url.toString().includes('/oidc/');
    
    // Set timeout based on request type - auth requests need more time
    const timeout = isAuthRequest ? 60000 : 30000; // 60 seconds for auth, 30 for others
    
    // Create an abort controller for the timeout
    const controller = new AbortController();
    
    // Save the original signal if one was provided
    const originalSignal = options?.signal;
    
    // Create a combined signal that aborts if either original signal or our timeout aborts
    if (originalSignal) {
      // Listen for abort on the original signal
      const abortListener = () => {
        controller.abort(originalSignal.reason);
      };
      
      if (originalSignal.aborted) {
        // Original signal was already aborted before we got here
        controller.abort(originalSignal.reason);
      } else {
        // Add abort listener
        originalSignal.addEventListener('abort', abortListener);
        
        // Clean up the listener if our controller aborts
        controller.signal.addEventListener('abort', () => {
          originalSignal.removeEventListener('abort', abortListener);
        });
      }
    }
    
    // Add the signal to the options
    const fetchOptions: RequestInit = {
      ...(options || {}),
      signal: controller.signal,
      keepalive: true, // Keep connection alive during page transitions
      credentials: 'include', // Include credentials in all requests
      mode: 'cors', // CORS mode for cross-origin requests
    };
    
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
            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);
            return response;
          } catch (error) {
            retries++;
            console.warn(`[Supabase] Auth request retry ${retries}/${maxRetries}: ${url.toString()}`);
            
            // If the request was aborted by our timeout or we've exceeded max retries, throw
            if (error instanceof DOMException && error.name === 'AbortError' ||
                retries > maxRetries) {
              throw error;
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries - 1)));
          }
        }
      }
      
      // For non-auth requests or if auth retries exceeded, make a normal request
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Better classify the error
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Check if this was our timeout or an external abort
        const isOurTimeout = error.message === 'Request timed out' || 
                           error.message.includes('timed out');
                        
        if (isOurTimeout) {
          console.error(`[Supabase] Request timed out after ${timeout}ms: ${url.toString()}`);
        } else {
          console.warn(`[Supabase] Request was aborted: ${url.toString()}`);
        }
      } else {
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
  };
  
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
          } catch (error) {
            console.error('[Supabase Storage] Error accessing localStorage:', error);
            // Try to gracefully handle localStorage errors
            if (typeof sessionStorage !== 'undefined') {
              try {
                return sessionStorage.getItem(key);
              } catch (e) {
                console.error('[Supabase Storage] Fallback storage error:', e);
              }
            }
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, value);
          } catch (error) {
            console.error('[Supabase Storage] Error writing to localStorage:', error);
            // Try to gracefully handle localStorage errors
            if (typeof sessionStorage !== 'undefined') {
              try {
                sessionStorage.setItem(key, value);
              } catch (e) {
                console.error('[Supabase Storage] Fallback storage error:', e);
              }
            }
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.error('[Supabase Storage] Error removing from localStorage:', error);
            // Try to gracefully handle localStorage errors
            if (typeof sessionStorage !== 'undefined') {
              try {
                sessionStorage.removeItem(key);
              } catch (e) {
                console.error('[Supabase Storage] Fallback storage error:', e);
              }
            }
          }
        }
      }
    },
    // Global fetch options to improve reliability
    global: {
      fetch: enhancedFetch
    }
  });
  
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
export async function initAdminCapabilities() {
  if (adminInitialized) return;
  
  console.log('Initializing admin client capabilities...');
  
  // Here we could set up admin-specific functionality
  
  adminInitialized = true;
}

// Refresh session - similar to the middleware function in Next.js
export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (data?.session) {
      // Refresh user if session exists
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      return {
        session: data.session,
        user: userData?.user || null
      };
    }
    
    return { session: null, user: null };
  } catch (error) {
    console.error('Error refreshing session:', error);
    return { session: null, user: null, error };
  }
}

// Helper to clear all auth data from localStorage
export function clearAllAuthData() {
  try {
    const authRelatedKeys = [];
    
    // Find all auth-related keys with more comprehensive pattern matching
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('supabase') || 
        key.includes('sb-') || 
        key.includes('akii-auth') || 
        key.includes('force-auth-login') ||
        key.includes('token') ||
        key.includes('auth') ||
        key.startsWith('auth-') ||
        key.endsWith('-auth') ||
        key.includes('-auth-')
      )) {
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
  } catch (e) {
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
export function isUsingSameInstance(otherInstance: any) {
  return otherInstance === supabase;
}

/**
 * Check if the Supabase connection is healthy
 * @returns Promise<boolean> - true if healthy, false otherwise
 */
export async function checkSupabaseHealth(): Promise<{isHealthy: boolean, error?: any}> {
  try {
    // Use auth.getSession instead of a DB query for more reliable health check
    // This avoids 404 errors on tables that might not exist
    const { error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('Supabase health check error:', error);
      return { isHealthy: false, error };
    }
    
    // Also try a basic endpoint that should always be available
    try {
      // Use a standard endpoint check without accessing protected properties
      const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`);
      if (!response.ok) {
        console.warn('Supabase API endpoint check failed:', response.status);
        return { isHealthy: false, error: { status: response.status, message: response.statusText } };
      }
    } catch (apiError) {
      console.warn('Supabase API endpoint check error:', apiError);
      // Don't fail the overall health check just on the API endpoint
    }

    return { isHealthy: true };
  } catch (error) {
    console.error('Supabase health check failed:', error);
    return { isHealthy: false, error };
  }
}

// Add a proper initialization function
let isInitialized = false;
let initErrors: Error[] = [];

/**
 * Ensure Supabase client is properly initialized
 * This prevents race conditions when multiple components try to use Supabase
 * before it's fully ready
 */
export async function ensureSupabaseInitialized(): Promise<{ success: boolean; error?: Error }> {
  if (isInitialized) {
    return { success: true };
  }
  
  try {
    // Check if client exists
    if (!supabase) {
      throw new Error('Supabase client has not been created');
    }
    
    // Do a simple health check to verify client is working
    const { isHealthy, error } = await checkSupabaseHealth();
    
    if (!isHealthy) {
      throw error || new Error('Supabase health check failed');
    }
    
    // Mark as initialized
    isInitialized = true;
    console.log('Supabase client fully initialized and verified');
    
    return { success: true };
  } catch (error) {
    const typedError = error instanceof Error ? error : new Error(String(error));
    console.error('Error initializing Supabase:', typedError);
    
    // Store error for diagnostics
    initErrors.push(typedError);
    
    return { success: false, error: typedError };
  }
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
export async function signInWithEmailPasswordRetry(email: string, password: string, maxRetries = 2) {
  let retries = 0;
  let lastError = null;
  
  // First make sure we have a valid client
  const client = getSupabaseClient();
  if (!client) {
    console.error('[Auth] Failed to get Supabase client for authentication');
    throw new Error('Authentication client initialization failed');
  }
  
  while (retries <= maxRetries) {
    try {
      console.log(`[Auth] Signin attempt ${retries + 1}/${maxRetries + 1} for ${email}`);
      
      // Use a longer timeout for sign-in requests
      const signInPromise = client.auth.signInWithPassword({ email, password });
      
      // Implement a race with a manual timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Sign-in request timed out after 30 seconds'));
        }, 30000);
      });
      
      // Race the sign-in promise against the timeout
      const result = await Promise.race([signInPromise, timeoutPromise]) as any;
      
      // If we got an error, throw it to be caught by the retry logic
      if (result.error) {
        throw result.error;
      }
      
      console.log(`[Auth] Signin successful for ${email}`);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`[Auth] Signin error (attempt ${retries + 1}/${maxRetries + 1}):`, error);
      
      // Special handling for specific errors that should not be retried
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes('Invalid login credentials') ||
        errorMessage.includes('Email not confirmed') ||
        errorMessage.includes('Invalid email or password')
      ) {
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
      await new Promise(r => setTimeout(r, backoffTime));
    }
  }
  
  // This shouldn't be reached due to the throw in the retry loop, but just in case
  throw lastError || new Error('Authentication failed after retries');
} 