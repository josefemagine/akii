import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

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
    const { instanceId } = await req.json();

    if (!instanceId) {
      return new Response(
        JSON.stringify({ error: "Instance ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get the instance details
    const { data: instance, error: instanceError } = await supabaseClient
      .from("private_ai_instances")
      .select("*")
      .eq("id", instanceId)
      .eq("user_id", session.user.id)
      .single();

    if (instanceError || !instance) {
      return new Response(JSON.stringify({ error: "Instance not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update the instance status to 'deploying'
    const { error: updateError } = await supabaseClient
      .from("private_ai_instances")
      .update({ status: "deploying" })
      .eq("id", instanceId);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update instance status" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // In a real implementation, this would initiate the deployment process
    // For this demo, we'll simulate a deployment by waiting and then updating the status

    // Generate a unique endpoint URL for the instance
    const endpointUrl = `https://api.akii.com/v1/${session.user.id.substring(0, 8)}`;

    // Simulate deployment delay (5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Update the instance status to 'active' and set the endpoint URL
    const { error: finalUpdateError } = await supabaseClient
      .from("private_ai_instances")
      .update({
        status: "active",
        endpoint_url: endpointUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", instanceId);

    if (finalUpdateError) {
      return new Response(
        JSON.stringify({ error: "Failed to complete deployment" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Private AI instance deployed successfully",
        endpoint: endpointUrl,
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
