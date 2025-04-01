/**
 * SUPABASE SINGLETON CLIENT
 * This is the ONLY place where Supabase clients should be instantiated.
 * All other modules must import from here.
 */
import { createClient, SupabaseClient, GoTrueClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY || '';

// Check for required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required Supabase environment variables');
}

// ------ SINGLETON REGISTRY ------

// Define window augmentation for TypeScript
declare global {
  interface Window {
    __SUPABASE_SINGLETONS?: {
      client?: SupabaseClient<Database>;
      admin?: SupabaseClient<Database>;
      auth?: GoTrueClient;
    };
  }
}

// Initialize browser registry
if (typeof window !== 'undefined') {
  window.__SUPABASE_SINGLETONS = window.__SUPABASE_SINGLETONS || {};
}

// ------ CLIENT SINGLETONS ------

// Create and maintain single Supabase client instance
function createSupabaseClient(): SupabaseClient<Database> {
  // Return existing instance if available (browser only)
  if (typeof window !== 'undefined' && window.__SUPABASE_SINGLETONS?.client) {
    return window.__SUPABASE_SINGLETONS.client;
  }
  
  // Create new instance with enhanced auth options
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true, 
      detectSessionInUrl: true,
      storageKey: 'supabase_auth_token',
      // Add specific storage mechanism for better reliability
      storage: {
        getItem: (key) => {
          try {
            return localStorage.getItem(key);
          } catch (error) {
            console.error('Error accessing localStorage:', error);
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, value);
          } catch (error) {
            console.error('Error writing to localStorage:', error);
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.error('Error removing from localStorage:', error);
          }
        },
      },
    },
    global: {
      headers: { 'x-application-name': 'akii-app' },
      // Add fetch options for better timeout handling
      fetch: (url, options) => {
        const fetchOptions = {
          ...options,
          timeout: 15000, // 15 second timeout
        };
        return fetch(url, fetchOptions);
      }
    },
    // Add custom debug and timing options
    db: {
      schema: 'public',
    },
    realtime: {
      timeout: 20000, // 20 seconds
    },
  });
  
  // Store in registry (browser only)
  if (typeof window !== 'undefined') {
    window.__SUPABASE_SINGLETONS.client = client;
    window.__SUPABASE_SINGLETONS.auth = client.auth;
  }
  
  return client;
}

// Create admin client (with service role) - only available on server
function createAdminClient(): SupabaseClient<Database> | null {
  // Don't create admin client in browser environment
  if (typeof window !== 'undefined') {
    console.log('Admin client not available in browser environment');
    return null;
  }
  
  // Check for service key
  if (!supabaseServiceKey) {
    console.warn('Missing Supabase Service Key. Admin client not available.');
    return null;
  }
  
  // Create admin client for server-side use only
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { 
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ------ SINGLETON INSTANCES ------

// Create the singleton instances
const supabase = createSupabaseClient();
const supabaseAdmin = createAdminClient();
const auth = supabase.auth;

// ------ EXPORTED FUNCTIONS ------

// Export client accessor functions
export function getSupabaseClient() {
  return supabase;
}

export function getAdminClient() {
  return supabaseAdmin;
}

export function getAuth() {
  return auth;
}

// ------ EXPORT ALL ------

// Export the singleton instances
export { supabase, supabaseAdmin, auth };

// Export default client
export default supabase;

// ------ DEBUG UTILITIES ------

/**
 * Debug utility to check Supabase instance registrations
 * Prints the current state of Supabase singletons to the console
 */
export function debugSupabaseInstances() {
  if (typeof window !== 'undefined') {
    console.log('Supabase Singleton Registry:', {
      client: !!window.__SUPABASE_SINGLETONS?.client,
      admin: !!window.__SUPABASE_SINGLETONS?.admin,
      auth: !!window.__SUPABASE_SINGLETONS?.auth
    });
    
    console.log('Active instances count:', {
      clientCount: window.__SUPABASE_SINGLETONS?.client ? 1 : 0,
      adminCount: window.__SUPABASE_SINGLETONS?.admin ? 1 : 0,
      authCount: window.__SUPABASE_SINGLETONS?.auth ? 1 : 0
    });
  } else {
    console.log('Running in non-browser environment, registry not available');
  }
  
  return {
    supabase: !!supabase,
    supabaseAdmin: !!supabaseAdmin,
    auth: !!auth
  };
} 