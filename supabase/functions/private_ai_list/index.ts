import serve from "https://deno.land/std@0.208.0/http/server.ts";
import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";

interface PrivateAIModel {
  model_id: string;
  instance_type: string;
  min_instances: number;
  status: string;
  deployed_by: string;
  created_at: string;
  updated_at: string;
}

interface ListResponse {
  models: PrivateAIModel[];
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user) => {
      try {
        // Get all private AI models
        const { rows: models } = await query<PrivateAIModel>(
          "SELECT * FROM private_ai_models ORDER BY created_at DESC"
        );

        return createSuccessResponse({
          models,
        });
      } catch (error) {
        console.error("Error listing private AI models:", error);
        return createErrorResponse("Failed to list private AI models", 500);
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
      requireAuth: true,
      requireAdmin: true,
    }
  );
}); 