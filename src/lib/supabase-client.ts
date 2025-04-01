/**
 * SUPABASE CLIENT SINGLETON MODULE
 * 
 * This module serves as the single source of truth for Supabase client instances.
 * All other modules should import from here to prevent multiple instances.
 */

import { createClient, SupabaseClient, AuthResponse } from "@supabase/supabase-js";
import { isBrowser } from "./browser-check";

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

// Singleton instances
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;
let _auth: SupabaseClient["auth"] | null = null;

/**
 * Get or create the Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: isBrowser,
        storageKey: "sb",
        autoRefreshToken: true,
      },
    });
    console.log("Supabase client initialized");
  }
  return _supabase;
}

/**
 * Get or create the Supabase admin client instance
 */
export function getAdminClient(): SupabaseClient | null {
  if (supabaseServiceKey) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log("Supabase admin client initialized");
    }
    return _supabaseAdmin;
  } else {
    console.warn("Missing VITE_SUPABASE_SERVICE_KEY. Admin client not available.");
    return null;
  }
}

/**
 * Get the Supabase auth instance
 */
export function getAuth(): SupabaseClient["auth"] {
  if (!_auth) {
    _auth = getSupabaseClient().auth;
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
} {
  return {
    supabaseExists: !!_supabase,
    adminExists: !!_supabaseAdmin,
    authExists: !!_auth,
  };
}

// Default export for easy importing
export default supabase;
