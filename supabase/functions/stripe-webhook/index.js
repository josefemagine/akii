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
import { execute, queryOne } from "../_shared/postgres.ts";
import Stripe from "https://esm.sh/stripe@12.1.1?target=deno";
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
});
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (_, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const signature = req.headers.get("stripe-signature");
            if (!signature) {
                return createErrorResponse("Missing stripe-signature header", 400);
            }
            // Verify the webhook signature
            const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
            if (!webhookSecret) {
                return createErrorResponse("Missing STRIPE_WEBHOOK_SECRET", 500);
            }
            let event;
            try {
                event = stripe.webhooks.constructEvent(yield req.text(), signature, webhookSecret);
            }
            catch (err) {
                console.error("Webhook signature verification failed:", err);
                return createErrorResponse("Invalid signature", 400);
            }
            // Handle different event types
            switch (event.type) {
                case "customer.subscription.created":
                case "customer.subscription.updated":
                    const subscription = event.data.object;
                    const customerId = subscription.customer;
                    // Get the user's email from Stripe
                    const customer = yield stripe.customers.retrieve(customerId);
                    const email = customer.email;
                    if (!email) {
                        return createErrorResponse("Customer email not found", 400);
                    }
                    // Find the user by email
                    const user = yield queryOne("SELECT id, email FROM profiles WHERE email = $1", [email]);
                    if (!user) {
                        console.error(`User with email ${email} not found`);
                        return createErrorResponse("User not found", 404);
                    }
                    // Update the user's subscription status in database
                    const result = yield execute(`UPDATE profiles SET 
                subscription_status = $1,
                subscription_id = $2,
                updated_at = $3
              WHERE email = $4`, [subscription.status, subscription.id, new Date().toISOString(), email]);
                    if (result.rowCount === 0) {
                        console.error("Error updating user subscription: No rows updated");
                        return createErrorResponse("Failed to update subscription", 500);
                    }
                    break;
                case "customer.subscription.deleted":
                    const deletedSubscription = event.data.object;
                    const deletedCustomerId = deletedSubscription.customer;
                    const deletedCustomer = yield stripe.customers.retrieve(deletedCustomerId);
                    const deletedEmail = deletedCustomer.email;
                    if (!deletedEmail) {
                        return createErrorResponse("Customer email not found", 400);
                    }
                    // Update the user's subscription status in database
                    const deleteResult = yield execute(`UPDATE profiles SET 
                subscription_status = $1,
                subscription_id = $2,
                updated_at = $3
              WHERE email = $4`, ["canceled", null, new Date().toISOString(), deletedEmail]);
                    if (deleteResult.rowCount === 0) {
                        console.error("Error updating user subscription status: No rows updated");
                        return createErrorResponse("Failed to update subscription status", 500);
                    }
                    break;
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }
            return createSuccessResponse({ received: true });
        }
        catch (error) {
            console.error("Unexpected error in stripe-webhook:", error);
            return createErrorResponse("An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
        requireAuth: false, // Webhooks don't need authentication
        requireBody: true,
    });
}));
