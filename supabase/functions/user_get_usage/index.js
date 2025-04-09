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
// Helper to format the response with consistent data structure
const formatUsageResponse = (usageData, profileData, subscription) => {
    const messageCount = (usageData === null || usageData === void 0 ? void 0 : usageData.message_count) || 0;
    const tokenCount = (usageData === null || usageData === void 0 ? void 0 : usageData.token_count) || 0;
    const imageCount = (usageData === null || usageData === void 0 ? void 0 : usageData.image_count) || 0;
    const audioCount = (usageData === null || usageData === void 0 ? void 0 : usageData.audio_count) || 0;
    // Calculate credits
    const totalCredits = (profileData === null || profileData === void 0 ? void 0 : profileData.monthly_credit_limit) || 0;
    const usedCredits = (profileData === null || profileData === void 0 ? void 0 : profileData.credits_used) || 0;
    const remainingCredits = Math.max(0, totalCredits - usedCredits);
    return {
        messageCount,
        tokenCount,
        imageCount,
        audioCount,
        credits: {
            total: totalCredits,
            used: usedCredits,
            remaining: remainingCredits
        },
        billing: {
            plan: (profileData === null || profileData === void 0 ? void 0 : profileData.subscription_tier) || 'free',
            nextBillingDate: (subscription === null || subscription === void 0 ? void 0 : subscription.current_period_end)
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
            isCanceled: (subscription === null || subscription === void 0 ? void 0 : subscription.cancel_at_period_end) || false
        }
    };
};
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Get user usage data
            const usageData = yield queryOne(`
        SELECT 
          message_count,
          token_count,
          image_count,
          audio_count
        FROM user_usage
        WHERE user_id = $1
      `, [user.id]);
            // Get user profile data for subscription info
            const profileData = yield queryOne(`
        SELECT 
          monthly_credit_limit,
          credits_used,
          subscription_tier,
          stripe_customer_id,
          subscription_id
        FROM profiles
        WHERE id = $1
      `, [user.id]);
            // If user has a subscription, get additional details from Stripe
            let subscription = null;
            if (profileData === null || profileData === void 0 ? void 0 : profileData.subscription_id) {
                subscription = yield queryOne(`
          SELECT 
            current_period_end,
            cancel_at_period_end
          FROM subscriptions
          WHERE id = $1
        `, [profileData.subscription_id]);
            }
            const formattedUsage = formatUsageResponse(usageData, profileData, subscription);
            return createSuccessResponse({
                usage: formattedUsage
            });
        }
        catch (error) {
            console.error('Error fetching user usage:', error);
            return createErrorResponse('Failed to fetch usage data', 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
    });
}));
