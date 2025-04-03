/**
 * SUPABASE SINGLETON CLIENT
 * Ensures a single instance of Supabase clients across the application
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Check for required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables');
}

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

// Check if we already have a singleton instance
if (!(SUPABASE_SINGLETON_KEY in globalSingleton)) {
  // Create a new Supabase client and store it in the global singleton
  console.log('Supabase singleton client initialized');
  globalSingleton[SUPABASE_SINGLETON_KEY] = {
    client: createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'sb-injxxchotrvgvzelhvj-auth-token',
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
        fetch: (url: RequestInfo | URL, options?: RequestInit) => {
          // Use a timeout to prevent hanging requests
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          // Merge the abort signal with any existing options
          const mergedOptions: RequestInit = {
            ...(options || {}),
            signal: controller.signal,
            keepalive: true
          };
          
          return fetch(url, mergedOptions).finally(() => {
            clearTimeout(timeoutId);
          });
        }
      }
    }),
    initialized: true,
  };
}

// Admin client capabilities are initialized lazily
let adminInitialized = false;

// Get the Supabase client from the global singleton
export const supabase = globalSingleton[SUPABASE_SINGLETON_KEY].client;

// For backward compatibility
export const auth = supabase.auth;

// Create a minimal admin client that just forwards to the regular client
// This maintains backwards compatibility with existing code
export const supabaseAdmin = supabase;

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
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/?apikey=${supabase.supabaseKey}`);
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