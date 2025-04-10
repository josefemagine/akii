// Follow this setup guide to integrate the Deno runtime with your Supabase project:
// https://supabase.com/docs/guides/functions/getting-started

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with access to service_role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if request method is POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      )
    }

    // Get request JSON body
    const { userId, isAdmin } = await req.json()

    // Validate request parameters
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing user ID' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      )
    }

    // Get user information from Supabase auth
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (userError) {
      return new Response(
        JSON.stringify({ error: 'Failed to get user', details: userError.message }),
        { 
          status: 404,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      )
    }

    // Set admin status in user metadata
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { 
        app_metadata: { 
          ...user.user.app_metadata, 
          is_admin: isAdmin === true 
        }
      }
    )

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update user', details: updateError.message }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      )
    }

    // Update the profile table as well
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        is_admin: isAdmin === true,
        role: isAdmin === true ? 'admin' : 'user',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    // Return success response with updated user data
    return new Response(
      JSON.stringify({
        success: true,
        message: 'User admin status updated successfully',
        user: updateData.user,
        profile: profileError ? null : profileData
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  } catch (error) {
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
}) 