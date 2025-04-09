import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";

// Augment query result with rows property
declare module "../_shared/postgres" {
  interface QueryResult<T> {
    rows: T[];
    rowCount: number;
  }
}


Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body) => {
      try {
        const userId = body?.userId;
        
        // Check if user is admin
        const { rows } = await query<{ role: string }>(
          "SELECT role FROM profiles WHERE id = $1",
          [user.id]
        );

        if (!rows[0] || rows[0].role !== "admin") {
          return createErrorResponse("Unauthorized: Admin access required", 403);
        }

        if (!userId) {
          return createErrorResponse("User ID is required", 400);
        }

        // Get user profile with subscription and team info
        const { rows: profiles } = await query(`
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
            COALESCE(
              json_agg(
                json_build_object(
                  'team_id', t.id,
                  'team_name', t.name,
                  'role', tm.role
                )
              ) FILTER (WHERE t.id IS NOT NULL),
              '[]'
            ) as teams
          FROM profiles p
          LEFT JOIN team_members tm ON p.id = tm.user_id
          LEFT JOIN teams t ON tm.team_id = t.id
          WHERE p.id = $1
          GROUP BY p.id
        `, [userId]);

        if (!profiles[0]) {
          return createErrorResponse("User not found", 404);
        }

        return createSuccessResponse({ user: profiles[0] });

      } catch (error) {
        console.error("Error in admin_get_user:", error);
        return createErrorResponse(
          error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "An unexpected error occurred",
          500
        );
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
      requireAuth: true,
      requireBody: true,
    }
  );
}); 