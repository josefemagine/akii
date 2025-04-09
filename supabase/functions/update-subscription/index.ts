import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, queryOne, execute } from "../_shared/postgres.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?dts";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: '2023-10-16',
});

// Cache of plan data to minimize database requests
const planCache = new Map();

interface UpdateSubscriptionRequest {
  planId: string;
  billingCycle?: 'monthly' | 'annual';
}

interface UpdateSubscriptionResponse {
  success: boolean;
  message: string;
  updated: boolean;
  data?: {
    subscription_id: string;
    plan_id: string;
    billing_cycle: string;
  };
}

interface Subscription {
  id: string;
  stripe_subscription_id: string;
  plan_id: string;
  billing_cycle: string;
  subscription_item_id: string;
}

interface SubscriptionPlan {
  id: string;
  stripe_price_id_monthly: string;
  stripe_price_id_yearly: string;
  [key: string]: any;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: UpdateSubscriptionRequest) => {
      try {
        const { planId, billingCycle = 'monthly' } = body;

        if (!planId) {
          return createErrorResponse('Missing required parameters', 400);
        }

        // Get user's current subscription
        const subscription = await queryOne<Subscription>(
          `SELECT id, stripe_subscription_id, plan_id, billing_cycle, subscription_item_id 
           FROM subscriptions 
           WHERE user_id = $1 AND status = $2`,
          [user.id, 'active']
        );

        if (!subscription?.stripe_subscription_id) {
          return createErrorResponse(
            'No active subscription found for this user',
            400
          );
        }

        // If trying to update to the same plan with the same billing cycle, return early
        const currentBillingCycle = subscription.billing_cycle || 'monthly';
        if (subscription.plan_id === planId && currentBillingCycle === billingCycle) {
          return createSuccessResponse({
            success: true,
            message: 'Subscription already on this plan and billing cycle',
            updated: false,
          });
        }

        // Get the new plan data
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

        // Update the subscription in Stripe
        const updatedSubscription = await stripe.subscriptions.update(
          subscription.stripe_subscription_id,
          {
            items: [
              {
                id: subscription.subscription_item_id,
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

        // Update the subscription in database
        await execute(
          `UPDATE subscriptions 
           SET plan_id = $1, billing_cycle = $2, updated_at = $3 
           WHERE id = $4`,
          [planId, billingCycle, new Date().toISOString(), subscription.id]
        );

        return createSuccessResponse({
          success: true,
          message: 'Subscription updated successfully',
          updated: true,
          data: {
            subscription_id: updatedSubscription.id,
            plan_id: planId,
            billing_cycle: billingCycle,
          },
        });

      } catch (error) {
        console.error('Error updating subscription:', error);
        return createErrorResponse(
          error instanceof Error ? (error instanceof Error ? error.message : String(error)) : 'An unexpected error occurred',
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