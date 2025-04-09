/**
 * SUPABASE CLIENT MODULE
 * Centralized Supabase client configuration redirecting to the singleton pattern
 * This file now forwards requests to @/lib/supabase to ensure only one instance exists app-wide
 */
import { supabase, supabaseAdmin } from "@/lib/supabase";
/**
 * Get the Supabase client instance
 * Uses the global singleton from @/lib/supabase
 */
export function getClient() {
    return supabase;
}
/**
 * Get the Supabase admin client instance (with service role)
 * Uses the global singleton from @/lib/supabase
 */
export function getAdminClient() {
    return supabaseAdmin;
}
// Export singleton instances for convenience
export { supabase, supabaseAdmin };
