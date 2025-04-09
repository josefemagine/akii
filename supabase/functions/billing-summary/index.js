var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { queryOne } from "../_shared/postgres.ts";
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Fetch the user's subscription data
            const subscription = yield queryOne('SELECT * FROM user_subscriptions WHERE user_id = $1', [user.id]);
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
            const plan = yield queryOne('SELECT * FROM subscription_plans WHERE id = $1', [subscription.plan_id]);
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
        }
        catch (error) {
            console.error("Error fetching billing summary:", error);
            return createErrorResponse("An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
    });
}));
