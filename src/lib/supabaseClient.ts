import { createClient } from "@supabase/supabase-js";

// Get Supabase configuration with better error handling
function getSupabaseConfig() {
  let url = '';
  let anonKey = '';

  try {
    // First try import.meta.env (Vite standard)
    url = import.meta.env.VITE_SUPABASE_URL || '';
    anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    // Check if we have values from a global ENV object (sometimes used in production)
    if ((!url || !anonKey) && typeof window !== 'undefined' && window.ENV) {
      url = url || window.ENV.VITE_SUPABASE_URL || window.ENV.SUPABASE_URL || '';
      anonKey = anonKey || window.ENV.VITE_SUPABASE_ANON_KEY || window.ENV.SUPABASE_ANON_KEY || '';
    }
  } catch (error) {
    console.error('Error accessing Supabase environment variables:', error);
  }

  // Validate and warn
  if (!url) {
    console.error('Missing required Supabase URL. Authentication will not work.');
  }
  if (!anonKey) {
    console.error('Missing required Supabase anon key. Authentication will not work.');
  }

  return { url, anonKey };
}

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 