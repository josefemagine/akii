var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Handler for retrieving subscription analytics data (admin only)
export function handleGetAnalytics(req_1, _a) {
    return __awaiter(this, arguments, void 0, function* (req, { stripe, supabaseAdmin, corsHeaders }) {
        try {
            // Get authentication context
            const authHeader = req.headers.get('Authorization');
            if (!authHeader) {
                return new Response(JSON.stringify({ error: 'No authorization header provided' }), {
                    status: 401,
                    headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                });
            }
            const token = authHeader.replace('Bearer ', '');
            const { data: { user }, error: authError } = yield supabaseAdmin.auth.getUser(token);
            if (authError || !user) {
                return new Response(JSON.stringify({ error: 'Invalid token' }), {
                    status: 401,
                    headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                });
            }
            // Check if user is an admin
            const { data: profile, error: profileError } = yield supabaseAdmin
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();
            if (profileError || !(profile === null || profile === void 0 ? void 0 : profile.is_admin)) {
                return new Response(JSON.stringify({ error: 'Admin privileges required' }), {
                    status: 403,
                    headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                });
            }
            // Query database for subscription analytics
            const now = new Date();
            const oneMonthAgo = new Date(now);
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            // Get active subscriptions count
            const { count: activeSubscriptionsCount, error: activeError } = yield supabaseAdmin
                .from('subscriptions')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');
            // Get monthly recurring revenue (MRR)
            const { data: activeSubscriptions, error: mrrError } = yield supabaseAdmin
                .from('subscriptions')
                .select(`
        billing_cycle,
        plans:plan_id (
          price_monthly,
          price_yearly
        )
      `)
                .eq('status', 'active');
            // Get new subscriptions in the last 30 days
            const { count: newSubscriptionsCount, error: newSubError } = yield supabaseAdmin
                .from('subscriptions')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', oneMonthAgo.toISOString());
            // Get subscription by plan
            const { data: subscriptionsByPlan, error: planCountError } = yield supabaseAdmin
                .from('subscriptions')
                .select(`
        plan_id,
        plans:plan_id (
          name
        )
      `)
                .eq('status', 'active');
            // Calculate MRR
            let mrr = 0;
            if (activeSubscriptions && !mrrError) {
                mrr = activeSubscriptions.reduce((total, sub) => {
                    if (!sub.plans)
                        return total;
                    if (sub.billing_cycle === 'annual') {
                        // Convert yearly price to monthly equivalent
                        return total + (sub.plans.price_yearly / 12);
                    }
                    else {
                        return total + sub.plans.price_monthly;
                    }
                }, 0);
            }
            // Group subscriptions by plan
            const planCounts = {};
            if (subscriptionsByPlan && !planCountError) {
                subscriptionsByPlan.forEach(sub => {
                    var _a;
                    const planName = ((_a = sub.plans) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown';
                    if (!planCounts[planName]) {
                        planCounts[planName] = 0;
                    }
                    planCounts[planName]++;
                });
            }
            // Format plan distribution data
            const planDistribution = Object.entries(planCounts).map(([name, count]) => ({
                name,
                count,
            }));
            // Get recent invoices data
            const { data: recentInvoices, error: invoiceError } = yield supabaseAdmin
                .from('invoices')
                .select(`
        id,
        amount_paid,
        status,
        invoice_date,
        profiles:user_id (
          email
        )
      `)
                .order('invoice_date', { ascending: false })
                .limit(10);
            // Get churn rate data
            const threeMonthsAgo = new Date(now);
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const { count: canceledCount, error: churnError } = yield supabaseAdmin
                .from('subscriptions')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'canceled')
                .gte('canceled_at', threeMonthsAgo.toISOString());
            const churnRate = activeSubscriptionsCount ? (canceledCount / activeSubscriptionsCount) * 100 : 0;
            // Prepare the response
            const analytics = {
                activeSubscriptions: activeSubscriptionsCount || 0,
                mrr: mrr.toFixed(2),
                newSubscriptionsLast30Days: newSubscriptionsCount || 0,
                planDistribution,
                recentInvoices: recentInvoices || [],
                churnRate: churnRate.toFixed(2),
            };
            return new Response(JSON.stringify(analytics), {
                status: 200,
                headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
            });
        }
        catch (error) {
            console.error('Error retrieving subscription analytics:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
            });
        }
    });
}
