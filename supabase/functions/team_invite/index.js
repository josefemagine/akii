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
// Special admin email for development purposes
const ADMIN_EMAIL = "josef@holm.com";
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, role, teamId } = body;
            if (!email || !role || !teamId) {
                return createErrorResponse("Missing required fields: email, role, teamId", 400);
            }
            // Check if the current user is the admin email and update their role if needed
            if (user.email === ADMIN_EMAIL) {
                // Update the user's profile to have admin role
                yield execute("UPDATE users SET role = $1 WHERE id = $2", ["admin", user.id]);
            }
            // Check if the user has permission to invite to this team
            const team = yield queryOne("SELECT owner_id FROM teams WHERE id = $1", [teamId]);
            if (!team) {
                return createErrorResponse("Team not found", 404);
            }
            if (team.owner_id !== user.id && user.role !== "admin") {
                return createErrorResponse("Unauthorized to invite to this team", 403);
            }
            // Check if the email is already invited
            const existingInvite = yield queryOne("SELECT * FROM team_invites WHERE email = $1 AND team_id = $2", [email, teamId]);
            if (existingInvite) {
                return createErrorResponse("User already invited to this team", 400);
            }
            // Create the invite
            const invite = yield queryOne(`INSERT INTO team_invites (
            email,
            role,
            team_id,
            invited_by,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *`, [
                email,
                role,
                teamId,
                user.id,
                new Date().toISOString(),
                new Date().toISOString()
            ]);
            return createSuccessResponse({
                message: "Invite created successfully",
                invite,
            });
        }
        catch (error) {
            console.error("Unexpected error in team_invite:", error);
            return createErrorResponse("An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
        requireBody: true,
    });
}));
