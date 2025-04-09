import { handleRequest, createSuccessResponse, createErrorResponse, createAuthClient } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-03-31.basil",
  httpClient: Stripe.createFetchHttpClient(),
});

interface UserProfile {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  subscription_status: string | null;
  subscription_tier: string | null;
  subscription_end_date: string | null;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user) => {
      try {
        // Get user's Stripe customer ID
        const { rows: profiles } = await query<UserProfile>(
          "SELECT id, email, stripe_customer_id, subscription_status, subscription_tier, subscription_end_date FROM profiles WHERE id = $1",
          [user.id]
        );

        if (!profiles[0] || !profiles[0].stripe_customer_id) {
          return createErrorResponse("No active subscription found", 404);
        }

        // Get active subscriptions for the customer
        const subscriptions = await stripe.subscriptions.list({
          customer: profiles[0].stripe_customer_id,
          status: "active",
        });

        if (subscriptions.data.length === 0) {
          return createErrorResponse("No active subscription found", 404);
        }

        // Cancel each active subscription
        for (const subscription of subscriptions.data) {
          await stripe.subscriptions.cancel(subscription.id);
        }

        // Update user's subscription status in the database
        const { rows: updatedProfiles } = await query<UserProfile>(`
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

      } catch (error) {
        console.error("Error in cancel-subscription:", error);
        return createErrorResponse(
          error instanceof Error ? error.message : "An unexpected error occurred",
          500
        );
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "STRIPE_SECRET_KEY"],
      requireAuth: true,
    }
  );
}); 