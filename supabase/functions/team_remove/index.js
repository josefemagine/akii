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
import { query, queryOne, execute } from "../_shared/postgres.ts";
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { teamId, userId } = body;
            if (!teamId || !userId) {
                return createErrorResponse("Missing required fields: teamId and userId", 400);
            }
            // Check if the requesting user is an admin of the team
            const adminMember = yield queryOne("SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2", [teamId, user.id]);
            if (!adminMember || adminMember.role !== "admin") {
                return createErrorResponse("You must be a team admin to remove members", 403);
            }
            // Check if the user being removed exists in the team
            const memberToRemove = yield queryOne("SELECT id, role FROM team_members WHERE team_id = $1 AND user_id = $2", [teamId, userId]);
            if (!memberToRemove) {
                return createErrorResponse("User is not a member of this team", 404);
            }
            // Prevent removing the last admin
            if (memberToRemove.role === "admin") {
                const { rows: adminCount } = yield query("SELECT id FROM team_members WHERE team_id = $1 AND role = 'admin'", [teamId]);
                if (adminCount.length <= 1) {
                    return createErrorResponse("Cannot remove the last admin from the team", 400);
                }
            }
            // Remove the member from the team
            yield execute("DELETE FROM team_members WHERE team_id = $1 AND user_id = $2", [teamId, userId]);
            return createSuccessResponse({
                success: true,
                message: "Team member removed successfully",
            });
        }
        catch (error) {
            console.error("Error in team_remove:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
        requireBody: true,
    });
}));
