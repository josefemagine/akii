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
import { query, execute } from "../_shared/postgres.ts";
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        const { invite_id } = body;
        if (!invite_id) {
            return createErrorResponse('Missing required fields');
        }
        // Get the invite
        const { rows: invites } = yield query('SELECT * FROM team_invites WHERE id = $1 AND email = $2', [invite_id, user.email]);
        if (!invites || invites.length === 0) {
            return createErrorResponse('Invite not found or expired');
        }
        const invite = invites[0];
        // Check if user is already in the team
        const { rows: members } = yield query('SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2', [invite.team_id, user.id]);
        if (members && members.length > 0) {
            return createErrorResponse('User is already a member of this team');
        }
        // Add user to team
        yield execute('INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)', [invite.team_id, user.id, 'member']);
        // Delete the invite
        yield execute('DELETE FROM team_invites WHERE id = $1', [invite_id]);
        return createSuccessResponse({
            success: true,
            team_id: invite.team_id
        });
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
        requireBody: true
    });
}));
