// Script to call the add_profile_columns edge function
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env file if it exists
if (fs.existsSync('.env')) {
  dotenv.config();
}

// Get Supabase URL and Key from environment variables or .env file
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  try {
    // First, sign in
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
      console.error('Usage: node call-edge-function.js <email> <password>');
      process.exit(1);
    }

    console.log(`Signing in as ${email}...`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`);
    }

    console.log('Successfully signed in, calling edge function...');

    // Call the edge function
    const { data, error } = await supabase.functions.invoke('add_profile_columns');

    if (error) {
      throw new Error(`Edge function error: ${error.message}`);
    }

    console.log('Edge function response:');
    console.log(JSON.stringify(data, null, 2));

    // Sign out (cleanup)
    await supabase.auth.signOut();
    console.log('Signed out');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main(); 