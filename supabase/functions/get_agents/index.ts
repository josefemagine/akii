import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";

// Augment query result with rows property
declare module "../_shared/postgres" {
  interface QueryResult<T> {
    rows: T[];
    rowCount: number;
  }
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

interface GetAgentsRequest {
  includePublic?: boolean;
  includeInactive?: boolean;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: GetAgentsRequest) => {
      try {
        const { includePublic = true, includeInactive = false } = body;

        // Build the query conditions
        const conditions = [];
        const params = [];
        let paramIndex = 1;

        // Only include active agents by default
        if (!includeInactive) {
          conditions.push(`is_active = true`);
        }

        // Include user's own agents and optionally public agents
        if (includePublic) {
          conditions.push(`(created_by = $${paramIndex} OR is_public = true)`);
        } else {
          conditions.push(`created_by = $${paramIndex}`);
        }
        params.push(user.id);

        // Build the final query
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const query_string = `
          SELECT * FROM agents
          ${whereClause}
          ORDER BY created_at DESC
        `;

        // Get the agents
        const { rows: agents } = await query<Agent>(query_string, params);

        return createSuccessResponse({
          agents,
          count: agents.length,
        });
      } catch (error) {
        console.error("Unexpected error in get_agents:", error);
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