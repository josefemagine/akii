// Handler for retrieving Stripe products (admin only)
export async function handleGetProducts(req: Request, { stripe, supabaseAdmin, corsHeaders }: any) {
  try {
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

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return new Response(JSON.stringify({ error: 'Admin privileges required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Retrieve products from Stripe
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
      limit: 100,
    });

    // Retrieve prices separately to get all prices, not just default ones
    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
    });

    // Organize prices by product
    const pricesByProduct = {};
    prices.data.forEach(price => {
      if (!pricesByProduct[price.product]) {
        pricesByProduct[price.product] = [];
      }
      pricesByProduct[price.product].push(price);
    });

    // Combine products with their prices
    const productsWithPrices = products.data.map(product => ({
      ...product,
      prices: pricesByProduct[product.id] || [],
    }));

    return new Response(
      JSON.stringify({
        products: productsWithPrices,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error retrieving Stripe products:', error);
    return new Response(
      JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
} 