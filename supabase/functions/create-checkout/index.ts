import serve from "https://deno.land/std@0.168.0/http/server.ts";
import createClient from "https://esm.sh/@supabase/supabase-js@2.1.0";
import Stripe from "https://esm.sh/stripe@12.0.0?dts";

// Import CORS headers helper
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Stripe with options compatible with Deno
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

    // Create Supabase client for the function
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

    // Get the user session from the auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch the user's profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      return new Response(JSON.stringify({ error: 'Error fetching profile', details: profileError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the subscription plan
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

    // Get or create customer
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Update the profile with the customer ID
      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${Deno.env.get('CLIENT_URL')}/dashboard?checkout=success`,
      cancel_url: `${Deno.env.get('CLIENT_URL')}/dashboard?checkout=cancelled`,
      metadata: {
        plan_id: planId,
        user_id: user.id,
        billing_cycle: billingCycle,
      },
      subscription_data: {
        metadata: {
          plan_id: planId,
          user_id: user.id,
          billing_cycle: billingCycle,
        },
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 