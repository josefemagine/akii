import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { queryOne, execute } from "../_shared/postgres.ts";

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
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body) => {
      try {
        const { name } = body;
        if (!name) {
          return createErrorResponse("Missing required field: name", 400);
        }

        // Start a transaction
        await execute("BEGIN");

        try {
          // Create the team
          const team = await queryOne<Team>(
            `INSERT INTO teams (
              name,
              created_by,
              created_at,
              updated_at
            ) VALUES ($1, $2, NOW(), NOW())
            RETURNING *`,
            [name, user.id]
          );

          if (!team) {
            throw new Error("Failed to create team");
          }

          // Add the creator as an admin member
          const teamMember = await queryOne<TeamMember>(
            `INSERT INTO team_members (
              team_id,
              user_id,
              role,
              created_at,
              updated_at
            ) VALUES ($1, $2, 'admin', NOW(), NOW())
            RETURNING *`,
            [team.id, user.id]
          );

          if (!teamMember) {
            throw new Error("Failed to add team member");
          }

          // Commit the transaction
          await execute("COMMIT");

          return createSuccessResponse({
            message: "Team created successfully",
            team,
            teamMember,
          });
        } catch (error) {
          // Rollback the transaction on error
          await execute("ROLLBACK");
          throw error;
        }
      } catch (error) {
        console.error("Error in create_team:", error);
        return createErrorResponse(error.message);
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
      requireAuth: true,
      requireBody: true,
    }
  );
}); 