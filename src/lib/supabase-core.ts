/**
 * Core Supabase client configuration
 * This file centralizes Supabase client creation to avoid multiple instances
 * IMPORTANT: Import this file instead of creating new clients elsewhere
 */

import { supabaseClient, supabaseAdmin, supabase, auth } from "./auth-core";

// Export with consistent naming
export { supabaseClient, supabaseAdmin, supabase, auth };
// Also export the alias for backward compatibility
export { supabaseAdmin as adminClient };
