import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the current user
    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { headers: { 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // First, create the execute_sql function if it doesn't exist
    try {
      // This is a direct query using the database client to create the execute_sql function
      // We can't use the function itself to create itself
      const { error } = await supabaseClient
        .from('profiles')
        .select('id')
        .limit(1)
        
      // If we can run a query, we might also be able to create the function directly
      if (!error) {
        // Try to create the function directly using SQL
        const createFunctionResult = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/execute_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          },
          body: JSON.stringify({
            sql: `
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
            `
          })
        })
      }
    } catch (error) {
      console.error('Error creating execute_sql function:', error)
    }

    // Add the columns
    const queries = [
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;`,
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address1 TEXT;`,
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address2 TEXT;`,
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;`,
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;`,
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zip TEXT;`,
      `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;`,
      `COMMENT ON COLUMN public.profiles.is_admin IS 'Indicates if the user has admin privileges';`,
      `COMMENT ON COLUMN public.profiles.address1 IS 'Primary address line';`,
      `COMMENT ON COLUMN public.profiles.address2 IS 'Secondary address line (apt, suite, etc.)';`,
      `COMMENT ON COLUMN public.profiles.city IS 'City';`,
      `COMMENT ON COLUMN public.profiles.state IS 'State or province';`,
      `COMMENT ON COLUMN public.profiles.zip IS 'Postal/ZIP code';`,
      `COMMENT ON COLUMN public.profiles.country IS 'Country';`,
      `UPDATE public.profiles SET is_admin = true WHERE role = 'admin' AND (is_admin IS NULL OR is_admin = false);`,
      `INSERT INTO public.profiles (id, email, first_name, last_name, role, status, created_at, updated_at, is_admin)
       VALUES ('${user.id}', '${user.email}', '${user.email?.split('@')[0] || ''}', '', 'user', 'active', NOW(), NOW(), false)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW();`
    ]

    const results = []
    
    // Execute each query
    for (const query of queries) {
      try {
        const { data, error } = await supabaseClient.rpc('execute_sql', { sql: query })
        
        if (error) {
          console.error('Error executing query:', error)
          results.push({ query: query.slice(0, 50) + '...', success: false, error: error.message })
        } else {
          console.log('Query successful:', query.slice(0, 50) + '...')
          results.push({ query: query.slice(0, 50) + '...', success: true })
        }
      } catch (error) {
        console.error('Error executing query:', error)
        results.push({ query: query.slice(0, 50) + '...', success: false, error: error.message })
      }
    }

    // Check if the columns were added
    const { data: columns, error: columnsError } = await supabaseClient.rpc(
      'execute_sql',
      {
        sql: `
          SELECT 
            column_name, 
            data_type, 
            is_nullable
          FROM 
            information_schema.columns
          WHERE 
            table_schema = 'public' 
            AND table_name = 'profiles'
            AND column_name IN ('is_admin', 'address1', 'address2', 'city', 'state', 'zip', 'country')
          ORDER BY 
            ordinal_position;
        `
      }
    )

    if (columnsError) {
      results.push({ operation: 'check_columns', success: false, error: columnsError.message })
    } else {
      results.push({ operation: 'check_columns', success: true, columns })
    }

    // Get current profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return new Response(
      JSON.stringify({ 
        success: true, 
        results, 
        profile: profile || null,
        profile_error: profileError ? profileError.message : null,
        user_id: user.id 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}) 