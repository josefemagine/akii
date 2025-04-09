var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Handler for Stripe webhook events
export function handleWebhook(req_1, _a) {
    return __awaiter(this, arguments, void 0, function* (req, { stripe, supabaseAdmin, corsHeaders }) {
        try {
            // Verify that this is a real Stripe webhook
            const signature = req.headers.get('stripe-signature');
            if (!signature) {
                return new Response(JSON.stringify({ error: 'Missing stripe signature' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            // Get the raw body as text
            const body = yield req.text();
            // Verify the webhook signature
            const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
            const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
            // Process the event
            switch (event.type) {
                // Handle subscription creation
                case 'customer.subscription.created':
                    yield handleSubscriptionCreated(event.data.object, supabaseAdmin);
                    break;
                // Handle subscription updates
                case 'customer.subscription.updated':
                    yield handleSubscriptionUpdated(event.data.object, supabaseAdmin);
                    break;
                // Handle successful payments
                case 'invoice.payment_succeeded':
                    yield handlePaymentSucceeded(event.data.object, supabaseAdmin);
                    break;
                // Handle payment failures
                case 'invoice.payment_failed':
                    yield handlePaymentFailed(event.data.object, supabaseAdmin);
                    break;
                // Handle subscription cancellation
                case 'customer.subscription.deleted':
                    yield handleSubscriptionCanceled(event.data.object, supabaseAdmin);
                    break;
                // Handle customer creation
                case 'customer.created':
                    yield handleCustomerCreated(event.data.object, supabaseAdmin);
                    break;
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }
            return new Response(JSON.stringify({ received: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        catch (error) {
            console.error('Error handling webhook:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    });
}
/**
 * Handle a new subscription creation
 */
function handleSubscriptionCreated(subscription, supabaseAdmin) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get the customer and plan IDs from the metadata
            const { user_id, plan_id, billing_cycle } = subscription.metadata;
            if (!user_id || !plan_id) {
                console.error('Missing metadata in subscription:', subscription.id);
                return;
            }
            // Get the subscription item ID
            const subscriptionItem = subscription.items.data[0];
            if (!subscriptionItem) {
                console.error('No subscription item found for subscription:', subscription.id);
                return;
            }
            // Create a new subscription record in Supabase
            yield supabaseAdmin
                .from('subscriptions')
                .insert({
                user_id,
                plan_id,
                stripe_subscription_id: subscription.id,
                stripe_customer_id: subscription.customer,
                subscription_item_id: subscriptionItem.id,
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                billing_cycle: billing_cycle || 'monthly',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
            console.log('Subscription created:', subscription.id);
        }
        catch (error) {
            console.error('Error creating subscription record:', error);
            throw error; // Rethrow to return proper error response
        }
    });
}
/**
 * Handle subscription updates
 */
function handleSubscriptionUpdated(subscription, supabaseAdmin) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get the existing subscription from Supabase
            const { data: existingSubscription, error } = yield supabaseAdmin
                .from('subscriptions')
                .select('id')
                .eq('stripe_subscription_id', subscription.id)
                .single();
            if (error || !existingSubscription) {
                console.error('Subscription not found in database:', subscription.id);
                return;
            }
            // Get the subscription item ID
            const subscriptionItem = subscription.items.data[0];
            // Update the subscription record
            yield supabaseAdmin
                .from('subscriptions')
                .update({
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                subscription_item_id: (subscriptionItem === null || subscriptionItem === void 0 ? void 0 : subscriptionItem.id) || null,
                plan_id: subscription.metadata.plan_id || null, // Update if changed
                billing_cycle: subscription.metadata.billing_cycle || null,
                updated_at: new Date().toISOString(),
            })
                .eq('id', existingSubscription.id);
            console.log('Subscription updated:', subscription.id);
        }
        catch (error) {
            console.error('Error updating subscription record:', error);
            throw error;
        }
    });
}
/**
 * Handle successful payments
 */
function handlePaymentSucceeded(invoice, supabaseAdmin) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Only process subscription invoices
            if (!invoice.subscription)
                return;
            // Check if we already have an invoice record
            const { data: existingInvoice } = yield supabaseAdmin
                .from('invoices')
                .select('id')
                .eq('stripe_invoice_id', invoice.id)
                .single();
            if (existingInvoice) {
                // Update existing invoice
                yield supabaseAdmin
                    .from('invoices')
                    .update({
                    status: invoice.status,
                    amount_paid: invoice.amount_paid / 100, // Convert from cents
                    updated_at: new Date().toISOString(),
                })
                    .eq('id', existingInvoice.id);
            }
            else {
                // Get the user ID from the customer
                const { data: user, error: userError } = yield supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('stripe_customer_id', invoice.customer)
                    .single();
                if (userError || !user) {
                    console.error('User not found for customer:', invoice.customer);
                    return;
                }
                // Get the subscription ID
                const { data: subscription, error: subError } = yield supabaseAdmin
                    .from('subscriptions')
                    .select('id')
                    .eq('stripe_subscription_id', invoice.subscription)
                    .single();
                // Create a new invoice record
                yield supabaseAdmin
                    .from('invoices')
                    .insert({
                    user_id: user.id,
                    subscription_id: (subscription === null || subscription === void 0 ? void 0 : subscription.id) || null,
                    stripe_invoice_id: invoice.id,
                    amount_due: invoice.amount_due / 100, // Convert from cents
                    amount_paid: invoice.amount_paid / 100, // Convert from cents
                    status: invoice.status,
                    invoice_date: new Date(invoice.created * 1000).toISOString(),
                    due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });
            }
            console.log('Payment succeeded for invoice:', invoice.id);
        }
        catch (error) {
            console.error('Error handling payment success:', error);
            throw error;
        }
    });
}
/**
 * Handle payment failures
 */
function handlePaymentFailed(invoice, supabaseAdmin) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Only process subscription invoices
            if (!invoice.subscription)
                return;
            // Get the subscription
            const { data: subscription, error: subError } = yield supabaseAdmin
                .from('subscriptions')
                .select('id, user_id')
                .eq('stripe_subscription_id', invoice.subscription)
                .single();
            if (subError || !subscription) {
                console.error('Subscription not found:', invoice.subscription);
                return;
            }
            // Store or update the invoice
            const { data: existingInvoice } = yield supabaseAdmin
                .from('invoices')
                .select('id')
                .eq('stripe_invoice_id', invoice.id)
                .single();
            if (existingInvoice) {
                yield supabaseAdmin
                    .from('invoices')
                    .update({
                    status: invoice.status,
                    updated_at: new Date().toISOString(),
                })
                    .eq('id', existingInvoice.id);
            }
            else {
                yield supabaseAdmin
                    .from('invoices')
                    .insert({
                    user_id: subscription.user_id,
                    subscription_id: subscription.id,
                    stripe_invoice_id: invoice.id,
                    amount_due: invoice.amount_due / 100,
                    amount_paid: invoice.amount_paid / 100,
                    status: invoice.status,
                    invoice_date: new Date(invoice.created * 1000).toISOString(),
                    due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });
            }
            // Update the subscription status to past_due if necessary
            yield supabaseAdmin
                .from('subscriptions')
                .update({
                status: 'past_due',
                updated_at: new Date().toISOString(),
            })
                .eq('id', subscription.id);
            console.log('Payment failed for invoice:', invoice.id);
        }
        catch (error) {
            console.error('Error handling payment failure:', error);
            throw error;
        }
    });
}
/**
 * Handle subscription cancellation
 */
function handleSubscriptionCanceled(subscription, supabaseAdmin) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get the subscription from Supabase
            const { data: existingSubscription, error } = yield supabaseAdmin
                .from('subscriptions')
                .select('id')
                .eq('stripe_subscription_id', subscription.id)
                .single();
            if (error || !existingSubscription) {
                console.error('Subscription not found in database:', subscription.id);
                return;
            }
            // Update the subscription record
            yield supabaseAdmin
                .from('subscriptions')
                .update({
                status: 'canceled',
                cancel_at_period_end: false, // Already canceled
                canceled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
                .eq('id', existingSubscription.id);
            console.log('Subscription canceled:', subscription.id);
        }
        catch (error) {
            console.error('Error canceling subscription record:', error);
            throw error;
        }
    });
}
/**
 * Handle customer creation
 */
function handleCustomerCreated(customer, supabaseAdmin) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // If the customer has a metadata.user_id, update the user's profile with the customer ID
            if ((_a = customer.metadata) === null || _a === void 0 ? void 0 : _a.user_id) {
                yield supabaseAdmin
                    .from('profiles')
                    .update({
                    stripe_customer_id: customer.id,
                    updated_at: new Date().toISOString(),
                })
                    .eq('id', customer.metadata.user_id);
                console.log('User profile updated with Stripe customer ID:', customer.id);
            }
            else {
                // Try to match by email
                const { data: user, error: userError } = yield supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('email', customer.email)
                    .single();
                if (!userError && user) {
                    yield supabaseAdmin
                        .from('profiles')
                        .update({
                        stripe_customer_id: customer.id,
                        updated_at: new Date().toISOString(),
                    })
                        .eq('id', user.id);
                    console.log('User profile updated with Stripe customer ID (by email):', customer.id);
                }
                else {
                    console.log('Could not match Stripe customer to user:', customer.id);
                }
            }
        }
        catch (error) {
            console.error('Error processing customer creation:', error);
            throw error;
        }
    });
}
