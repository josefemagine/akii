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
import { queryOne } from "../_shared/postgres.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?dts";
// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: '2023-10-16',
});
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Fetch the user's profile to get Stripe customer ID
            const profile = yield queryOne("SELECT stripe_customer_id FROM profiles WHERE id = $1", [user.id]);
            if (!profile) {
                return createErrorResponse('Error fetching profile', 500);
            }
            if (!profile.stripe_customer_id) {
                return createErrorResponse('No Stripe customer found for this user', 404);
            }
            // Create a billing portal session
            const session = yield stripe.billingPortal.sessions.create({
                customer: profile.stripe_customer_id,
                return_url: `${Deno.env.get('CLIENT_URL')}/dashboard/billing`,
            });
            return createSuccessResponse({
                url: session.url,
            });
        }
        catch (error) {
            console.error('Error creating portal session:', error);
            return createErrorResponse(error instanceof Error ? error.message : 'An unexpected error occurred', 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "STRIPE_SECRET_KEY", "CLIENT_URL"],
        requireAuth: true,
    });
}));
