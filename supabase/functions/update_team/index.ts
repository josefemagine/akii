import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, queryOne, execute } from "../_shared/postgres.ts";

interface UpdateTeamRequest {
  teamId: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

interface Team {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: UpdateTeamRequest) => {
      try {
        const { teamId, name, description, isActive } = body;
        if (!teamId) {
          return createErrorResponse("Missing required field: teamId", 400);
        }

        // Check if team exists and user has permission
        const team = await queryOne<Team>(
          "SELECT id, owner_id FROM teams WHERE id = $1",
          [teamId]
        );

        if (!team) {
          return createErrorResponse("Team not found", 404);
        }

        // Check if user is the owner or has admin role
        const isTeamAdmin = await queryOne(
          "SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = 'admin'",
          [teamId, user.id]
        );

        if (team.owner_id !== user.id && !isTeamAdmin && user.role !== "admin") {
          return createErrorResponse("Unauthorized to update this team", 403);
        }

        // Prepare update data
        const updateData: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (isActive !== undefined) updateData.is_active = isActive;

        // Build the update query
        const setClauses = Object.entries(updateData)
          .map(([key, value], index) => `${key} = $${index + 2}`)
          .join(", ");

        const values = [teamId, ...Object.values(updateData)];

        // Update the team
        const updatedTeam = await queryOne<Team>(
          `UPDATE teams 
           SET ${setClauses}
           WHERE id = $1
           RETURNING *`,
          values
        );

        return createSuccessResponse({
          message: "Team updated successfully",
          team: updatedTeam,
        });
      } catch (error) {
        console.error("Unexpected error in update_team:", error);
        return createErrorResponse("An unexpected error occurred", 500);
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
      requireAuth: true,
      requireBody: true,
    }
  );
}); 