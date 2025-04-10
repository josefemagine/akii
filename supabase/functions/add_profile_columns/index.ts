import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

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

    // Check if the user has admin privileges
    const { data: { user } } = await supabaseClient.auth.getUser()
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { headers: { 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Execute the SQL to add the columns
    const addColumns = [
      { name: 'is_admin', type: 'BOOLEAN', default: 'FALSE' },
      { name: 'address1', type: 'TEXT', default: null },
      { name: 'address2', type: 'TEXT', default: null },
      { name: 'city', type: 'TEXT', default: null },
      { name: 'state', type: 'TEXT', default: null },
      { name: 'zip', type: 'TEXT', default: null },
      { name: 'country', type: 'TEXT', default: null }
    ]

    const results = []

    // Add each column
    for (const column of addColumns) {
      // Check if column exists
      const { data: columnExists, error: columnCheckError } = await supabaseClient.rpc(
        'column_exists',
        { table_name: 'profiles', column_name: column.name }
      )

      if (columnCheckError) {
        // Fallback to try/catch query
        try {
          const { error } = await supabaseClient.rpc(
            'execute_sql',
            { 
              sql: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}${column.default ? ` DEFAULT ${column.default}` : ''}` 
            }
          )
          
          if (error) throw error
          results.push({ column: column.name, status: 'added' })
        } catch (err) {
          results.push({ column: column.name, status: 'error', message: err.message })
        }
      } else if (!columnExists) {
        // Column doesn't exist, add it
        try {
          const { error } = await supabaseClient.rpc(
            'execute_sql',
            { 
              sql: `ALTER TABLE public.profiles ADD COLUMN ${column.name} ${column.type}${column.default ? ` DEFAULT ${column.default}` : ''}` 
            }
          )
          
          if (error) throw error
          results.push({ column: column.name, status: 'added' })
        } catch (err) {
          results.push({ column: column.name, status: 'error', message: err.message })
        }
      } else {
        results.push({ column: column.name, status: 'already exists' })
      }
    }

    // Update admin status for admin roles
    try {
      const { error } = await supabaseClient.rpc(
        'execute_sql',
        { 
          sql: `UPDATE public.profiles SET is_admin = true WHERE role = 'admin' AND (is_admin IS NULL OR is_admin = false)` 
        }
      )
      
      if (error) throw error
      results.push({ operation: 'update_admin_status', status: 'success' })
    } catch (err) {
      results.push({ operation: 'update_admin_status', status: 'error', message: err.message })
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}) 