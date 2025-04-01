/**
 * SUPABASE CLIENT MODULE
 * Centralized Supabase client configuration with singleton pattern
 * This is the ONLY place in the entire application where Supabase clients are created
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || import.meta.env.SUPABASE_SERVICE_KEY;

// Singleton instances
let _clientInstance: SupabaseClient<Database> | null = null;
let _adminInstance: SupabaseClient<Database> | null = null;

/**
 * Get the Supabase client instance
 * Uses singleton pattern to ensure only one instance exists
 */
export function getClient(): SupabaseClient<Database> {
  if (!_clientInstance) {
    _clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: { 
        headers: { "x-application-name": "akii-web-core" },
      },
    });
  }
  return _clientInstance;
}

/**
 * Get the Supabase admin client instance (with service role)
 * Uses singleton pattern to ensure only one instance exists
 */
export function getAdminClient(): SupabaseClient<Database> | null {
  if (!supabaseServiceKey) {
    console.warn("No service key available for admin client");
    return null;
  }
  
  if (!_adminInstance) {
    _adminInstance = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { "x-application-name": "akii-web-admin" } },
    });
  }
  return _adminInstance;
}

// Export singleton instances for convenience
export const supabase = getClient();
export const supabaseAdmin = getAdminClient(); 