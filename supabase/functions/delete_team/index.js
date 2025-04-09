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
import { queryOne, execute } from "../_shared/postgres.ts";
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { teamId } = body;
            if (!teamId) {
                return createErrorResponse("Missing required field: teamId", 400);
            }
            // Start a transaction
            yield execute("BEGIN");
            try {
                // Check if team exists and user is an admin member
                const teamMember = yield queryOne("SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = 'admin'", [teamId, user.id]);
                if (!teamMember && user.role !== 'admin') {
                    throw new Error("Unauthorized to delete this team");
                }
                // Check if team exists
                const team = yield queryOne("SELECT id FROM teams WHERE id = $1", [teamId]);
                if (!team) {
                    throw new Error("Team not found");
                }
                // Delete team invites first (due to foreign key constraint)
                yield execute("DELETE FROM team_invites WHERE team_id = $1", [teamId]);
                // Delete team members (due to foreign key constraint)
                yield execute("DELETE FROM team_members WHERE team_id = $1", [teamId]);
                // Delete the team
                yield execute("DELETE FROM teams WHERE id = $1", [teamId]);
                // Commit the transaction
                yield execute("COMMIT");
                return createSuccessResponse({
                    message: "Team deleted successfully",
                    teamId,
                });
            }
            catch (error) {
                // Rollback the transaction on error
                yield execute("ROLLBACK");
                throw error;
            }
        }
        catch (error) {
            console.error("Error in delete_team:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
        requireBody: true,
    });
}));
