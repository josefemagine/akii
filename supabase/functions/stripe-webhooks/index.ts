import serve from "https://deno.land/std@0.168.0/http/server.ts";
import createClient from "https://esm.sh/@supabase/supabase-js@2.1.0";
import Stripe from "https://esm.sh/stripe@12.0.0?dts";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: '2023-10-16',
});

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

serve(async (req) => {
  // Get the signature from the headers
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing Stripe signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get raw body
    const body = await req.text();
    
    // Verify the event using the webhook secret and signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    console.log(`Processing Stripe event: ${event.type}`);
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object;
        await handleInvoicePaid(invoice);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handleInvoicePaymentFailed(invoice);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return new Response(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Handle checkout.session.completed event
async function handleCheckoutSessionCompleted(session) {
  if (session.mode !== 'subscription') return;
  
  const userId = session.metadata.user_id;
  const planId = session.metadata.plan_id;
  const billingCycle = session.metadata.billing_cycle;
  
  if (!userId || !planId) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }
  
  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  
  // Update the user's subscription information
  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      plan_id: planId,
      status: subscription.status,
      billing_cycle: billingCycle,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      payment_status: 'active',
    }, { onConflict: 'user_id' });
  
  if (error) {
    console.error('Error updating subscription:', error);
  }
}

// Handle invoice.paid event
async function handleInvoicePaid(invoice) {
  if (!invoice.subscription) return;
  
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata.user_id;
  
  if (!userId) {
    console.error('Missing user_id in subscription metadata:', subscription.id);
    return;
  }
  
  // Update the user's subscription status
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      payment_status: 'active',
    })
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error updating subscription after invoice paid:', error);
  }
}

// Handle invoice.payment_failed event
async function handleInvoicePaymentFailed(invoice) {
  if (!invoice.subscription) return;
  
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata.user_id;
  
  if (!userId) {
    console.error('Missing user_id in subscription metadata:', subscription.id);
    return;
  }
  
  // Update the user's subscription status
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      payment_status: 'failed',
    })
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error updating subscription after payment failure:', error);
  }
}

// Handle customer.subscription.updated event
async function handleSubscriptionUpdated(subscription) {
  const userId = subscription.metadata.user_id;
  
  if (!userId) {
    console.error('Missing user_id in subscription metadata:', subscription.id);
    return;
  }
  
  // Get the plan ID from the subscription
  const priceId = subscription.items.data[0]?.price.id;
  let planId = subscription.metadata.plan_id;
  
  if (!planId && priceId) {
    // Try to find the plan ID from the price ID
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('id')
      .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
      .limit(1);
    
    if (!error && plans.length > 0) {
      planId = plans[0].id;
    }
  }
  
  // Update the user's subscription information
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      plan_id: planId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      billing_cycle: (subscription.items.data[0]?.plan.interval === 'year') ? 'annual' : 'monthly',
    })
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error updating subscription after update:', error);
  }
}

// Handle customer.subscription.deleted event
async function handleSubscriptionDeleted(subscription) {
  const userId = subscription.metadata.user_id;
  
  if (!userId) {
    console.error('Missing user_id in subscription metadata:', subscription.id);
    return;
  }
  
  // Update the user's subscription status
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: false,
    })
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error updating subscription after deletion:', error);
  }
} 