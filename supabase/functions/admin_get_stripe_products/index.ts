import { handleRequest, createSuccessResponse, createErrorResponse, createAuthClient } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";

interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  metadata: Record<string, string>;
  prices: {
    id: string;
    currency: string;
    unit_amount: number;
    recurring: {
      interval: string;
      interval_count: number;
    } | null;
  }[];
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user) => {
      try {
        // Check if user is admin
        const { data: profile, error: profileError } = await query<{ role: string }>(
          "SELECT role FROM profiles WHERE id = $1",
          [user.id]
        );

        if (profileError || !profile.rows[0] || profile.rows[0].role !== "admin") {
          return createErrorResponse("Unauthorized: Admin access required", 403);
        }

        // Get all active products with their prices
        const { rows: products } = await query<StripeProduct>(`
          SELECT 
            p.id,
            p.name,
            p.description,
            p.active,
            p.metadata,
            json_agg(
              json_build_object(
                'id', pr.id,
                'currency', pr.currency,
                'unit_amount', pr.unit_amount,
                'recurring', pr.recurring
              )
            ) as prices
          FROM stripe_products p
          LEFT JOIN stripe_prices pr ON p.id = pr.product_id
          WHERE p.active = true
          GROUP BY p.id
        `);

        return createSuccessResponse({ products });

      } catch (error) {
        console.error("Error in admin_get_stripe_products:", error);
        return createErrorResponse(
          error instanceof Error ? error.message : "An unexpected error occurred",
          500
        );
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
      requireAuth: true,
    }
  );
}); 