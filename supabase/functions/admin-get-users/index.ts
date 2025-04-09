import { handleRequest, createSuccessResponse, createErrorResponse, createAuthClient } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";

interface UserProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  stripe_customer_id: string | null;
  subscription_status: string | null;
  subscription_tier: string | null;
  subscription_end_date: string | null;
  team_count: number;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user) => {
      try {
        // Check if user is admin
        const { rows } = await query<{ role: string }>(
          "SELECT role FROM profiles WHERE id = $1",
          [user.id]
        );

        if (!rows[0] || rows[0].role !== "admin") {
          return createErrorResponse("Unauthorized: Admin access required", 403);
        }

        // Get all users with their subscription info and team count
        const { rows: users } = await query<UserProfile>(`
          SELECT 
            p.id,
            p.email,
            p.role,
            p.created_at,
            p.updated_at,
            p.stripe_customer_id,
            p.subscription_status,
            p.subscription_tier,
            p.subscription_end_date,
            COUNT(DISTINCT tm.team_id) as team_count
          FROM profiles p
          LEFT JOIN team_members tm ON p.id = tm.user_id
          GROUP BY p.id
          ORDER BY p.created_at DESC
        `);

        return createSuccessResponse({ users });

      } catch (error) {
        console.error("Error in admin_get_users:", error);
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