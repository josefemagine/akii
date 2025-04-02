/**
 * SUPABASE SINGLETON CLIENT
 * Ensures a single instance of Supabase clients across the application
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || '';

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
  }
}

// Create the Supabase client (or reuse existing instance)
const supabase = (typeof window !== 'undefined' && window.__supabaseClient) 
  || createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });

// Create admin client (service role) for server-side operations
const supabaseAdmin = typeof window === 'undefined' && supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Store clients in global scope in development to prevent multiple instances
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__supabaseClient = supabase;
}

// Get auth from the existing client
const auth = supabase.auth;

// Export the Supabase client
export { supabase, supabaseAdmin, auth };

// Default export
export default supabase;

// Helper functions to get clients (prevents accidental multiple instantiation)
export function getSupabaseClient() {
  return supabase;
}

export function getAdminClient() {
  return supabaseAdmin;
}

export function getAuth() {
  return auth;
}

// Add to window object for debugging in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__supabase = supabase;
}

/**
 * Debug function to verify Supabase instances
 */
export function debugSupabaseInstances(): {
  supabaseExists: boolean;
  adminExists: boolean;
  authExists: boolean;
} {
  return {
    supabaseExists: !!supabase,
    adminExists: !!supabaseAdmin,
    authExists: !!auth,
  };
} 