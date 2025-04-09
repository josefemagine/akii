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
            const { startDate, endDate, teamId } = body;
            // Build query conditions
            const conditions = ["user_id = $1"];
            const params = [user.id];
            let paramIndex = 2;
            if (startDate) {
                conditions.push(`created_at >= $${paramIndex}`);
                params.push(startDate);
                paramIndex++;
            }
            if (endDate) {
                conditions.push(`created_at <= $${paramIndex}`);
                params.push(endDate);
                paramIndex++;
            }
            if (teamId) {
                conditions.push(`team_id = $${paramIndex}`);
                params.push(teamId);
                paramIndex++;
            }
            // Get usage summary
            const { rows: summary } = yield query(`
          WITH daily_usage AS (
            SELECT 
              DATE(created_at) as date,
              SUM(tokens) as tokens,
              SUM(cost) as cost
            FROM usage
            WHERE ${conditions.join(" AND ")}
            GROUP BY DATE(created_at)
            ORDER BY date DESC
          )
          SELECT 
            SUM(tokens) as total_tokens,
            SUM(cost) as total_cost,
            json_agg(
              json_build_object(
                'date', date,
                'tokens', tokens,
                'cost', cost
              )
            ) as usage_by_date
          FROM daily_usage
        `, params);
            // Get recent usage records
            const { rows: recentUsage } = yield query(`
          SELECT *
          FROM usage
          WHERE ${conditions.join(" AND ")}
          ORDER BY created_at DESC
          LIMIT 100
        `, params);
            return createSuccessResponse({
                summary: summary[0],
                recent_usage: recentUsage,
            });
        }
        catch (error) {
            console.error("Error in get_user_usage:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
        requireBody: false,
    });
}));
