/**
 * Core Supabase client configuration
 * This file centralizes Supabase client creation to avoid multiple instances
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey =
  import.meta.env.VITE_SUPABASE_SERVICE_KEY || supabaseAnonKey;

// Standard client for user operations
export const supabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        "x-application-name": "akii-web-auth",
      },
    },
  },
);

// Admin client for protected operations
export const adminClient = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        "x-application-name": "akii-web-admin",
      },
    },
  },
);

// For backward compatibility
export const supabase = supabaseClient;
