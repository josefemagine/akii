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
            // Get usage data for all teams
            const { rows: teamUsage } = yield query(`
          SELECT 
            t.id as team_id,
            t.name as team_name,
            COALESCE(SUM(u.tokens), 0) as total_tokens,
            COALESCE(SUM(u.cost), 0) as total_cost,
            COUNT(u.id) as total_requests,
            MAX(u.created_at) as last_request_at
          FROM teams t
          LEFT JOIN usage u ON t.id = u.team_id
          GROUP BY t.id, t.name
          ORDER BY total_tokens DESC
        `);
            return createSuccessResponse({ teamUsage });
        }
        catch (error) {
            console.error("Error in admin_get_team_usage:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
    });
}));
