// This edge function handles subscription webhook events from payment processors

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Map of subscription plans to message limits
const PLAN_MESSAGE_LIMITS = {
  free: 100, // Trial
  basic: 1000,
  pro: 5000,
  scale: 25000,
  enterprise: 50000,
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the request body
    const {
      event,
      customerId,
      subscriptionId,
      plan,
      status,
      renewalDate,
      paymentMethod,
      userId,
      addons = [],
    } = await req.json();

    if (!event || !userId) {
      throw new Error(
        "Missing required parameters: event and userId are required",
      );
    }

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
    );

    // Process the webhook event
    switch (event) {
      case "subscription_created":
      case "subscription_updated":
        if (!plan) {
          throw new Error("Missing required parameter: plan");
        }

        // Format addons as a JSON object
        const addonsObject = {};
        for (const addon of addons) {
          addonsObject[addon.name] = addon.quantity || 1;
        }

        // Update the user's profile with subscription information
        const { data, error } = await supabaseClient
          .from("profiles")
          .update({
            subscription_tier: plan.toLowerCase(),
            subscription_status: status || "active",
            message_limit: PLAN_MESSAGE_LIMITS[plan.toLowerCase()] || 1000,
            subscription_renews_at: renewalDate
              ? new Date(renewalDate).toISOString()
              : null,
            payment_method_type: paymentMethod || null,
            payment_customer_id: customerId || null,
            payment_subscription_id: subscriptionId || null,
            subscription_updated_at: new Date().toISOString(),
            subscription_addons: addonsObject,
            // Reset notification flags when subscription is updated
            usage_limit_notification_sent: false,
          })
          .eq("id", userId)
          .select();

        if (error) {
          throw new Error(`Error updating user profile: ${error.message}`);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `Subscription ${event === "subscription_created" ? "created" : "updated"} successfully`,
            data: data[0],
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );

      case "subscription_cancelled":
        // Update the user's profile to reflect cancelled subscription
        const { data: cancelData, error: cancelError } = await supabaseClient
          .from("profiles")
          .update({
            subscription_status: "cancelled",
            subscription_updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .select();

        if (cancelError) {
          throw new Error(
            `Error updating user profile: ${cancelError.message}`,
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Subscription cancelled successfully",
            data: cancelData[0],
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );

      case "trial_ending_soon":
        // Update the user's profile to reflect trial ending soon
        const { data: trialData, error: trialError } = await supabaseClient
          .from("profiles")
          .update({
            trial_notification_sent: true,
          })
          .eq("id", userId)
          .select();

        if (trialError) {
          throw new Error(`Error updating user profile: ${trialError.message}`);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Trial ending notification processed",
            data: trialData[0],
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );

      default:
        throw new Error(`Unsupported event type: ${event}`);
    }
  } catch (error) {
    console.error("Error processing subscription webhook:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
