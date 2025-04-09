// This edge function updates a user's message usage count
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user_1, _a) => __awaiter(void 0, [user_1, _a], void 0, function* (user, { tokens, cost, team_id }) {
        try {
            // Validate required fields
            if (tokens === undefined || cost === undefined) {
                return createErrorResponse("Missing required fields", 400);
            }
            // If team_id is provided, verify user is a member of the team
            if (team_id) {
                const { rows: teamMembers } = yield query("SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2", [team_id, user.id]);
                if (!teamMembers[0]) {
                    return createErrorResponse("User is not a member of the specified team", 403);
                }
            }
            // Create the usage record
            const { rows: usage } = yield query(`
          INSERT INTO usage (
            user_id,
            team_id,
            tokens,
            cost
          ) VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [user.id, team_id || null, tokens, cost]);
            return createSuccessResponse({ usage: usage[0] });
        }
        catch (error) {
            console.error("Error in update_user_usage:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
    });
}));
