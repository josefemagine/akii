import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { queryOne, query } from "../_shared/postgres.ts";

interface GetTeamRequest {
  teamId: string;
}

interface Team {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
  user_email: string;
  user_name: string;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: GetTeamRequest) => {
      try {
        const { teamId } = body;
        if (!teamId) {
          return createErrorResponse("Missing required field: teamId", 400);
        }

        // Check if user is a member of the team
        const teamMember = await queryOne<TeamMember>(
          "SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2",
          [teamId, user.id]
        );

        if (!teamMember && user.role !== "admin") {
          return createErrorResponse("Unauthorized to access this team", 403);
        }

        // Get the team details
        const team = await queryOne<Team>(
          "SELECT * FROM teams WHERE id = $1",
          [teamId]
        );

        if (!team) {
          return createErrorResponse("Team not found", 404);
        }

        // Get all team members with user details
        const { rows: members } = await query<TeamMember>(`
          SELECT 
            tm.*,
            p.email as user_email,
            p.full_name as user_name
          FROM team_members tm
          LEFT JOIN profiles p ON p.id = tm.user_id
          WHERE tm.team_id = $1
          ORDER BY tm.created_at ASC
        `, [teamId]);

        return createSuccessResponse({
          team,
          members,
          userRole: teamMember?.role || "admin", // If user is not a member but can access (admin), return "admin"
        });
      } catch (error) {
        console.error("Error in get_team:", error);
        return createErrorResponse(
          error instanceof Error ? error.message : "An unexpected error occurred",
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