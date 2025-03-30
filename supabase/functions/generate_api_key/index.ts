import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Get the session of the authenticated user
    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession();
    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the request body
    const { instanceId, name, permissions = ["read"] } = await req.json();

    if (!instanceId || !name) {
      return new Response(
        JSON.stringify({ error: "Instance ID and name are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if the instance exists and belongs to the user
    const { data: instance, error: instanceError } = await supabaseClient
      .from("private_ai_instances")
      .select("id")
      .eq("id", instanceId)
      .eq("user_id", session.user.id)
      .single();

    if (instanceError || !instance) {
      return new Response(JSON.stringify({ error: "Instance not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate a random API key
    const keyPrefix = `ak_${Math.random().toString(36).substring(2, 8)}_`;
    const keySecret =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const fullKey = `${keyPrefix}${keySecret}`;

    // In a real implementation, you would hash the key before storing it
    // For this demo, we'll use a simple base64 encoding as a placeholder
    const keyHash = base64Encode(new TextEncoder().encode(fullKey));

    // Insert the new API key
    const { data: apiKey, error: apiKeyError } = await supabaseClient
      .from("api_keys")
      .insert({
        user_id: session.user.id,
        instance_id: instanceId,
        name,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        permissions: permissions,
        created_at: new Date().toISOString(),
      })
      .select("id, name, key_prefix, permissions, created_at")
      .single();

    if (apiKeyError) {
      return new Response(
        JSON.stringify({ error: "Failed to create API key" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Return the API key (only returned once, never stored in plain text)
    return new Response(
      JSON.stringify({
        success: true,
        message: "API key created successfully",
        apiKey: {
          ...apiKey,
          key: fullKey, // Only returned once, never stored
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
