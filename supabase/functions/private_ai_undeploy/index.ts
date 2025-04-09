import serve from "https://deno.land/std@0.208.0/http/server.ts";
import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, execute } from "../_shared/postgres.ts";

interface UndeployRequest {
  modelId: string;
}

interface UndeployResponse {
  message: string;
  model_id: string;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: UndeployRequest) => {
      try {
        const { modelId } = body;
        if (!modelId) {
          return createErrorResponse("Missing required field: modelId", 400);
        }

        // Check if model exists
        const { rows: [existingModel] } = await query(
          "SELECT * FROM private_ai_models WHERE model_id = $1",
          [modelId]
        );

        if (!existingModel) {
          return createErrorResponse("Model not found", 404);
        }

        // Update model status to 'undeploying'
        await execute(
          "UPDATE private_ai_models SET status = $1, updated_at = $2 WHERE model_id = $3",
          ['undeploying', new Date().toISOString(), modelId]
        );

        // TODO: Trigger actual undeployment process here
        // This would typically involve calling your cloud provider's API
        // to stop the deployment process

        return createSuccessResponse({
          message: "Model undeployment initiated",
          model_id: modelId,
        });
      } catch (error) {
        console.error("Error in private_ai_undeploy:", error);
        return createErrorResponse(error.message);
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