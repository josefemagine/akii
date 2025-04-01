/**
 * Core Supabase client configuration
 * This file centralizes Supabase client creation to avoid multiple instances
 * IMPORTANT: Import this file instead of creating new clients elsewhere
 */

import { supabaseClient, adminClient, supabase, auth } from "./auth-core";

// Re-export the clients from auth-core to ensure single instances
export { supabaseClient, adminClient, supabase, auth };
