import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, queryOne, execute } from "../_shared/postgres.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

// Define default CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_annual: number;
  stripe_price_id_monthly: string;
  stripe_price_id_annual: string;
  is_active: boolean;
  features: string[];
}

interface UserProfile {
  id: string;
  email: string;
  stripe_customer_id: string | null;
}

// Initialize Stripe with secret key
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// Cache for subscription plans to minimize database requests
const plansCache = new Map();
const PLANS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let plansCacheTime = 0;

async function getSubscriptionPlans() {
  const now = Date.now();
  if (plansCache.size > 0 && now - plansCacheTime < PLANS_CACHE_TTL) {
    return Array.from(plansCache.values());
  }

  const { rows } = await query<SubscriptionPlan>(
    "SELECT * FROM subscription_plans WHERE is_active = true"
  );

  // Update cache
  plansCache.clear();
  rows.forEach(plan => {
    plansCache.set(plan.id, plan);
  });
  plansCacheTime = now;

  return rows;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, requestBody) => {
      try {
        const url = new URL(req.url);
        const action = url.pathname.split("/").pop();

        // Handle different API actions
        switch (action) {
          case "create-checkout": {
            const { planId, billingCycle, successUrl, cancelUrl } = requestBody;
            
            if (!planId) {
              return createErrorResponse("Plan ID is required", 400);
            }

            if (!["monthly", "annual"].includes(billingCycle)) {
              return createErrorResponse("Billing cycle must be 'monthly' or 'annual'", 400);
            }

            // Get plan details
            const plans = await getSubscriptionPlans();
            const plan = plans.find(p => p.id === planId);
            if (!plan) {
              return createErrorResponse("Plan not found or inactive", 404);
            }

            // Get pricing ID based on billing cycle
            const priceId = billingCycle === "monthly" 
              ? plan.stripe_price_id_monthly 
              : plan.stripe_price_id_annual;

            if (!priceId) {
              return createErrorResponse(`No ${billingCycle} price ID configured for this plan`, 400);
            }

            // Get user profile to check if they already have a customer ID
            const profile = await queryOne<UserProfile>(
              "SELECT id, email, stripe_customer_id FROM profiles WHERE id = $1",
              [user.id]
            );

            if (!profile) {
              return createErrorResponse("User profile not found", 404);
            }

            let customerId = profile.stripe_customer_id;

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
              await execute(
                "UPDATE profiles SET stripe_customer_id = $1 WHERE id = $2",
                [customerId, user.id]
              );
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
              success_url: `${successUrl || Deno.env.get("STRIPE_SUCCESS_URL")}?session_id={CHECKOUT_SESSION_ID}`,
              cancel_url: `${cancelUrl || Deno.env.get("STRIPE_CANCEL_URL")}`,
              subscription_data: {
                metadata: {
                  user_id: user.id,
                  plan_id: planId,
                },
              },
            });

            return createSuccessResponse({ 
              sessionId: session.id, 
              url: session.url 
            });
          }

          case "create-portal": {
            const { returnUrl } = requestBody;
            
            // Get user profile
            const profile = await queryOne<UserProfile>(
              "SELECT id, email, stripe_customer_id FROM profiles WHERE id = $1",
              [user.id]
            );

            if (!profile) {
              return createErrorResponse("User profile not found", 404);
            }

            if (!profile.stripe_customer_id) {
              return createErrorResponse("No subscription found for this user", 404);
            }

            // Create billing portal session
            const session = await stripe.billingPortal.sessions.create({
              customer: profile.stripe_customer_id,
              return_url: returnUrl || Deno.env.get("STRIPE_RETURN_URL"),
            });

            return createSuccessResponse({ url: session.url });
          }

          default:
            return createErrorResponse("Invalid action", 404);
        }
      } catch (error) {
        console.error("Error processing request:", error);
        return createErrorResponse(
          error instanceof Error ? error.message : "Internal server error",
          500
        );
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "STRIPE_SECRET_KEY"],
      requireAuth: true,
      requireBody: true,
    }
  );
}); 