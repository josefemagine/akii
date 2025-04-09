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
import { queryOne, query } from "../_shared/postgres.ts";
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { teamId } = body;
            if (!teamId) {
                return createErrorResponse("Missing required field: teamId", 400);
            }
            // Check if user is a member of the team
            const teamMember = yield queryOne("SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2", [teamId, user.id]);
            if (!teamMember && user.role !== "admin") {
                return createErrorResponse("Unauthorized to access this team", 403);
            }
            // Get the team details
            const team = yield queryOne("SELECT * FROM teams WHERE id = $1", [teamId]);
            if (!team) {
                return createErrorResponse("Team not found", 404);
            }
            // Get all team members with user details
            const { rows: members } = yield query(`
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
                userRole: (teamMember === null || teamMember === void 0 ? void 0 : teamMember.role) || "admin", // If user is not a member but can access (admin), return "admin"
            });
        }
        catch (error) {
            console.error("Error in get_team:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
        requireBody: true,
    });
}));
