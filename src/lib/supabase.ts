/**
 * Supabase client export
 * This file re-exports the centralized Supabase client from auth-core
 * to maintain backward compatibility with existing imports
 */

import { supabase, supabaseClient, supabaseAdmin, auth } from "./auth-core";

export { supabase, supabaseClient, supabaseAdmin, auth };
