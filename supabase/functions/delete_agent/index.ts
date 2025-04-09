import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { queryOne, execute } from "../_shared/postgres.ts";

interface DeleteAgentRequest {
  agentId: string;
}

interface Agent {
  id: string;
  created_by: string;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: DeleteAgentRequest) => {
      try {
        const { agentId } = body;
        if (!agentId) {
          return createErrorResponse("Missing required field: agentId", 400);
        }

        // Check if agent exists and belongs to the user
        const agent = await queryOne<Agent>(
          "SELECT id, created_by FROM agents WHERE id = $1",
          [agentId]
        );

        if (!agent) {
          return createErrorResponse("Agent not found", 404);
        }

        // Check if user is the creator or has admin role
        if (agent.created_by !== user.id && user.role !== "admin") {
          return createErrorResponse("Unauthorized to delete this agent", 403);
        }

        // Delete the agent
        await execute(
          "DELETE FROM agents WHERE id = $1",
          [agentId]
        );

        return createSuccessResponse({
          message: "Agent deleted successfully",
          agentId,
        });
      } catch (error) {
        console.error("Unexpected error in delete_agent:", error);
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