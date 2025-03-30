import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
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

    // Get the user from the auth context
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Get the request body
    const { name, description, model_type, settings } = await req.json();

    // Validate required fields
    if (!name || !model_type) {
      return new Response(
        JSON.stringify({ error: "Name and model type are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Check user's subscription to see if they can create more agents
    const { data: subscription, error: subscriptionError } =
      await supabaseClient
        .from("subscriptions")
        .select("*, subscription_plans(*)")
        .eq("user_id", user.id)
        .single();

    if (subscriptionError && subscriptionError.code !== "PGRST116") {
      return new Response(
        JSON.stringify({ error: "Failed to check subscription" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    // Count existing agents
    const { count: agentCount, error: countError } = await supabaseClient
      .from("agents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      return new Response(
        JSON.stringify({ error: "Failed to count existing agents" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    // Check if user has reached their agent limit
    if (subscription && subscription.subscription_plans) {
      const agentLimit = subscription.subscription_plans.agents_limit;
      if (agentCount && agentCount >= agentLimit) {
        return new Response(
          JSON.stringify({
            error: "Agent limit reached for your subscription plan",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403,
          },
        );
      }
    }

    // Create the agent
    const { data: agent, error: insertError } = await supabaseClient
      .from("agents")
      .insert({
        user_id: user.id,
        name,
        description,
        model_type,
        settings: settings || {},
      })
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({
          error: "Failed to create agent",
          details: insertError,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    // Log analytics event
    await supabaseClient.from("analytics_events").insert({
      user_id: user.id,
      agent_id: agent.id,
      event_type: "agent_created",
      event_data: { agent_name: name, model_type },
    });

    return new Response(JSON.stringify({ agent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
