import { handleRequest, createSuccessResponse, createErrorResponse, createAuthClient } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";

// Augment query result with rows property
declare module "../_shared/postgres" {
  interface QueryResult<T> {
    rows: T[];
    rowCount: number;
  }
}


interface UserUsage {
  user_id: string;
  email: string;
  total_tokens: number;
  total_cost: number;
  total_requests: number;
  last_request_at: string | null;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user) => {
      try {
        // Check if user is admin
        const { rows } = await query<{ role: string }>(
          "SELECT role FROM profiles WHERE id = $1",
          [user.id]
        );

        if (!rows[0] || rows[0].role !== "admin") {
          return createErrorResponse("Unauthorized: Admin access required", 403);
        }

        // Get usage data for all users
        const { rows: userUsage } = await query<UserUsage>(`
          SELECT 
            p.id as user_id,
            p.email,
            COALESCE(SUM(u.tokens), 0) as total_tokens,
            COALESCE(SUM(u.cost), 0) as total_cost,
            COUNT(u.id) as total_requests,
            MAX(u.created_at) as last_request_at
          FROM profiles p
          LEFT JOIN usage u ON p.id = u.user_id
          GROUP BY p.id, p.email
          ORDER BY total_tokens DESC
        `);

        return createSuccessResponse({ userUsage });

      } catch (error) {
        console.error("Error in admin_get_user_usage:", error);
        return createErrorResponse(
          error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "An unexpected error occurred",
          500
        );
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
      requireAuth: true,
    }
  );
}); 