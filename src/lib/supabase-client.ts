/**
 * Supabase client export
 * This file re-exports the centralized Supabase client from auth-core
 * to maintain backward compatibility with existing imports
 */

import { supabaseClient } from "./auth-core";

export { supabaseClient };

// For backward compatibility
export const supabase = supabaseClient;
