import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { queryOne, execute } from "../_shared/postgres.ts";

interface DeleteTeamRequest {
  teamId: string;
}

interface Team {
  id: string;
  created_by: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: DeleteTeamRequest) => {
      try {
        const { teamId } = body;
        if (!teamId) {
          return createErrorResponse("Missing required field: teamId", 400);
        }

        // Start a transaction
        await execute("BEGIN");

        try {
          // Check if team exists and user is an admin member
          const teamMember = await queryOne<TeamMember>(
            "SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = 'admin'",
            [teamId, user.id]
          );

          if (!teamMember && user.role !== 'admin') {
            throw new Error("Unauthorized to delete this team");
          }

          // Check if team exists
          const team = await queryOne<Team>(
            "SELECT id FROM teams WHERE id = $1",
            [teamId]
          );

          if (!team) {
            throw new Error("Team not found");
          }

          // Delete team invites first (due to foreign key constraint)
          await execute(
            "DELETE FROM team_invites WHERE team_id = $1",
            [teamId]
          );

          // Delete team members (due to foreign key constraint)
          await execute(
            "DELETE FROM team_members WHERE team_id = $1",
            [teamId]
          );

          // Delete the team
          await execute(
            "DELETE FROM teams WHERE id = $1",
            [teamId]
          );

          // Commit the transaction
          await execute("COMMIT");

          return createSuccessResponse({
            message: "Team deleted successfully",
            teamId,
          });
        } catch (error) {
          // Rollback the transaction on error
          await execute("ROLLBACK");
          throw error;
        }
      } catch (error) {
        console.error("Error in delete_team:", error);
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