// Handler for canceling subscriptions
export async function handleCancelSubscription(req: Request, { stripe, supabaseAdmin, corsHeaders }: any) {
  try {
    // Parse request body
    const { atPeriodEnd = true } = await req.json();

    // Get authentication context
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header provided' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user's current subscription
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subscriptionError || !subscription?.stripe_subscription_id) {
      return new Response(
        JSON.stringify({ 
          error: 'No active subscription found for this user',
          details: subscriptionError || 'Missing subscription data'
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Cancel the subscription in Stripe
    let updatedSubscription;
    if (atPeriodEnd) {
      // Cancel at the end of the billing period
      updatedSubscription = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        { cancel_at_period_end: true }
      );
    } else {
      // Cancel immediately
      updatedSubscription = await stripe.subscriptions.cancel(
        subscription.stripe_subscription_id
      );
    }

    // Update the subscription in Supabase
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (atPeriodEnd) {
      updateData.cancel_at_period_end = true;
    } else {
      updateData.status = 'canceled';
      updateData.canceled_at = new Date().toISOString();
    }
    
    await supabaseAdmin
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscription.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: atPeriodEnd ? 
          'Subscription will be canceled at the end of the billing period' : 
          'Subscription canceled immediately',
        data: {
          subscription_id: updatedSubscription.id,
          cancel_at_period_end: atPeriodEnd,
          status: updatedSubscription.status,
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error canceling subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
} 