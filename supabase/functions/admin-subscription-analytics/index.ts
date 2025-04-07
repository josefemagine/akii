import serve from "https://deno.land/std@0.168.0/http/server.ts";
import createClient from "https://esm.sh/@supabase/supabase-js@2.1.0";

// Import CORS headers helper
import { corsHeaders } from "../_shared/cors.ts";

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

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

    // Calculate total count of active subscriptions
    const { count: activeSubscriptions, error: countError } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (countError) {
      throw countError;
    }

    // Get subscription counts by plan
    const { data: subscriptionsByPlan, error: planError } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        plan_id,
        plans:subscription_plans (name)
      `)
      .eq('status', 'active')
      .order('plan_id');

    if (planError) {
      throw planError;
    }

    // Count subscriptions by plan
    const planCounts: Record<string, { name: string; count: number }> = {};
    subscriptionsByPlan.forEach((subscription) => {
      const planId = subscription.plan_id;
      const planName = subscription.plans?.name || 'Unknown';
      
      if (!planCounts[planId]) {
        planCounts[planId] = { name: planName, count: 0 };
      }
      
      planCounts[planId].count++;
    });

    // Get subscription counts by billing cycle
    const { data: subscriptionsByBillingCycle, error: billingError } = await supabaseAdmin
      .from('subscriptions')
      .select('billing_cycle')
      .eq('status', 'active')
      .order('billing_cycle');

    if (billingError) {
      throw billingError;
    }

    // Count subscriptions by billing cycle
    const billingCycleCounts: Record<string, number> = {
      monthly: 0,
      annual: 0,
    };
    
    subscriptionsByBillingCycle.forEach((subscription) => {
      const cycle = subscription.billing_cycle || 'monthly';
      billingCycleCounts[cycle] = (billingCycleCounts[cycle] || 0) + 1;
    });

    // Get subscriptions created by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1); // First day of the month
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const { data: subscriptionsByMonth, error: monthError } = await supabaseAdmin
      .from('subscriptions')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at');

    if (monthError) {
      throw monthError;
    }

    // Group by month and count
    const monthCounts: Record<string, number> = {};
    
    subscriptionsByMonth.forEach((subscription) => {
      const date = new Date(subscription.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });

    // Get monthly recurring revenue (MRR)
    const { data: mrr, error: mrrError } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        billing_cycle,
        plans:subscription_plans (price_monthly, price_yearly)
      `)
      .eq('status', 'active');

    if (mrrError) {
      throw mrrError;
    }

    // Calculate MRR
    let monthlyRecurringRevenue = 0;
    
    mrr.forEach((subscription) => {
      if (!subscription.plans) return;
      
      if (subscription.billing_cycle === 'annual') {
        // For annual subscriptions, divide by 12 to get the monthly equivalent
        monthlyRecurringRevenue += (subscription.plans.price_yearly || 0) / 12;
      } else {
        // For monthly subscriptions, use the monthly price
        monthlyRecurringRevenue += subscription.plans.price_monthly || 0;
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          active_subscriptions: activeSubscriptions,
          subscriptions_by_plan: Object.values(planCounts),
          subscriptions_by_billing_cycle: billingCycleCounts,
          subscriptions_by_month: monthCounts,
          monthly_recurring_revenue: Math.round(monthlyRecurringRevenue * 100) / 100,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error fetching subscription analytics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 