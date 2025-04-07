import serve from "https://deno.land/std@0.168.0/http/server.ts";
import createClient from "https://esm.sh/@supabase/supabase-js@2.1.0";
import Stripe from "https://esm.sh/stripe@12.0.0?dts";

// Import CORS headers helper
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: '2023-10-16',
});

// Cache of plan data to minimize database requests
const planCache = new Map();

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
    const { planId, billingCycle = 'monthly' } = await req.json();
    
    if (!planId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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
      .select('id, stripe_subscription_id, plan_id')
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

    // If trying to update to the same plan with the same billing cycle, return early
    const currentBillingCycle = subscription.billing_cycle || 'monthly';
    if (subscription.plan_id === planId && currentBillingCycle === billingCycle) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Subscription already on this plan and billing cycle',
          updated: false
        }), 
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the new plan data
    let plan;
    if (planCache.has(planId)) {
      plan = planCache.get(planId);
    } else {
      const { data: planData, error: planError } = await supabaseAdmin
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError || !planData) {
        return new Response(JSON.stringify({ error: 'Invalid plan ID', details: planError }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      plan = planData;
      planCache.set(planId, plan);
    }

    // Determine price ID based on billing cycle
    const priceField = billingCycle === 'annual' ? 'stripe_price_id_yearly' : 'stripe_price_id_monthly';
    const priceId = plan[priceField];

    if (!priceId) {
      return new Response(JSON.stringify({ error: 'No price ID configured for this plan and billing cycle' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update the subscription in Stripe
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        items: [
          {
            id: subscription.subscription_item_id, // Get from subscription table or Stripe API
            price: priceId,
          },
        ],
        metadata: {
          plan_id: planId,
          user_id: user.id,
          billing_cycle: billingCycle,
        },
        proration_behavior: 'create_prorations',
      }
    );

    // Update the subscription in Supabase
    await supabaseAdmin
      .from('subscriptions')
      .update({
        plan_id: planId,
        billing_cycle: billingCycle,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription updated successfully',
        updated: true,
        data: {
          subscription_id: updatedSubscription.id,
          plan_id: planId,
          billing_cycle: billingCycle,
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error updating subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 