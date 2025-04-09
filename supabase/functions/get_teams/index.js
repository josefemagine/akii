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
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { includeInactive = false } = body;
            // Get all teams the user is a member of, along with member count and user's role
            const { rows: teams } = yield query(`
          WITH team_counts AS (
            SELECT 
              team_id,
              COUNT(*) as member_count
            FROM team_members
            GROUP BY team_id
          )
          SELECT 
            t.*,
            COALESCE(tc.member_count, 0) as member_count,
            tm.role as user_role
          FROM teams t
          INNER JOIN team_members tm ON tm.team_id = t.id
          LEFT JOIN team_counts tc ON tc.team_id = t.id
          WHERE tm.user_id = $1
          ORDER BY t.created_at DESC
        `, [user.id]);
            return createSuccessResponse({
                teams,
                count: teams.length,
            });
        }
        catch (error) {
            console.error("Error in get_teams:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
        requireBody: false,
    });
}));
