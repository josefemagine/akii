import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { queryOne } from "../_shared/postgres.ts";

interface GetAgentRequest {
  agentId: string;
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

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: GetAgentRequest) => {
      try {
        const { agentId } = body;
        if (!agentId) {
          return createErrorResponse("Missing required field: agentId", 400);
        }

        // Get the agent
        const agent = await queryOne<Agent>(
          "SELECT * FROM agents WHERE id = $1",
          [agentId]
        );

        if (!agent) {
          return createErrorResponse("Agent not found", 404);
        }

        // Check if agent is public or belongs to the user
        if (!agent.is_public && agent.created_by !== user.id && user.role !== "admin") {
          return createErrorResponse("Unauthorized to access this agent", 403);
        }

        return createSuccessResponse({
          agent,
        });
      } catch (error) {
        console.error("Unexpected error in get_agent:", error);
        return createErrorResponse("An unexpected error occurred", 500);
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
      requireAuth: true,
      requireBody: true,
    }
  );
}); 