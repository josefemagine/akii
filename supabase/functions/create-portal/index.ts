import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { queryOne } from "../_shared/postgres.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?dts";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: '2023-10-16',
});

interface Profile {
  id: string;
  stripe_customer_id: string | null;
}

interface PortalResponse {
  url: string;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user) => {
      try {
        // Fetch the user's profile to get Stripe customer ID
        const profile = await queryOne<Profile>(
          "SELECT stripe_customer_id FROM profiles WHERE id = $1",
          [user.id]
        );

        if (!profile) {
          return createErrorResponse('Error fetching profile', 500);
        }

        if (!profile.stripe_customer_id) {
          return createErrorResponse('No Stripe customer found for this user', 404);
        }

        // Create a billing portal session
        const session = await stripe.billingPortal.sessions.create({
          customer: profile.stripe_customer_id,
          return_url: `${Deno.env.get('CLIENT_URL')}/dashboard/billing`,
        });

        return createSuccessResponse({
          url: session.url,
        });

      } catch (error) {
        console.error('Error creating portal session:', error);
        return createErrorResponse(
          error instanceof Error ? error.message : 'An unexpected error occurred',
          500
        );
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "STRIPE_SECRET_KEY", "CLIENT_URL"],
      requireAuth: true,
    }
  );
}); 