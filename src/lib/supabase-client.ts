/**
 * SUPABASE CLIENT SINGLETON MODULE
 * 
 * This module serves as the single source of truth for Supabase client instances.
 * All other modules should import from here to prevent multiple instances.
 */

import { createClient, SupabaseClient, AuthResponse } from "@supabase/supabase-js";
import { isBrowser } from "./browser-check";

// Check for existing client in window object (cross-module singleton)
declare global {
  interface Window {
    __SUPABASE_SINGLETON?: {
      client?: SupabaseClient;
      admin?: SupabaseClient;
      auth?: SupabaseClient["auth"];
    }
  }
}

// Environment variables using Vite's import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

// Validation
if (!supabaseUrl) {
  console.error(
    "Missing environment variable: VITE_SUPABASE_URL"
  );
}

if (!supabaseAnonKey) {
  console.error(
    "Missing environment variable: VITE_SUPABASE_ANON_KEY"
  );
}

// Initialize the global singleton container
if (isBrowser && !window.__SUPABASE_SINGLETON) {
  window.__SUPABASE_SINGLETON = {};
}

// Module-level singleton fallback (for SSR or if window is not available)
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;
let _auth: SupabaseClient["auth"] | null = null;

/**
 * Get or create the Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient {
  // Try to use the global singleton first (browser)
  if (isBrowser && window.__SUPABASE_SINGLETON?.client) {
    return window.__SUPABASE_SINGLETON.client;
  }
  
  // Fall back to module-level singleton or create new instance
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: isBrowser,
        storageKey: "sb",
        autoRefreshToken: true,
      },
    });
    
    // Store in global singleton if in browser
    if (isBrowser && window.__SUPABASE_SINGLETON) {
      window.__SUPABASE_SINGLETON.client = _supabase;
    }
    
    console.log("Supabase client initialized");
  }
  
  return _supabase;
}

/**
 * Get or create the Supabase admin client instance
 */
export function getAdminClient(): SupabaseClient | null {
  // Check for global singleton first (browser)
  if (isBrowser && window.__SUPABASE_SINGLETON?.admin) {
    return window.__SUPABASE_SINGLETON.admin;
  }
  
  if (supabaseServiceKey) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      
      // Store in global singleton if in browser
      if (isBrowser && window.__SUPABASE_SINGLETON) {
        window.__SUPABASE_SINGLETON.admin = _supabaseAdmin;
      }
      
      console.log("Supabase admin client initialized");
    }
    return _supabaseAdmin;
  } else {
    // In production, we don't want to warn about missing service key
    if (import.meta.env.DEV) {
      console.warn("Missing VITE_SUPABASE_SERVICE_KEY. Admin client not available.");
    }
    return null;
  }
}

/**
 * Get the Supabase auth instance
 */
export function getAuth(): SupabaseClient["auth"] {
  // Check for global singleton first (browser)
  if (isBrowser && window.__SUPABASE_SINGLETON?.auth) {
    return window.__SUPABASE_SINGLETON.auth;
  }
  
  if (!_auth) {
    _auth = getSupabaseClient().auth;
    
    // Store in global singleton if in browser
    if (isBrowser && window.__SUPABASE_SINGLETON) {
      window.__SUPABASE_SINGLETON.auth = _auth;
    }
  }
  return _auth;
}

// Initialize the clients
export const supabase = getSupabaseClient();
export const supabaseAdmin = getAdminClient();
export const auth = getAuth();

/**
 * Debug function to verify Supabase instances
 */
export function debugSupabaseInstances(): {
  supabaseExists: boolean;
  adminExists: boolean;
  authExists: boolean;
  globalSingleton: boolean;
} {
  return {
    supabaseExists: !!_supabase,
    adminExists: !!_supabaseAdmin,
    authExists: !!_auth,
    globalSingleton: isBrowser && !!window.__SUPABASE_SINGLETON?.client
  };
}

// Default export for easy importing
export default supabase;
