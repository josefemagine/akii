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
            // Check if user is admin
            const { rows } = yield query("SELECT role FROM profiles WHERE id = $1", [user.id]);
            if (!rows[0] || rows[0].role !== "admin") {
                return createErrorResponse("Unauthorized: Admin access required", 403);
            }
            // Get all teams with owner info and member count
            const { rows: teams } = yield query(`
          SELECT 
            t.id,
            t.name,
            t.created_at,
            t.updated_at,
            t.owner_id,
            p.email as owner_email,
            (
              SELECT COUNT(*)
              FROM team_members tm
              WHERE tm.team_id = t.id
            ) as member_count
          FROM teams t
          LEFT JOIN profiles p ON t.owner_id = p.id
          ORDER BY t.created_at DESC
        `);
            return createSuccessResponse({ teams });
        }
        catch (error) {
            console.error("Error in admin_get_teams:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
    });
}));
