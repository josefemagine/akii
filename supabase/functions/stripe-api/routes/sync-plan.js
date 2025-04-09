var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Handler for syncing subscription plans to Stripe
export function handleSyncPlan(req_1, _a) {
    return __awaiter(this, arguments, void 0, function* (req, { stripe, supabaseAdmin, corsHeaders }) {
        var _b, _c;
        try {
            // Parse request body
            const { planId, operation = 'create' } = yield req.json();
            if (!planId) {
                return new Response(JSON.stringify({ error: 'Missing required parameter: planId' }), {
                    status: 400,
                    headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                });
            }
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
            // Get the plan from the database
            const { data: plan, error: planError } = yield supabaseAdmin
                .from('subscription_plans')
                .select('*')
                .eq('id', planId)
                .single();
            if (planError || !plan) {
                return new Response(JSON.stringify({ error: 'Plan not found', details: planError }), {
                    status: 404,
                    headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                });
            }
            // Normalize plan name for Stripe
            const stripeSafeName = plan.name.toLowerCase().replace(/\s+/g, '_');
            const stripeProductId = `plan_${stripeSafeName}_${plan.id}`;
            let result;
            // Handle different operations (create, update, delete)
            switch (operation) {
                case 'create':
                case 'update':
                    // Check if product already exists in Stripe
                    let stripeProduct;
                    try {
                        stripeProduct = yield stripe.products.retrieve(stripeProductId);
                    }
                    catch (error) {
                        // Product doesn't exist, create it
                        stripeProduct = yield stripe.products.create({
                            id: stripeProductId,
                            name: plan.name,
                            description: plan.description || '',
                            active: plan.is_active,
                            metadata: {
                                plan_id: plan.id,
                                features: JSON.stringify(plan.features || []),
                                message_limit: ((_b = plan.message_limit) === null || _b === void 0 ? void 0 : _b.toString()) || '0',
                                agent_limit: ((_c = plan.agent_limit) === null || _c === void 0 ? void 0 : _c.toString()) || '0',
                            },
                        });
                    }
                    // Create or update prices
                    const monthlyPriceData = {
                        currency: 'usd',
                        product: stripeProductId,
                        unit_amount: Math.round(plan.price_monthly * 100), // Stripe uses cents
                        recurring: {
                            interval: 'month',
                        },
                        metadata: {
                            plan_id: plan.id,
                            billing_cycle: 'monthly',
                        },
                    };
                    const yearlyPriceData = {
                        currency: 'usd',
                        product: stripeProductId,
                        unit_amount: Math.round(plan.price_yearly * 100), // Stripe uses cents
                        recurring: {
                            interval: 'year',
                        },
                        metadata: {
                            plan_id: plan.id,
                            billing_cycle: 'annual',
                        },
                    };
                    let monthlyPrice, yearlyPrice;
                    // If we already have price IDs, update the existing prices if possible or create new ones
                    if (plan.stripe_price_id_monthly) {
                        try {
                            // Try to retrieve existing price (will throw if not found)
                            yield stripe.prices.retrieve(plan.stripe_price_id_monthly);
                            // Prices can't be updated in Stripe, so we'll create a new one and archive the old one
                            yield stripe.prices.update(plan.stripe_price_id_monthly, { active: false });
                            monthlyPrice = yield stripe.prices.create(monthlyPriceData);
                        }
                        catch (error) {
                            // Price doesn't exist, create a new one
                            monthlyPrice = yield stripe.prices.create(monthlyPriceData);
                        }
                    }
                    else {
                        monthlyPrice = yield stripe.prices.create(monthlyPriceData);
                    }
                    if (plan.stripe_price_id_yearly) {
                        try {
                            yield stripe.prices.retrieve(plan.stripe_price_id_yearly);
                            yield stripe.prices.update(plan.stripe_price_id_yearly, { active: false });
                            yearlyPrice = yield stripe.prices.create(yearlyPriceData);
                        }
                        catch (error) {
                            yearlyPrice = yield stripe.prices.create(yearlyPriceData);
                        }
                    }
                    else {
                        yearlyPrice = yield stripe.prices.create(yearlyPriceData);
                    }
                    // Update the plan in the database with Stripe IDs
                    const { data: updatedPlan, error: updateError } = yield supabaseAdmin
                        .from('subscription_plans')
                        .update({
                        stripe_product_id: stripeProductId,
                        stripe_price_id_monthly: monthlyPrice.id,
                        stripe_price_id_yearly: yearlyPrice.id,
                        updated_at: new Date().toISOString(),
                    })
                        .eq('id', planId)
                        .select()
                        .single();
                    if (updateError) {
                        return new Response(JSON.stringify({ error: 'Failed to update plan', details: updateError }), {
                            status: 500,
                            headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                        });
                    }
                    result = {
                        success: true,
                        operation: operation,
                        product: stripeProduct,
                        prices: {
                            monthly: monthlyPrice,
                            yearly: yearlyPrice,
                        },
                        plan: updatedPlan,
                    };
                    break;
                case 'delete':
                    // Archive the product in Stripe (don't actually delete it)
                    const archivedProduct = yield stripe.products.update(stripeProductId, {
                        active: false,
                    });
                    // Archive associated prices
                    if (plan.stripe_price_id_monthly) {
                        yield stripe.prices.update(plan.stripe_price_id_monthly, { active: false });
                    }
                    if (plan.stripe_price_id_yearly) {
                        yield stripe.prices.update(plan.stripe_price_id_yearly, { active: false });
                    }
                    // Update the plan in the database
                    yield supabaseAdmin
                        .from('subscription_plans')
                        .update({
                        is_active: false,
                        updated_at: new Date().toISOString(),
                    })
                        .eq('id', planId);
                    result = {
                        success: true,
                        operation: 'delete',
                        product: archivedProduct,
                    };
                    break;
                default:
                    return new Response(JSON.stringify({ error: 'Invalid operation' }), {
                        status: 400,
                        headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                    });
            }
            return new Response(JSON.stringify(result), {
                status: 200,
                headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
            });
        }
        catch (error) {
            console.error('Error syncing plan to Stripe:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: Object.assign(Object.assign({}, corsHeaders), { 'Content-Type': 'application/json' })
            });
        }
    });
}
