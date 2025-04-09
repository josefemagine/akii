import { handleRequest, createSuccessResponse, createErrorResponse, createAuthClient } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";

interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  owner_email: string;
  member_count: number;
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

        // Get all teams with owner info and member count
        const { rows: teams } = await query<Team>(`
          SELECT 
            t.id,
            t.name,
            t.created_at,
            t.updated_at,
            t.owner_id,
            p.email as owner_email,
            (
              SELECT COUNT(*)
              FROM team_members tm
              WHERE tm.team_id = t.id
            ) as member_count
          FROM teams t
          LEFT JOIN profiles p ON t.owner_id = p.id
          ORDER BY t.created_at DESC
        `);

        return createSuccessResponse({ teams });

      } catch (error) {
        console.error("Error in admin_get_teams:", error);
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