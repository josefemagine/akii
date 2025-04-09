import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";

// Augment query result with rows property
declare module "../_shared/postgres" {
  interface QueryResult<T> {
    rows: T[];
    rowCount: number;
  }
}


interface Usage {
  id: string;
  user_id: string;
  team_id: string | null;
  tokens: number;
  cost: number;
  created_at: string;
}

interface GetUserUsageRequest {
  startDate?: string;
  endDate?: string;
  teamId?: string;
}

interface UsageSummary {
  total_tokens: number;
  total_cost: number;
  usage_by_date: Array<{
    date: string;
    tokens: number;
    cost: number;
  }>;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: GetUserUsageRequest) => {
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
        const { rows: summary } = await query<UsageSummary>(`
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
        const { rows: recentUsage } = await query<Usage>(`
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
      } catch (error) {
        console.error("Error in get_user_usage:", error);
        return createErrorResponse(
          error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "An unexpected error occurred",
          500
        );
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
      requireAuth: true,
      requireBody: false,
    }
  );
}); 