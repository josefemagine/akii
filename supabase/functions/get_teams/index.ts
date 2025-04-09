import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";

// Augment query result with rows property
declare module "../_shared/postgres" {
  interface QueryResult<T> {
    rows: T[];
    rowCount: number;
  }
}


interface Team {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count: number;
  user_role: string;
}

interface GetTeamsRequest {
  includeInactive?: boolean;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: GetTeamsRequest) => {
      try {
        const { includeInactive = false } = body;

        // Get all teams the user is a member of, along with member count and user's role
        const { rows: teams } = await query<Team>(`
          WITH team_counts AS (
            SELECT 
              team_id,
              COUNT(*) as member_count
            FROM team_members
            GROUP BY team_id
          )
          SELECT 
            t.*,
            COALESCE(tc.member_count, 0) as member_count,
            tm.role as user_role
          FROM teams t
          INNER JOIN team_members tm ON tm.team_id = t.id
          LEFT JOIN team_counts tc ON tc.team_id = t.id
          WHERE tm.user_id = $1
          ORDER BY t.created_at DESC
        `, [user.id]);

        return createSuccessResponse({
          teams,
          count: teams.length,
        });
      } catch (error) {
        console.error("Error in get_teams:", error);
        return createErrorResponse(
          error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "An unexpected error occurred",
          500
        );
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
      requireAuth: true,
      requireBody: false,
    }
  );
}); 