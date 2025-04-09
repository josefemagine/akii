var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import serve from "https://deno.land/std@0.168.0/http/server.ts";
import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";
serve((req) => handleRequest(req, (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if user is an admin
        const profileResult = yield query("SELECT is_admin FROM profiles WHERE id = $1", [user.id]);
        if (!profileResult.rows.length || !profileResult.rows[0].is_admin) {
            return createErrorResponse("Admin privileges required", 403);
        }
        // Calculate total count of active subscriptions
        const activeSubscriptionsResult = yield query("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'");
        const activeSubscriptions = ((_a = activeSubscriptionsResult.rows[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
        // Get subscription counts by plan
        const subscriptionsByPlanResult = yield query(`SELECT s.plan_id, sp.name as plan_name
       FROM subscriptions s
       LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.status = 'active'
       ORDER BY s.plan_id`);
        // Count subscriptions by plan
        const planCounts = {};
        subscriptionsByPlanResult.rows.forEach((subscription) => {
            const planId = subscription.plan_id;
            const planName = subscription.plan_name || 'Unknown';
            if (!planCounts[planId]) {
                planCounts[planId] = { name: planName, count: 0 };
            }
            planCounts[planId].count++;
        });
        // Get subscription counts by billing cycle
        const subscriptionsByBillingCycleResult = yield query("SELECT billing_cycle FROM subscriptions WHERE status = 'active' ORDER BY billing_cycle");
        // Count subscriptions by billing cycle
        const billingCycleCounts = {
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
        const subscriptionsByMonthResult = yield query("SELECT created_at FROM subscriptions WHERE created_at >= $1 ORDER BY created_at", [sixMonthsAgo.toISOString()]);
        // Group by month and count
        const monthCounts = {};
        subscriptionsByMonthResult.rows.forEach((subscription) => {
            const date = new Date(subscription.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
        });
        // Get monthly recurring revenue (MRR)
        const mrrResult = yield query(`SELECT s.billing_cycle, sp.price_monthly, sp.price_yearly
       FROM subscriptions s
       LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.status = 'active'`);
        // Calculate MRR
        let monthlyRecurringRevenue = 0;
        mrrResult.rows.forEach((subscription) => {
            if (subscription.billing_cycle === 'annual') {
                // For annual subscriptions, divide by 12 to get the monthly equivalent
                monthlyRecurringRevenue += (subscription.price_yearly || 0) / 12;
            }
            else {
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
    }
    catch (error) {
        console.error('Error fetching subscription analytics:', error);
        return createErrorResponse(error.message);
    }
}), {
    requireAuth: true,
    requireAdmin: true,
    requireBody: false
}));
