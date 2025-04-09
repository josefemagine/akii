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
import { queryOne, execute } from "../_shared/postgres.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?dts";
// Import CORS headers helper
import { corsHeaders } from "../_shared/cors.ts";
// Initialize Stripe with options compatible with Deno
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: '2023-10-16',
});
// Cache of plan data to minimize database requests
const planCache = new Map();
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: corsHeaders,
        });
    }
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { planId, billingCycle = 'monthly' } = body;
            if (!planId) {
                return createErrorResponse('Missing required parameters', 400);
            }
            // Fetch the user's profile
            const profile = yield queryOne('SELECT stripe_customer_id FROM profiles WHERE id = $1', [user.id]);
            // Get the subscription plan
            let plan;
            if (planCache.has(planId)) {
                plan = planCache.get(planId);
            }
            else {
                const planData = yield queryOne('SELECT * FROM subscription_plans WHERE id = $1', [planId]);
                if (!planData) {
                    return createErrorResponse('Invalid plan ID', 400);
                }
                plan = planData;
                planCache.set(planId, plan);
            }
            // Determine price ID based on billing cycle
            const priceField = billingCycle === 'annual' ? 'stripe_price_id_yearly' : 'stripe_price_id_monthly';
            const priceId = plan[priceField];
            if (!priceId) {
                return createErrorResponse('No price ID configured for this plan and billing cycle', 400);
            }
            // Get or create customer
            let customerId = profile === null || profile === void 0 ? void 0 : profile.stripe_customer_id;
            if (!customerId) {
                const customer = yield stripe.customers.create({
                    email: user.email,
                    metadata: {
                        supabase_user_id: user.id,
                    },
                });
                customerId = customer.id;
                // Update the profile with the customer ID
                yield execute('UPDATE profiles SET stripe_customer_id = $1 WHERE id = $2', [customerId, user.id]);
            }
            // Create the checkout session
            const session = yield stripe.checkout.sessions.create({
                customer: customerId,
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: `${Deno.env.get('CLIENT_URL')}/dashboard?checkout=success`,
                cancel_url: `${Deno.env.get('CLIENT_URL')}/dashboard?checkout=cancelled`,
                metadata: {
                    plan_id: planId,
                    user_id: user.id,
                    billing_cycle: billingCycle,
                },
                subscription_data: {
                    metadata: {
                        plan_id: planId,
                        user_id: user.id,
                        billing_cycle: billingCycle,
                    },
                },
            });
            return createSuccessResponse({
                url: session.url,
            });
        }
        catch (error) {
            console.error('Error creating checkout session:', error);
            return createErrorResponse(error instanceof Error ? error.message : 'An unexpected error occurred', 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "STRIPE_SECRET_KEY", "CLIENT_URL"],
        requireAuth: true,
        requireBody: true,
    });
}));
