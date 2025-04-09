import serve from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";

interface SubscriptionAnalyticsResponse {
  active_subscriptions: number;
  subscriptions_by_plan: Array<{ name: string; count: number }>;
  subscriptions_by_billing_cycle: Record<string, number>;
  subscriptions_by_month: Record<string, number>;
  monthly_recurring_revenue: number;
}

serve((req) => handleRequest(req, async (user) => {
  try {
    // Check if user is an admin
    const profileResult = await query<{ is_admin: boolean }>(
      "SELECT is_admin FROM profiles WHERE id = $1",
      [user.id]
    );

    if (!profileResult.rows.length || !profileResult.rows[0].is_admin) {
      return createErrorResponse("Admin privileges required", 403);
    }

    // Calculate total count of active subscriptions
    const activeSubscriptionsResult = await query<{ count: number }>(
      "SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'"
    );
    const activeSubscriptions = activeSubscriptionsResult.rows[0]?.count || 0;

    // Get subscription counts by plan
    const subscriptionsByPlanResult = await query<{ 
      plan_id: string; 
      plan_name: string 
    }>(
      `SELECT s.plan_id, sp.name as plan_name
       FROM subscriptions s
       LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.status = 'active'
       ORDER BY s.plan_id`
    );

    // Count subscriptions by plan
    const planCounts: Record<string, { name: string; count: number }> = {};
    subscriptionsByPlanResult.rows.forEach((subscription) => {
      const planId = subscription.plan_id;
      const planName = subscription.plan_name || 'Unknown';
      
      if (!planCounts[planId]) {
        planCounts[planId] = { name: planName, count: 0 };
      }
      
      planCounts[planId].count++;
    });

    // Get subscription counts by billing cycle
    const subscriptionsByBillingCycleResult = await query<{ billing_cycle: string }>(
      "SELECT billing_cycle FROM subscriptions WHERE status = 'active' ORDER BY billing_cycle"
    );

    // Count subscriptions by billing cycle
    const billingCycleCounts: Record<string, number> = {
      monthly: 0,
      annual: 0,
    };
    
    subscriptionsByBillingCycleResult.rows.forEach((subscription) => {
      const cycle = subscription.billing_cycle || 'monthly';
      billingCycleCounts[cycle] = (billingCycleCounts[cycle] || 0) + 1;
    });

    // Get subscriptions created by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1); // First day of the month
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const subscriptionsByMonthResult = await query<{ created_at: string }>(
      "SELECT created_at FROM subscriptions WHERE created_at >= $1 ORDER BY created_at",
      [sixMonthsAgo.toISOString()]
    );

    // Group by month and count
    const monthCounts: Record<string, number> = {};
    
    subscriptionsByMonthResult.rows.forEach((subscription) => {
      const date = new Date(subscription.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });

    // Get monthly recurring revenue (MRR)
    const mrrResult = await query<{ 
      billing_cycle: string; 
      price_monthly: number; 
      price_yearly: number 
    }>(
      `SELECT s.billing_cycle, sp.price_monthly, sp.price_yearly
       FROM subscriptions s
       LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.status = 'active'`
    );

    // Calculate MRR
    let monthlyRecurringRevenue = 0;
    
    mrrResult.rows.forEach((subscription) => {
      if (subscription.billing_cycle === 'annual') {
        // For annual subscriptions, divide by 12 to get the monthly equivalent
        monthlyRecurringRevenue += (subscription.price_yearly || 0) / 12;
      } else {
        // For monthly subscriptions, use the monthly price
        monthlyRecurringRevenue += subscription.price_monthly || 0;
      }
    });

    return createSuccessResponse({
      data: {
        active_subscriptions: activeSubscriptions,
        subscriptions_by_plan: Object.values(planCounts),
        subscriptions_by_billing_cycle: billingCycleCounts,
        subscriptions_by_month: monthCounts,
        monthly_recurring_revenue: Math.round(monthlyRecurringRevenue * 100) / 100,
      }
    });

  } catch (error) {
    console.error('Error fetching subscription analytics:', error);
    return createErrorResponse((error instanceof Error ? error.message : String(error)));
  }
}, {
  requireAuth: true,
  requireAdmin: true,
  requireBody: false
})); 