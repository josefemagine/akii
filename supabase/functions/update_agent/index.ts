import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, queryOne, execute } from "../_shared/postgres.ts";

interface UpdateAgentRequest {
  agentId: string;
  name?: string;
  description?: string;
  systemPrompt?: string;
  isPublic?: boolean;
  isActive?: boolean;
}

interface Agent {
  id: string;
  created_by: string;
  name: string;
  description: string;
  system_prompt: string;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: UpdateAgentRequest) => {
      try {
        const { agentId, name, description, systemPrompt, isPublic, isActive } = body;
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
          return createErrorResponse("Unauthorized to update this agent", 403);
        }

        // Prepare update data
        const updateData: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (systemPrompt !== undefined) updateData.system_prompt = systemPrompt;
        if (isPublic !== undefined) updateData.is_public = isPublic;
        if (isActive !== undefined) updateData.is_active = isActive;

        // Build the update query
        const setClauses = Object.entries(updateData)
          .map(([key, value], index) => `${key} = $${index + 2}`)
          .join(", ");

        const values = [agentId, ...Object.values(updateData)];

        // Update the agent
        const updatedAgent = await queryOne<Agent>(
          `UPDATE agents 
           SET ${setClauses}
           WHERE id = $1
           RETURNING *`,
          values
        );

        return createSuccessResponse({
          message: "Agent updated successfully",
          agent: updatedAgent,
        });
      } catch (error) {
        console.error("Unexpected error in update_agent:", error);
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