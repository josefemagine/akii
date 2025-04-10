/**
 * SUPABASE CLIENT MODULE
 * Centralized Supabase client configuration redirecting to the singleton pattern
 * This file now forwards requests to @/lib/supabase to ensure only one instance exists app-wide
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase.tsx";
import { supabase, supabaseAdmin } from "@/lib/supabase.tsx";

/**
 * Get the Supabase client instance
 * Uses the global singleton from @/lib/supabase
 */
export function getClient(): SupabaseClient<Database> {
  return supabase as SupabaseClient<Database>;
}

/**
 * Get the Supabase admin client instance (with service role)
 * Uses the global singleton from @/lib/supabase
 */
export function getAdminClient(): SupabaseClient<Database> | null {
  return supabaseAdmin as SupabaseClient<Database> | null;
}

// Export singleton instances for convenience
export { supabase, supabaseAdmin }; 