import serve from "https://deno.land/std@0.168.0/http/server.ts";
import createClient from "https://esm.sh/@supabase/supabase-js@2.1.0";
import Stripe from "https://esm.sh/stripe@12.0.0?dts";

// Import CORS headers helper
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: '2023-10-16',
});

// Initialize Supabase client
const supabaseAdmin = createClient(
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
  // Special case for Stripe webhooks - they don't use CORS
  if (req.headers.get('stripe-signature')) {
    return await handleWebhook(req);
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop() || '';

    // Shared dependencies object to pass to all handlers
    const deps = {
      stripe,
      supabaseAdmin,
      corsHeaders,
    };

    // Route requests to appropriate handlers
    switch (path) {
      case 'create-checkout':
        return await handleCreateCheckout(req, deps);
      
      case 'create-portal':
        return await handleCreatePortal(req, deps);
      
      case '':
      case 'webhook':
        // This is a fallback for webhook requests that might not have the signature header
        return await handleWebhook(req);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Endpoint not found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }
  } catch (error) {
    console.error('Error in Stripe function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

/**
 * Handle webhook events from Stripe
 */
async function handleWebhook(req: Request) {
  // Verify that this is a real Stripe webhook
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing stripe signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get the raw body as text
    const body = await req.text();

    // Verify the webhook signature
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);

    // Process the event
    switch (event.type) {
      // Handle subscription creation
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      // Handle subscription updates
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      // Handle successful payments
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      // Handle payment failures
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      // Handle subscription cancellation
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle creating a checkout session
 */
async function handleCreateCheckout(req: Request, { stripe, supabaseAdmin, corsHeaders }: any) {
  try {
    // Parse request body
    const { planId, billingCycle = 'monthly' } = await req.json();
    
    // Validate inputs
    if (!planId) {
      return new Response(
        JSON.stringify({ error: 'Plan ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user profile to check if they already have a Stripe customer ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the plan details
    const { data: plan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get or create Stripe customer
    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email || user.email,
        metadata: {
          user_id: user.id
        }
      });
      customerId = customer.id;
      
      // Update profile with customer ID
      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.description || '',
            },
            unit_amount: billingCycle === 'annual' 
              ? Math.round(plan.price_annual * 100)
              : Math.round(plan.price_monthly * 100),
            recurring: {
              interval: billingCycle === 'annual' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: planId,
          billing_cycle: billingCycle,
        },
      },
      success_url: `${Deno.env.get('CLIENT_URL')}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('CLIENT_URL')}/dashboard/subscription?canceled=true`,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Handle creating a customer portal session
 */
async function handleCreatePortal(req: Request, { stripe, supabaseAdmin, corsHeaders }: any) {
  try {
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user's Stripe customer ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();
    
    if (profileError || !profile.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: 'No Stripe customer found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create a portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${Deno.env.get('CLIENT_URL')}/dashboard/subscription`,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating portal session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(subscription: any) {
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
    await supabaseAdmin
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
  } catch (error) {
    console.error('Error creating subscription record:', error);
    throw error;
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription: any) {
  try {
    // Get the existing subscription from Supabase
    const { data: existingSubscription, error } = await supabaseAdmin
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
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        subscription_item_id: subscriptionItem?.id || null,
        plan_id: subscription.metadata.plan_id || null,
        billing_cycle: subscription.metadata.billing_cycle || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingSubscription.id);

    console.log('Subscription updated:', subscription.id);
  } catch (error) {
    console.error('Error updating subscription record:', error);
    throw error;
  }
}

/**
 * Handle payment success
 */
async function handlePaymentSucceeded(invoice: any) {
  try {
    // Only process subscription invoices
    if (!invoice.subscription) return;

    // Check if we already have an invoice record
    const { data: existingInvoice } = await supabaseAdmin
      .from('invoices')
      .select('id')
      .eq('stripe_invoice_id', invoice.id)
      .single();

    if (existingInvoice) {
      // Update existing invoice
      await supabaseAdmin
        .from('invoices')
        .update({
          status: invoice.status,
          amount_paid: invoice.amount_paid / 100,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingInvoice.id);
    } else {
      // Get the user ID from the customer
      const { data: user, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', invoice.customer)
        .single();

      if (userError || !user) {
        console.error('User not found for customer:', invoice.customer);
        return;
      }

      // Get the subscription ID
      const { data: subscription, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('stripe_subscription_id', invoice.subscription)
        .single();

      // Create a new invoice record
      await supabaseAdmin
        .from('invoices')
        .insert({
          user_id: user.id,
          subscription_id: subscription?.id || null,
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

    console.log('Payment succeeded for invoice:', invoice.id);
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}

/**
 * Handle payment failures
 */
async function handlePaymentFailed(invoice: any) {
  try {
    // Only process subscription invoices
    if (!invoice.subscription) return;

    // Update subscription status
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', invoice.subscription)
      .single();

    if (subscription) {
      await supabaseAdmin
        .from('subscriptions')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);
    }

    // Create or update invoice record
    const { data: existingInvoice } = await supabaseAdmin
      .from('invoices')
      .select('id')
      .eq('stripe_invoice_id', invoice.id)
      .single();

    if (existingInvoice) {
      await supabaseAdmin
        .from('invoices')
        .update({
          status: invoice.status,
          amount_paid: invoice.amount_paid / 100,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingInvoice.id);
    } else {
      // Get the user ID from the customer
      const { data: user } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', invoice.customer)
        .single();

      if (user) {
        await supabaseAdmin
          .from('invoices')
          .insert({
            user_id: user.id,
            subscription_id: subscription?.id || null,
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
    }

    console.log('Payment failed for invoice:', invoice.id);
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(subscription: any) {
  try {
    // Update the subscription status in Supabase
    const { data: existingSubscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (error || !existingSubscription) {
      console.error('Subscription not found in database:', subscription.id);
      return;
    }

    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingSubscription.id);

    console.log('Subscription canceled:', subscription.id);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
} 