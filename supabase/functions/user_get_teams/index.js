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
    return handleRequest(req, (user) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { rows: teams } = yield query(`
        SELECT 
          t.id,
          t.name,
          t.description,
          t.owner_id,
          t.created_at,
          t.updated_at,
          tm.role,
          (
            SELECT COUNT(*) 
            FROM team_members 
            WHERE team_id = t.id
          ) as members_count
        FROM teams t
        JOIN team_members tm ON t.id = tm.team_id
        WHERE tm.user_id = $1
        ORDER BY t.created_at DESC
      `, [user.id]);
            return createSuccessResponse({ teams });
        }
        catch (error) {
            console.error('Error fetching teams:', error);
            return createErrorResponse('Failed to fetch user teams', 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
    });
}));
