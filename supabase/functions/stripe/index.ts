import serve from "https://deno.land/std@0.168.0/http/server.ts";
import createClient from "https://esm.sh/@supabase/supabase-js@2.24.0";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

// Define default CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Initialize Stripe with secret key
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Cache for subscription plans to minimize database requests
const plansCache = new Map();
const PLANS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let plansCacheTime = 0;

async function getSubscriptionPlans() {
  const now = Date.now();
  if (plansCache.size > 0 && now - plansCacheTime < PLANS_CACHE_TTL) {
    return Array.from(plansCache.values());
  }

  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true);

  if (error) {
    throw new Error(`Error fetching plans: ${error.message}`);
  }

  // Update cache
  plansCache.clear();
  data.forEach(plan => {
    plansCache.set(plan.id, plan);
  });
  plansCacheTime = now;

  return data;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Add CORS headers to all responses
  const headers = new Headers(corsHeaders);
  headers.set("Content-Type", "application/json");

  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers }
      );
    }

    // Extract JWT token
    const token = authHeader.split(" ")[1];

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers }
      );
    }

    // Handle different API actions
    switch (action) {
      case "create-checkout": {
        const { planId, billingCycle } = requestBody;
        
        if (!planId) {
          return new Response(
            JSON.stringify({ error: "Plan ID is required" }),
            { status: 400, headers }
          );
        }

        if (!["monthly", "annual"].includes(billingCycle)) {
          return new Response(
            JSON.stringify({ error: "Billing cycle must be 'monthly' or 'annual'" }),
            { status: 400, headers }
          );
        }

        // Get plan details
        const plans = await getSubscriptionPlans();
        const plan = plans.find(p => p.id === planId);
        if (!plan) {
          return new Response(
            JSON.stringify({ error: "Plan not found or inactive" }),
            { status: 404, headers }
          );
        }

        // Get pricing ID based on billing cycle
        const priceId = billingCycle === "monthly" 
          ? plan.stripe_price_id_monthly 
          : plan.stripe_price_id_annual;

        if (!priceId) {
          return new Response(
            JSON.stringify({ error: `No ${billingCycle} price ID configured for this plan` }),
            { status: 400, headers }
          );
        }

        // Get user profile to check if they already have a customer ID
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("stripe_customer_id")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          return new Response(
            JSON.stringify({ error: "Error fetching user profile" }),
            { status: 500, headers }
          );
        }

        let customerId = profiles?.stripe_customer_id;

        // Create customer if not exists
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            metadata: {
              user_id: user.id,
            },
          });
          customerId = customer.id;

          // Update user profile with customer ID
          await supabase
            .from("profiles")
            .update({ stripe_customer_id: customerId })
            .eq("id", user.id);
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${requestBody.successUrl || Deno.env.get("STRIPE_SUCCESS_URL")}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${requestBody.cancelUrl || Deno.env.get("STRIPE_CANCEL_URL")}`,
          subscription_data: {
            metadata: {
              user_id: user.id,
              plan_id: planId,
            },
          },
        });

        return new Response(
          JSON.stringify({ sessionId: session.id, url: session.url }),
          { status: 200, headers }
        );
      }

      case "create-portal": {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("stripe_customer_id")
          .eq("id", user.id)
          .single();

        if (profileError) {
          return new Response(
            JSON.stringify({ error: "Error fetching user profile" }),
            { status: 500, headers }
          );
        }

        if (!profile.stripe_customer_id) {
          return new Response(
            JSON.stringify({ error: "No subscription found for this user" }),
            { status: 404, headers }
          );
        }

        // Create billing portal session
        const session = await stripe.billingPortal.sessions.create({
          customer: profile.stripe_customer_id,
          return_url: requestBody.returnUrl || Deno.env.get("STRIPE_RETURN_URL"),
        });

        return new Response(
          JSON.stringify({ url: session.url }),
          { status: 200, headers }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 404, headers }
        );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers }
    );
  }
}); 