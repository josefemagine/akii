import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, queryOne, execute } from "../_shared/postgres.ts";

// Special admin email for development purposes
const ADMIN_EMAIL = "josef@holm.com";

interface TeamInviteRequest {
  email: string;
  role: string;
  teamId: string;
}

interface Team {
  id: string;
  owner_id: string;
}

interface TeamInvite {
  id: string;
  email: string;
  role: string;
  team_id: string;
  invited_by: string;
  created_at: string;
  updated_at: string;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: TeamInviteRequest) => {
      try {
        const { email, role, teamId } = body;

        if (!email || !role || !teamId) {
          return createErrorResponse("Missing required fields: email, role, teamId", 400);
        }

        // Check if the current user is the admin email and update their role if needed
        if (user.email === ADMIN_EMAIL) {
          // Update the user's profile to have admin role
          await execute(
            "UPDATE users SET role = $1 WHERE id = $2",
            ["admin", user.id]
          );
        }

        // Check if the user has permission to invite to this team
        const team = await queryOne<Team>(
          "SELECT owner_id FROM teams WHERE id = $1",
          [teamId]
        );

        if (!team) {
          return createErrorResponse("Team not found", 404);
        }

        if (team.owner_id !== user.id && user.role !== "admin") {
          return createErrorResponse("Unauthorized to invite to this team", 403);
        }

        // Check if the email is already invited
        const existingInvite = await queryOne<TeamInvite>(
          "SELECT * FROM team_invites WHERE email = $1 AND team_id = $2",
          [email, teamId]
        );

        if (existingInvite) {
          return createErrorResponse("User already invited to this team", 400);
        }

        // Create the invite
        const invite = await queryOne<TeamInvite>(
          `INSERT INTO team_invites (
            email,
            role,
            team_id,
            invited_by,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *`,
          [
            email,
            role,
            teamId,
            user.id,
            new Date().toISOString(),
            new Date().toISOString()
          ]
        );

        return createSuccessResponse({
          message: "Invite created successfully",
          invite,
        });
      } catch (error) {
        console.error("Unexpected error in team_invite:", error);
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
