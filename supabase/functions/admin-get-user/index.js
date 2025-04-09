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
    return handleRequest(req, (user_1, _a) => __awaiter(void 0, [user_1, _a], void 0, function* (user, { userId }) {
        try {
            // Check if user is admin
            const { rows } = yield query("SELECT role FROM profiles WHERE id = $1", [user.id]);
            if (!rows[0] || rows[0].role !== "admin") {
                return createErrorResponse("Unauthorized: Admin access required", 403);
            }
            if (!userId) {
                return createErrorResponse("User ID is required", 400);
            }
            // Get user profile with subscription and team info
            const { rows: profiles } = yield query(`
          SELECT 
            p.id,
            p.email,
            p.role,
            p.created_at,
            p.updated_at,
            p.stripe_customer_id,
            p.subscription_status,
            p.subscription_tier,
            p.subscription_end_date,
            COALESCE(
              json_agg(
                json_build_object(
                  'team_id', t.id,
                  'team_name', t.name,
                  'role', tm.role
                )
              ) FILTER (WHERE t.id IS NOT NULL),
              '[]'
            ) as teams
          FROM profiles p
          LEFT JOIN team_members tm ON p.id = tm.user_id
          LEFT JOIN teams t ON tm.team_id = t.id
          WHERE p.id = $1
          GROUP BY p.id
        `, [userId]);
            if (!profiles[0]) {
                return createErrorResponse("User not found", 404);
            }
            return createSuccessResponse({ user: profiles[0] });
        }
        catch (error) {
            console.error("Error in admin_get_user:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
    });
}));
