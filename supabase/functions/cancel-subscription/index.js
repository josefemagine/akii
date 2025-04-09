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
import { query } from "../_shared/postgres.ts";
import Stripe from "stripe";
// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-03-31.basil",
    httpClient: Stripe.createFetchHttpClient(),
});
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Get user's Stripe customer ID
            const { rows: profiles } = yield query("SELECT id, email, stripe_customer_id, subscription_status, subscription_tier, subscription_end_date FROM profiles WHERE id = $1", [user.id]);
            if (!profiles[0] || !profiles[0].stripe_customer_id) {
                return createErrorResponse("No active subscription found", 404);
            }
            // Get active subscriptions for the customer
            const subscriptions = yield stripe.subscriptions.list({
                customer: profiles[0].stripe_customer_id,
                status: "active",
            });
            if (subscriptions.data.length === 0) {
                return createErrorResponse("No active subscription found", 404);
            }
            // Cancel each active subscription
            for (const subscription of subscriptions.data) {
                yield stripe.subscriptions.cancel(subscription.id);
            }
            // Update user's subscription status in the database
            const { rows: updatedProfiles } = yield query(`
          UPDATE profiles
          SET 
            subscription_status = 'canceled',
            subscription_tier = NULL,
            subscription_end_date = NOW()
          WHERE id = $1
          RETURNING id, email, stripe_customer_id, subscription_status, subscription_tier, subscription_end_date
        `, [user.id]);
            return createSuccessResponse({
                message: "Subscription canceled successfully",
                user: updatedProfiles[0],
            });
        }
        catch (error) {
            console.error("Error in cancel-subscription:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "STRIPE_SECRET_KEY"],
        requireAuth: true,
    });
}));
