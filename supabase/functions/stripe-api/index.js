var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, queryOne } from "../_shared/postgres.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
// Initialize Stripe with secret key
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
});
// Cache for subscription plans to minimize database requests
const plansCache = new Map();
const PLANS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let plansCacheTime = 0;
function getSubscriptionPlans() {
    return __awaiter(this, void 0, void 0, function* () {
        const now = Date.now();
        if (plansCache.size > 0 && now - plansCacheTime < PLANS_CACHE_TTL) {
            return Array.from(plansCache.values());
        }
        const { rows: plans } = yield query("SELECT * FROM subscription_plans WHERE is_active = true");
        // Update cache
        plansCache.clear();
        plans.forEach(plan => {
            plansCache.set(plan.id, plan);
        });
        plansCacheTime = now;
        return plans;
    });
}
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            switch (action) {
                case "create-checkout": {
                    const { planId, billingCycle, successUrl, cancelUrl } = body;
                    if (!planId) {
                        return createErrorResponse("Plan ID is required", 400);
                    }
                    if (!["monthly", "annual"].includes(billingCycle)) {
                        return createErrorResponse("Billing cycle must be 'monthly' or 'annual'", 400);
                    }
                    // Get plan details
                    const plans = yield getSubscriptionPlans();
                    const plan = plans.find(p => p.id === planId);
                    if (!plan) {
                        return createErrorResponse("Plan not found or inactive", 404);
                    }
                    // Get pricing ID based on billing cycle
                    const priceId = billingCycle === "monthly"
                        ? plan.stripe_price_id_monthly
                        : plan.stripe_price_id_annual;
                    if (!priceId) {
                        return createErrorResponse(`No ${billingCycle} price ID configured for this plan`, 400);
                    }
                    // Get user profile to check if they already have a customer ID
                    const profile = yield queryOne("SELECT stripe_customer_id FROM profiles WHERE id = $1", [user.id]);
                    let customerId = profile === null || profile === void 0 ? void 0 : profile.stripe_customer_id;
                    // Create Stripe customer if they don't have one
                    if (!customerId) {
                        const customer = yield stripe.customers.create({
                            email: user.email,
                            metadata: {
                                supabase_user_id: user.id,
                            },
                        });
                        customerId = customer.id;
                        // Update user profile with Stripe customer ID
                        yield query("UPDATE profiles SET stripe_customer_id = $1 WHERE id = $2", [customerId, user.id]);
                    }
                    // Create checkout session
                    const session = yield stripe.checkout.sessions.create({
                        customer: customerId,
                        payment_method_types: ["card"],
                        line_items: [
                            {
                                price: priceId,
                                quantity: 1,
                            },
                        ],
                        mode: "subscription",
                        success_url: successUrl || `${Deno.env.get("SITE_URL")}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
                        cancel_url: cancelUrl || `${Deno.env.get("SITE_URL")}/pricing`,
                        allow_promotion_codes: true,
                    });
                    return createSuccessResponse({
                        sessionId: session.id,
                        url: session.url,
                    });
                }
                case "create-portal": {
                    const { returnUrl } = body;
                    // Get user's Stripe customer ID
                    const profile = yield queryOne("SELECT stripe_customer_id FROM profiles WHERE id = $1", [user.id]);
                    if (!(profile === null || profile === void 0 ? void 0 : profile.stripe_customer_id)) {
                        return createErrorResponse("No active subscription found", 404);
                    }
                    // Create billing portal session
                    const session = yield stripe.billingPortal.sessions.create({
                        customer: profile.stripe_customer_id,
                        return_url: returnUrl || `${Deno.env.get("SITE_URL")}/dashboard`,
                    });
                    return createSuccessResponse({
                        url: session.url,
                    });
                }
                default:
                    return createErrorResponse("Invalid action", 400);
            }
        }
        catch (error) {
            console.error("Error in stripe-api:", error);
            return createErrorResponse(error.message);
        }
    }), {
        requiredSecrets: ["STRIPE_SECRET_KEY", "SITE_URL"],
        requireAuth: true,
        requireBody: true,
    });
}));
