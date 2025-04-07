import serve from "https://deno.land/std@0.168.0/http/server.ts";
import createClient from "https://esm.sh/@supabase/supabase-js@2.1.0";
import Stripe from "https://esm.sh/stripe@12.0.0?dts";

// Import CORS headers helper
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Parse request body
    const { atPeriodEnd = true } = await req.json();
    
    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get authentication context
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header provided' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user's current subscription
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, stripe_subscription_id, plan_id, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subscriptionError || !subscription?.stripe_subscription_id) {
      return new Response(
        JSON.stringify({ 
          error: 'No active subscription found for this user',
          details: subscriptionError || 'Missing subscription data'
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Cancel the subscription in Stripe
    const canceledSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: atPeriodEnd,
      }
    );

    // If immediate cancellation, update the status in the database
    if (!atPeriodEnd) {
      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);
    } else {
      // Update the database that the subscription is marked for cancellation
      await supabaseAdmin
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: atPeriodEnd 
          ? 'Subscription will be canceled at the end of the billing period' 
          : 'Subscription canceled immediately',
        data: {
          subscription_id: canceledSubscription.id,
          status: canceledSubscription.status,
          cancel_at_period_end: canceledSubscription.cancel_at_period_end,
          current_period_end: new Date(canceledSubscription.current_period_end * 1000).toISOString(),
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error canceling subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 