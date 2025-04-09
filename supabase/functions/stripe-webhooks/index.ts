import { query, queryOne, execute } from "../_shared/postgres.ts";
import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?dts";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: '2023-10-16',
});

// Define Stripe event handlers
async function processStripeWebhook(req: Request) {
  // Get the signature from the headers
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    throw new Error('Missing Stripe signature');
  }

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
  
  return { status: 'success', eventType: event.type };
}

// Main handler function
Deno.serve(async (req) => {
  // For Stripe webhooks, we don't need authentication
  if (req.method === "POST") {
    try {
      const result = await processStripeWebhook(req);
      return createSuccessResponse(result);
    } catch (error) {
      console.error('Error processing webhook:', error);
      return createErrorResponse(error.message, 400);
    }
  }
  
  return createErrorResponse('Method not allowed', 405);
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
  try {
    await execute(
      `INSERT INTO user_subscriptions (
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
        payment_status = EXCLUDED.payment_status`,
      [
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
      ]
    );
  } catch (error) {
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
  try {
    await execute(
      `UPDATE user_subscriptions
       SET 
         status = $1,
         current_period_start = $2,
         current_period_end = $3,
         cancel_at_period_end = $4,
         payment_status = $5
       WHERE user_id = $6`,
      [
        subscription.status,
        new Date(subscription.current_period_start * 1000).toISOString(),
        new Date(subscription.current_period_end * 1000).toISOString(),
        subscription.cancel_at_period_end,
        'active',
        userId
      ]
    );
  } catch (error) {
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
  try {
    await execute(
      `UPDATE user_subscriptions
       SET payment_status = $1
       WHERE user_id = $2`,
      ['failed', userId]
    );
  } catch (error) {
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
    try {
      const plans = await query<{ id: string }>(
        `SELECT id FROM subscription_plans
         WHERE stripe_price_id_monthly = $1 OR stripe_price_id_annual = $1
         LIMIT 1`,
        [priceId]
      );
      
      if (plans.rows.length > 0) {
        planId = plans.rows[0].id;
      }
    } catch (error) {
      console.error('Error finding plan from price ID:', error);
    }
  }
  
  // Update the user's subscription information
  try {
    await execute(
      `UPDATE user_subscriptions
       SET 
         plan_id = $1,
         status = $2,
         current_period_start = $3,
         current_period_end = $4,
         cancel_at_period_end = $5,
         billing_cycle = $6
       WHERE user_id = $7`,
      [
        planId,
        subscription.status,
        new Date(subscription.current_period_start * 1000).toISOString(),
        new Date(subscription.current_period_end * 1000).toISOString(),
        subscription.cancel_at_period_end,
        (subscription.items.data[0]?.plan.interval === 'year') ? 'annual' : 'monthly',
        userId
      ]
    );
  } catch (error) {
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
  try {
    await execute(
      `UPDATE user_subscriptions
       SET 
         status = $1,
         cancel_at_period_end = $2
       WHERE user_id = $3`,
      ['canceled', false, userId]
    );
  } catch (error) {
    console.error('Error updating subscription after deletion:', error);
  }
} 