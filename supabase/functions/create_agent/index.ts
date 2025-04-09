import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { queryOne } from "../_shared/postgres.ts";

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
    async (user, body) => {
      try {
        const { name, description, systemPrompt, isPublic = false } = body;
        if (!name || !description || !systemPrompt) {
          return createErrorResponse("Missing required fields: name, description, systemPrompt", 400);
        }

        // Create the agent
        const agent = await queryOne<Agent>(
          `INSERT INTO agents (
            name,
            description,
            system_prompt,
            is_public,
            created_by,
            is_active,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
          RETURNING *`,
          [name, description, systemPrompt, isPublic, user.id]
        );

        if (!agent) {
          throw new Error("Error creating agent");
        }

        return createSuccessResponse({
          message: "Agent created successfully",
          agent,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        });
      } catch (error) {
        console.error("Error in create_agent:", error);
        return createErrorResponse((error instanceof Error ? error.message : String(error)));
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
      requireAuth: true,
      requireAdmin: true,
      requireBody: true,
    }
  );
});
