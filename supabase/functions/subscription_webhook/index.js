// This edge function handles subscription webhook events from payment processors
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
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
// Map of subscription plans to message limits
const PLAN_MESSAGE_LIMITS = {
    free: 100, // Trial
    basic: 1000,
    pro: 5000,
    scale: 25000,
    enterprise: 50000,
};
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (_, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { event, customerId, subscriptionId, plan, status, renewalDate, paymentMethod, userId, addons = [], } = body;
            if (!event || !userId) {
                return createErrorResponse("Missing required parameters: event and userId are required", 400);
            }
            // Get the user's current subscription
            const userData = yield queryOne("SELECT subscription_status, subscription_id FROM users WHERE id = $1", [userId]);
            if (!userData) {
                console.error("Error fetching user data: User not found");
                return createErrorResponse("Failed to fetch user data", 500);
            }
            // Update the user's subscription status
            yield execute(`UPDATE users SET 
            subscription_status = $1, 
            subscription_id = $2, 
            plan = $3, 
            renewal_date = $4, 
            payment_method = $5, 
            updated_at = $6
          WHERE id = $7`, [
                status,
                subscriptionId,
                plan,
                renewalDate,
                paymentMethod,
                new Date().toISOString(),
                userId
            ]);
            // Update the user's message limit based on the plan
            const messageLimit = PLAN_MESSAGE_LIMITS[plan] || PLAN_MESSAGE_LIMITS.free;
            yield execute(`UPDATE user_usage SET 
            tokens_limit = $1, 
            updated_at = $2
          WHERE user_id = $3`, [
                messageLimit,
                new Date().toISOString(),
                userId
            ]);
            return createSuccessResponse({
                message: "Subscription updated successfully",
                userId,
                plan,
                status,
                messageLimit,
            });
        }
        catch (error) {
            console.error("Unexpected error in subscription webhook:", error);
            return createErrorResponse("An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: false, // Webhooks don't need authentication
        requireBody: true,
    });
}));
