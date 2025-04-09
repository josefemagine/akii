var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { query, execute } from "../_shared/postgres.ts";
import { createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?dts";
// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: '2023-10-16',
});
// Define Stripe event handlers
function processStripeWebhook(req) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the signature from the headers
        const signature = req.headers.get('stripe-signature');
        if (!signature) {
            throw new Error('Missing Stripe signature');
        }
        // Get raw body
        const body = yield req.text();
        // Verify the event using the webhook secret and signature
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log(`Processing Stripe event: ${event.type}`);
        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                yield handleCheckoutSessionCompleted(session);
                break;
            }
            case 'invoice.paid': {
                const invoice = event.data.object;
                yield handleInvoicePaid(invoice);
                break;
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                yield handleInvoicePaymentFailed(invoice);
                break;
            }
            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                yield handleSubscriptionUpdated(subscription);
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                yield handleSubscriptionDeleted(subscription);
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        return { status: 'success', eventType: event.type };
    });
}
// Main handler function
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    // For Stripe webhooks, we don't need authentication
    if (req.method === "POST") {
        try {
            const result = yield processStripeWebhook(req);
            return createSuccessResponse(result);
        }
        catch (error) {
            console.error('Error processing webhook:', error);
            return createErrorResponse(error.message, 400);
        }
    }
    return createErrorResponse('Method not allowed', 405);
}));
// Handle checkout.session.completed event
function handleCheckoutSessionCompleted(session) {
    return __awaiter(this, void 0, void 0, function* () {
        if (session.mode !== 'subscription')
            return;
        const userId = session.metadata.user_id;
        const planId = session.metadata.plan_id;
        const billingCycle = session.metadata.billing_cycle;
        if (!userId || !planId) {
            console.error('Missing metadata in checkout session:', session.id);
            return;
        }
        // Get subscription details
        const subscription = yield stripe.subscriptions.retrieve(session.subscription);
        // Update the user's subscription information
        try {
            yield execute(`INSERT INTO user_subscriptions (
        user_id,
        stripe_customer_id,
        stripe_subscription_id,
        plan_id,
        status,
        billing_cycle,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (user_id) 
      DO UPDATE SET
        stripe_customer_id = EXCLUDED.stripe_customer_id,
        stripe_subscription_id = EXCLUDED.stripe_subscription_id,
        plan_id = EXCLUDED.plan_id,
        status = EXCLUDED.status,
        billing_cycle = EXCLUDED.billing_cycle,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        cancel_at_period_end = EXCLUDED.cancel_at_period_end,
        payment_status = EXCLUDED.payment_status`, [
                userId,
                session.customer,
                session.subscription,
                planId,
                subscription.status,
                billingCycle,
                new Date(subscription.current_period_start * 1000).toISOString(),
                new Date(subscription.current_period_end * 1000).toISOString(),
                subscription.cancel_at_period_end,
                'active'
            ]);
        }
        catch (error) {
            console.error('Error updating subscription:', error);
        }
    });
}
// Handle invoice.paid event
function handleInvoicePaid(invoice) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!invoice.subscription)
            return;
        const subscription = yield stripe.subscriptions.retrieve(invoice.subscription);
        const userId = subscription.metadata.user_id;
        if (!userId) {
            console.error('Missing user_id in subscription metadata:', subscription.id);
            return;
        }
        // Update the user's subscription status
        try {
            yield execute(`UPDATE user_subscriptions
       SET 
         status = $1,
         current_period_start = $2,
         current_period_end = $3,
         cancel_at_period_end = $4,
         payment_status = $5
       WHERE user_id = $6`, [
                subscription.status,
                new Date(subscription.current_period_start * 1000).toISOString(),
                new Date(subscription.current_period_end * 1000).toISOString(),
                subscription.cancel_at_period_end,
                'active',
                userId
            ]);
        }
        catch (error) {
            console.error('Error updating subscription after invoice paid:', error);
        }
    });
}
// Handle invoice.payment_failed event
function handleInvoicePaymentFailed(invoice) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!invoice.subscription)
            return;
        const subscription = yield stripe.subscriptions.retrieve(invoice.subscription);
        const userId = subscription.metadata.user_id;
        if (!userId) {
            console.error('Missing user_id in subscription metadata:', subscription.id);
            return;
        }
        // Update the user's subscription status
        try {
            yield execute(`UPDATE user_subscriptions
       SET payment_status = $1
       WHERE user_id = $2`, ['failed', userId]);
        }
        catch (error) {
            console.error('Error updating subscription after payment failure:', error);
        }
    });
}
// Handle customer.subscription.updated event
function handleSubscriptionUpdated(subscription) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const userId = subscription.metadata.user_id;
        if (!userId) {
            console.error('Missing user_id in subscription metadata:', subscription.id);
            return;
        }
        // Get the plan ID from the subscription
        const priceId = (_a = subscription.items.data[0]) === null || _a === void 0 ? void 0 : _a.price.id;
        let planId = subscription.metadata.plan_id;
        if (!planId && priceId) {
            // Try to find the plan ID from the price ID
            try {
                const plans = yield query(`SELECT id FROM subscription_plans
         WHERE stripe_price_id_monthly = $1 OR stripe_price_id_annual = $1
         LIMIT 1`, [priceId]);
                if (plans.rows.length > 0) {
                    planId = plans.rows[0].id;
                }
            }
            catch (error) {
                console.error('Error finding plan from price ID:', error);
            }
        }
        // Update the user's subscription information
        try {
            yield execute(`UPDATE user_subscriptions
       SET 
         plan_id = $1,
         status = $2,
         current_period_start = $3,
         current_period_end = $4,
         cancel_at_period_end = $5,
         billing_cycle = $6
       WHERE user_id = $7`, [
                planId,
                subscription.status,
                new Date(subscription.current_period_start * 1000).toISOString(),
                new Date(subscription.current_period_end * 1000).toISOString(),
                subscription.cancel_at_period_end,
                (((_b = subscription.items.data[0]) === null || _b === void 0 ? void 0 : _b.plan.interval) === 'year') ? 'annual' : 'monthly',
                userId
            ]);
        }
        catch (error) {
            console.error('Error updating subscription after update:', error);
        }
    });
}
// Handle customer.subscription.deleted event
function handleSubscriptionDeleted(subscription) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = subscription.metadata.user_id;
        if (!userId) {
            console.error('Missing user_id in subscription metadata:', subscription.id);
            return;
        }
        // Update the user's subscription status
        try {
            yield execute(`UPDATE user_subscriptions
       SET 
         status = $1,
         cancel_at_period_end = $2
       WHERE user_id = $3`, ['canceled', false, userId]);
        }
        catch (error) {
            console.error('Error updating subscription after deletion:', error);
        }
    });
}
