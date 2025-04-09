import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts"
import { query, queryOne } from "../_shared/postgres.ts"

interface UsageData {
  messageCount: number;
  tokenCount: number;
  imageCount: number;
  audioCount: number;
  credits: {
    total: number;
    used: number;
    remaining: number;
  };
  billing: {
    plan: string;
    nextBillingDate: string | null;
    isCanceled: boolean;
  };
}

interface UserGetUsageResponse {
  usage: UsageData;
}

interface UserProfile {
  monthly_credit_limit: number;
  credits_used: number;
  subscription_tier: string;
  stripe_customer_id: string;
  subscription_id: string;
}

interface SubscriptionData {
  current_period_end: number;
  cancel_at_period_end: boolean;
}

// Helper to format the response with consistent data structure
const formatUsageResponse = (
  usageData: any,
  profileData: UserProfile | null,
  subscription: SubscriptionData | null
): UsageData => {
  const messageCount = usageData?.message_count || 0;
  const tokenCount = usageData?.token_count || 0;
  const imageCount = usageData?.image_count || 0;
  const audioCount = usageData?.audio_count || 0;
  
  // Calculate credits
  const totalCredits = profileData?.monthly_credit_limit || 0;
  const usedCredits = profileData?.credits_used || 0;
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
      plan: profileData?.subscription_tier || 'free',
      nextBillingDate: subscription?.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      isCanceled: subscription?.cancel_at_period_end || false
    }
  };
};

Deno.serve(async (req) => {
  return handleRequest(req, async (user) => {
    try {
      // Get user usage data
      const usageData = await queryOne(`
        SELECT 
          message_count,
          token_count,
          image_count,
          audio_count
        FROM user_usage
        WHERE user_id = $1
      `, [user.id]);

      // Get user profile data for subscription info
      const profileData = await queryOne<UserProfile>(`
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
      if (profileData?.subscription_id) {
        subscription = await queryOne<SubscriptionData>(`
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
    } catch (error) {
      console.error('Error fetching user usage:', error);
      return createErrorResponse('Failed to fetch usage data', 500);
    }
  }, {
    requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
    requireAuth: true,
  });
}); 