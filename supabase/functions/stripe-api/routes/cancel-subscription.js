var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Handler for canceling subscriptions
export function handleCancelSubscription(req_1, _a) {
    return __awaiter(this, arguments, void 0, function* (req, { stripe, supabaseAdmin, corsHeaders }) {
        try {
            // Parse request body
            const { atPeriodEnd = true } = yield req.json();
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
                .select('id, stripe_subscription_id')
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
            // Cancel the subscription in Stripe
            let updatedSubscription;
            if (atPeriodEnd) {
                // Cancel at the end of the billing period
                updatedSubscription = yield stripe.subscriptions.update(subscription.stripe_subscription_id, { cancel_at_period_end: true });
            }
            else {
                // Cancel immediately
                updatedSubscription = yield stripe.subscriptions.cancel(subscription.stripe_subscription_id);
            }
            // Update the subscription in Supabase
            const updateData = {
                updated_at: new Date().toISOString()
            };
            if (atPeriodEnd) {
                updateData.cancel_at_period_end = true;
            }
            else {
                updateData.status = 'canceled';
                updateData.canceled_at = new Date().toISOString();
            }
            yield supabaseAdmin
                .from('subscriptions')
                .update(updateData)
                .eq('id', subscription.id);
            return new Response(JSON.stringify({
                success: true,
                message: atPeriodEnd ?
                    'Subscription will be canceled at the end of the billing period' :
                    'Subscription canceled immediately',
                data: {
                    subscription_id: updatedSubscription.id,
                    cancel_at_period_end: atPeriodEnd,
                    status: updatedSubscription.status,
                }
            }), {
                status: 200,
                headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
            });
        }
        catch (error) {
            console.error('Error canceling subscription:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
            });
        }
    });
}
