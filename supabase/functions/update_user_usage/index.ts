// This edge function updates a user's message usage count

import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";

interface UpdateUsageRequest {
  tokens: number;
  cost: number;
  team_id?: string;
}

interface Usage {
  id: string;
  user_id: string;
  team_id: string | null;
  tokens: number;
  cost: number;
  created_at: string;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, { tokens, cost, team_id }: UpdateUsageRequest) => {
      try {
        // Validate required fields
        if (tokens === undefined || cost === undefined) {
          return createErrorResponse("Missing required fields", 400);
        }

        // If team_id is provided, verify user is a member of the team
        if (team_id) {
          const { rows: teamMembers } = await query<{ role: string }>(
            "SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2",
            [team_id, user.id]
          );

          if (!teamMembers[0]) {
            return createErrorResponse("User is not a member of the specified team", 403);
          }
        }

        // Create the usage record
        const { rows: usage } = await query<Usage>(`
          INSERT INTO usage (
            user_id,
            team_id,
            tokens,
            cost
          ) VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [user.id, team_id || null, tokens, cost]);

        return createSuccessResponse({ usage: usage[0] });

      } catch (error) {
        console.error("Error in update_user_usage:", error);
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
