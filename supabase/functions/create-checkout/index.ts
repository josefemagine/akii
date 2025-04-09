import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, queryOne, execute } from "../_shared/postgres.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?dts";

// Import CORS headers helper
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Stripe with options compatible with Deno
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: '2023-10-16',
});

// Cache of plan data to minimize database requests
const planCache = new Map();

interface CheckoutRequest {
  planId: string;
  billingCycle?: 'monthly' | 'annual';
}

interface CheckoutResponse {
  url: string;
}

interface Profile {
  stripe_customer_id: string | null;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  stripe_price_id_monthly: string;
  stripe_price_id_yearly: string;
  [key: string]: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  return handleRequest(
    req,
    async (user, body: CheckoutRequest) => {
      try {
        const { planId, billingCycle = 'monthly' } = body;

        if (!planId) {
          return createErrorResponse('Missing required parameters', 400);
        }

        // Fetch the user's profile
        const profile = await queryOne<Profile>(
          'SELECT stripe_customer_id FROM profiles WHERE id = $1',
          [user.id]
        );

        // Get the subscription plan
        let plan: SubscriptionPlan;
        if (planCache.has(planId)) {
          plan = planCache.get(planId);
        } else {
          const planData = await queryOne<SubscriptionPlan>(
            'SELECT * FROM subscription_plans WHERE id = $1',
            [planId]
          );

          if (!planData) {
            return createErrorResponse('Invalid plan ID', 400);
          }

          plan = planData;
          planCache.set(planId, plan);
        }

        // Determine price ID based on billing cycle
        const priceField = billingCycle === 'annual' ? 'stripe_price_id_yearly' : 'stripe_price_id_monthly';
        const priceId = plan[priceField];

        if (!priceId) {
          return createErrorResponse('No price ID configured for this plan and billing cycle', 400);
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
          await execute(
            'UPDATE profiles SET stripe_customer_id = $1 WHERE id = $2',
            [customerId, user.id]
          );
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

        return createSuccessResponse({
          url: session.url,
        });

      } catch (error) {
        console.error('Error creating checkout session:', error);
        return createErrorResponse(
          error instanceof Error ? error.message : 'An unexpected error occurred',
          500
        );
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "STRIPE_SECRET_KEY", "CLIENT_URL"],
      requireAuth: true,
      requireBody: true,
    }
  );
}); 