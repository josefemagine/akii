import { createClient } from "@supabase/supabase-js";

// Create a single instance of the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

// Export a single instance to be used throughout the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
