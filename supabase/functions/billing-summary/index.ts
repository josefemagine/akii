import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, queryOne } from "../_shared/postgres.ts";

interface UserSubscription {
  status: string | null;
  plan_id: string | null;
  billing_cycle: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  payment_status: string | null;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  message_limit: number;
}

interface BillingSummary {
  status: string | null;
  planId: string | null;
  planName: string;
  messageLimit: number;
  billingCycle: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  paymentStatus: string | null;
  trialEndsAt: string | null;
  nextBillingDate: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user) => {
      try {
        // Fetch the user's subscription data
        const subscription = await queryOne<UserSubscription>(
          'SELECT * FROM user_subscriptions WHERE user_id = $1',
          [user.id]
        );

        // If no subscription, return a default response
        if (!subscription) {
          return createSuccessResponse({
            status: 'none',
            planId: null,
            planName: 'Free',
            messageLimit: 0,
            billingCycle: null,
            currentPeriodStart: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            paymentStatus: null,
            trialEndsAt: null,
            nextBillingDate: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
          });
        }

        // Fetch the plan details
        const plan = await queryOne<SubscriptionPlan>(
          'SELECT * FROM subscription_plans WHERE id = $1',
          [subscription.plan_id]
        );

        if (!plan) {
          console.error("Plan not found for ID:", subscription.plan_id);
          return createErrorResponse("Failed to fetch plan details", 500);
        }

        return createSuccessResponse({
          status: subscription.status,
          planId: subscription.plan_id,
          planName: plan.name || 'Unknown Plan',
          messageLimit: plan.message_limit || 0,
          billingCycle: subscription.billing_cycle,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          paymentStatus: subscription.payment_status,
          trialEndsAt: subscription.trial_ends_at,
          nextBillingDate: subscription.current_period_end,
          stripeCustomerId: subscription.stripe_customer_id,
          stripeSubscriptionId: subscription.stripe_subscription_id,
        });
      } catch (error) {
        console.error("Error fetching billing summary:", error);
        return createErrorResponse("An unexpected error occurred", 500);
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
      requireAuth: true,
    }
  );
}); 