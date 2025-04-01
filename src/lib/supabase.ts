/**
 * Supabase client export
 * This file re-exports the centralized Supabase client
 * Instead of importing from supabase-singleton directly, import from here
 */

import { supabase, supabaseAdmin, auth } from "./supabase-singleton";

// Export the clients and auth
export { supabase, supabaseAdmin, auth };

// Default export for convenience
export default supabase;
