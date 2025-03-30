// This edge function updates a user's message usage count

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { userId, tokensUsed = 0 } = await req.json();

    if (!userId) {
      throw new Error("Missing required parameter: userId");
    }

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
    );

    // Get the user's current profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select(
        "id, messages_used, message_limit, subscription_status, trial_ends_at, usage_limit_notification_sent, trial_notification_sent",
      )
      .eq("id", userId)
      .single();

    if (profileError) {
      throw new Error(`Error fetching user profile: ${profileError.message}`);
    }

    // Check if user has reached their message limit
    const newMessagesUsed = (profile.messages_used || 0) + 1;
    const isOverLimit = newMessagesUsed > (profile.message_limit || 1000);

    // Check if trial has expired (if applicable)
    const trialExpired = profile.trial_ends_at
      ? new Date(profile.trial_ends_at) < new Date()
      : false;

    // Check if we need to send usage limit notification
    const messageLimit = profile.message_limit || 1000;
    const usagePct = (newMessagesUsed / messageLimit) * 100;
    const shouldSendUsageLimitNotification =
      usagePct >= 80 && !profile.usage_limit_notification_sent;

    // Check if we need to send trial ending notification
    // Send notification when 2 days or less remain
    const shouldSendTrialNotification =
      profile.trial_ends_at &&
      !profile.trial_notification_sent &&
      new Date(profile.trial_ends_at).getTime() - new Date().getTime() <=
        2 * 24 * 60 * 60 * 1000;

    // Update the user's profile with new usage count
    const { data, error } = await supabaseClient
      .from("profiles")
      .update({
        messages_used: newMessagesUsed,
        subscription_status:
          isOverLimit || trialExpired ? "limited" : profile.subscription_status,
        usage_limit_notification_sent: shouldSendUsageLimitNotification
          ? true
          : profile.usage_limit_notification_sent,
        trial_notification_sent: shouldSendTrialNotification
          ? true
          : profile.trial_notification_sent,
      })
      .eq("id", userId)
      .select();

    // If we should send notifications, we would trigger them here
    // This is where you would integrate with an email or notification service
    if (shouldSendUsageLimitNotification) {
      console.log(
        `Should send usage limit notification to user ${userId} - ${usagePct.toFixed(1)}% of limit used`,
      );
      // TODO: Implement actual notification sending
    }

    if (shouldSendTrialNotification) {
      console.log(`Should send trial ending notification to user ${userId}`);
      // TODO: Implement actual notification sending
    }

    if (error) {
      throw new Error(`Error updating user usage: ${error.message}`);
    }

    // Return the updated profile
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          messagesUsed: newMessagesUsed,
          messageLimit: profile.message_limit,
          isOverLimit: isOverLimit,
          trialExpired: trialExpired,
          subscriptionStatus: data[0].subscription_status,
          usageLimitNotificationSent: data[0].usage_limit_notification_sent,
          trialNotificationSent: data[0].trial_notification_sent,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error updating user usage:", error);
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
