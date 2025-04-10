// Script to execute SQL directly against Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Load environment variables from .env file if it exists
if (fs.existsSync('.env')) {
  dotenv.config();
}

// Get Supabase URL and Key from environment variables or .env file
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || (!SUPABASE_SERVICE_KEY && !SUPABASE_ANON_KEY)) {
  console.error('Error: SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variables are required.');
  process.exit(1);
}

// Create Supabase client with service role if available, otherwise use anon key
const apiKey = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, apiKey);

async function main() {
  try {
    console.log('Getting Supabase connection info...');
    
    // Try to get database connection info using supabase CLI
    try {
      const { stdout } = await execAsync('supabase status -o json');
      const status = JSON.parse(stdout);
      console.log('Connected to Supabase project:', status.project_id);
    } catch (err) {
      console.log('Could not get Supabase status:', err.message);
    }
    
    // SQL commands to execute
    const sqlCommands = [
      // Helper functions
      `
      -- Create the execute_sql function if it doesn't exist
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1
              FROM pg_proc p
              JOIN pg_namespace n ON p.pronamespace = n.oid
              WHERE n.nspname = 'public'
              AND p.proname = 'execute_sql'
          ) THEN
              CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
              RETURNS JSONB
              LANGUAGE plpgsql
              SECURITY DEFINER
              SET search_path = public
              AS $$
              DECLARE
                  result JSONB;
              BEGIN
                  EXECUTE sql;
                  RETURN jsonb_build_object('success', true);
              EXCEPTION WHEN OTHERS THEN
                  RETURN jsonb_build_object(
                      'success', false,
                      'error', SQLERRM,
                      'errorcode', SQLSTATE
                  );
              END;
              $$;

              -- Grant execute permission to authenticated users
              GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated;
              
              -- Add a comment to the function
              COMMENT ON FUNCTION public.execute_sql(text) IS 'Execute arbitrary SQL with security definer privileges';
          END IF;
      END
      $$;
      `,

      // Add columns to profiles table
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;`,
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address1 TEXT;`,
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address2 TEXT;`,
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;`,
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;`,
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zip TEXT;`,
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;`,

      // Add comments
      `COMMENT ON COLUMN public.profiles.is_admin IS 'Indicates if the user has admin privileges';`,
      `COMMENT ON COLUMN public.profiles.address1 IS 'Primary address line';`,
      `COMMENT ON COLUMN public.profiles.address2 IS 'Secondary address line (apt, suite, etc.)';`,
      `COMMENT ON COLUMN public.profiles.city IS 'City';`,
      `COMMENT ON COLUMN public.profiles.state IS 'State or province';`,
      `COMMENT ON COLUMN public.profiles.zip IS 'Postal/ZIP code';`,
      `COMMENT ON COLUMN public.profiles.country IS 'Country';`,

      // Update admin status for existing users
      `UPDATE public.profiles
       SET is_admin = true
       WHERE role = 'admin' AND (is_admin IS NULL OR is_admin = false);`
    ];

    // Execute each SQL command
    for (const [index, sql] of sqlCommands.entries()) {
      console.log(`Executing SQL command ${index + 1}/${sqlCommands.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('execute_sql', { sql });
        
        if (error && index === 0) {
          // First command might fail if execute_sql function doesn't exist
          console.log('Could not use execute_sql function, trying direct query...');
          const { error: directError } = await supabase.from('profiles').select('count').limit(1);
          
          if (directError) {
            throw directError;
          }
          
          // Just continue with the second command
          console.log('Direct query successful, continuing with other commands...');
          continue;
        } else if (error) {
          throw error;
        }
        
        console.log(`Command ${index + 1} executed successfully:`, data || 'No data returned');
      } catch (error) {
        console.error(`Error executing command ${index + 1}:`, error.message);
        // Continue with next command
      }
    }

    console.log('All SQL commands executed. Check the database for changes.');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main(); 