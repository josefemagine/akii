import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";

interface ListAgentsRequest {
  page?: number;
  limit?: number;
  search?: string;
  isPublic?: boolean;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  is_public: boolean;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ListAgentsResponse {
  agents: Agent[];
  total: number;
  page: number;
  limit: number;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: ListAgentsRequest) => {
      try {
        const { page = 1, limit = 10, search, isPublic } = body;

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Build WHERE clause for the SQL query
        let whereClause = "";
        const queryParams: any[] = [];
        let paramCount = 0;

        // Add filter for public agents or agents created by the user
        if (isPublic !== undefined) {
          whereClause += `WHERE is_public = $${++paramCount}`;
          queryParams.push(isPublic);
        } else {
          whereClause += `WHERE (is_public = true OR created_by = $${++paramCount})`;
          queryParams.push(user.id);
        }

        // Add search filter if provided
        if (search) {
          whereClause += ` AND (name ILIKE $${++paramCount} OR description ILIKE $${++paramCount})`;
          queryParams.push(`%${search}%`, `%${search}%`);
        }

        // Get total count
        const countResult = await query<{ count: number }>(
          `SELECT COUNT(*) as count FROM agents ${whereClause}`,
          queryParams
        );
        
        const total = countResult.rows[0]?.count || 0;

        // Get agents with pagination
        const agentsResult = await query<Agent>(
          `SELECT * FROM agents ${whereClause} ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`,
          [...queryParams, limit, offset]
        );

        return createSuccessResponse({
          agents: agentsResult.rows,
          total: parseInt(total.toString()),
          page,
          limit,
        });
      } catch (error) {
        console.error("Unexpected error in list_agents:", error);
        return createErrorResponse("An unexpected error occurred", 500);
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
      requireAuth: true,
    }
  );
}); 