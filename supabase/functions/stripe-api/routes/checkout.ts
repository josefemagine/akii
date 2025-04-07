// Handler for creating checkout sessions
export async function handleCreateCheckout(req: Request, { stripe, supabaseAdmin, corsHeaders }: any) {
  try {
    // Parse request body
    const { planId, billingCycle = 'monthly' } = await req.json();
    
    if (!planId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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

    // Get plan details from the database
    const { data: plan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return new Response(JSON.stringify({ error: 'Invalid plan ID', details: planError }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Determine price ID based on billing cycle
    const priceField = billingCycle === 'annual' ? 'stripe_price_id_yearly' : 'stripe_price_id_monthly';
    const priceId = plan[priceField];

    if (!priceId) {
      return new Response(JSON.stringify({ error: 'No price ID configured for this plan and billing cycle' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user profile to check if they already have a Stripe customer ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch user profile', details: profileError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: profile?.stripe_customer_id,
      customer_email: !profile?.stripe_customer_id ? (profile?.email || user.email) : undefined,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
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