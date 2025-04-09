import { handleRequest, createSuccessResponse, createErrorResponse, createAuthClient } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";

interface TeamUsage {
  team_id: string;
  team_name: string;
  total_tokens: number;
  total_cost: number;
  total_requests: number;
  last_request_at: string | null;
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

        // Get usage data for all teams
        const { rows: teamUsage } = await query<TeamUsage>(`
          SELECT 
            t.id as team_id,
            t.name as team_name,
            COALESCE(SUM(u.tokens), 0) as total_tokens,
            COALESCE(SUM(u.cost), 0) as total_cost,
            COUNT(u.id) as total_requests,
            MAX(u.created_at) as last_request_at
          FROM teams t
          LEFT JOIN usage u ON t.id = u.team_id
          GROUP BY t.id, t.name
          ORDER BY total_tokens DESC
        `);

        return createSuccessResponse({ teamUsage });

      } catch (error) {
        console.error("Error in admin_get_team_usage:", error);
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