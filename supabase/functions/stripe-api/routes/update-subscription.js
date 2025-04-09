var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Handler for updating subscriptions
export function handleUpdateSubscription(req_1, _a) {
    return __awaiter(this, arguments, void 0, function* (req, { stripe, supabaseAdmin, corsHeaders }) {
        try {
            // Parse request body
            const { planId, billingCycle = 'monthly' } = yield req.json();
            if (!planId) {
                return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
                    status: 400,
                    headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                });
            }
            // Get authentication context
            const authHeader = req.headers.get('Authorization');
            if (!authHeader) {
                return new Response(JSON.stringify({ error: 'No authorization header provided' }), {
                    status: 401,
                    headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                });
            }
            const token = authHeader.replace('Bearer ', '');
            const { data: { user }, error: authError } = yield supabaseAdmin.auth.getUser(token);
            if (authError || !user) {
                return new Response(JSON.stringify({ error: 'Invalid token' }), {
                    status: 401,
                    headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                });
            }
            // Get user's current subscription
            const { data: subscription, error: subscriptionError } = yield supabaseAdmin
                .from('subscriptions')
                .select('id, stripe_subscription_id, subscription_item_id, plan_id, billing_cycle')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single();
            if (subscriptionError || !(subscription === null || subscription === void 0 ? void 0 : subscription.stripe_subscription_id)) {
                return new Response(JSON.stringify({
                    error: 'No active subscription found for this user',
                    details: subscriptionError || 'Missing subscription data'
                }), {
                    status: 400,
                    headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                });
            }
            // If trying to update to the same plan with the same billing cycle, return early
            const currentBillingCycle = subscription.billing_cycle || 'monthly';
            if (subscription.plan_id === planId && currentBillingCycle === billingCycle) {
                return new Response(JSON.stringify({
                    success: true,
                    message: 'Subscription already on this plan and billing cycle',
                    updated: false
                }), {
                    status: 200,
                    headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                });
            }
            // Get the new plan data
            const { data: plan, error: planError } = yield supabaseAdmin
                .from('subscription_plans')
                .select('*')
                .eq('id', planId)
                .single();
            if (planError || !plan) {
                return new Response(JSON.stringify({ error: 'Invalid plan ID', details: planError }), {
                    status: 400,
                    headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                });
            }
            // Determine price ID based on billing cycle
            const priceField = billingCycle === 'annual' ? 'stripe_price_id_yearly' : 'stripe_price_id_monthly';
            const priceId = plan[priceField];
            if (!priceId) {
                return new Response(JSON.stringify({ error: 'No price ID configured for this plan and billing cycle' }), {
                    status: 400,
                    headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                });
            }
            // Update the subscription in Stripe
            const updatedSubscription = yield stripe.subscriptions.update(subscription.stripe_subscription_id, {
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
            });
            // Update the subscription in Supabase
            yield supabaseAdmin
                .from('subscriptions')
                .update({
                plan_id: planId,
                billing_cycle: billingCycle,
                updated_at: new Date().toISOString(),
            })
                .eq('id', subscription.id);
            return new Response(JSON.stringify({
                success: true,
                message: 'Subscription updated successfully',
                updated: true,
                data: {
                    subscription_id: updatedSubscription.id,
                    plan_id: planId,
                    billing_cycle: billingCycle,
                }
            }), {
                status: 200,
                headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
            });
        }
        catch (error) {
            console.error('Error updating subscription:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
            });
        }
    });
}
