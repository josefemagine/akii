import serve from "https://deno.land/std@0.208.0/http/server.ts";
import { handleRequest, createSuccessResponse, createErrorResponse, createAuthClient } from "../_shared/auth.ts";
import { query, queryOne, execute } from "../_shared/postgres.ts";

interface PrivateAIModel {
  model_id: string;
  instance_type: string;
  min_instances: number;
  status: string;
  deployed_by: string;
  created_at: string;
  updated_at: string;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body) => {
      try {
        const { modelId, instanceType = "g4dn.xlarge", minInstances = 1 } = body;
        if (!modelId) {
          return createErrorResponse("Missing required field: modelId", 400);
        }

        // Check if model is already deployed
        const existingModel = await queryOne<PrivateAIModel>(
          "SELECT * FROM private_ai_models WHERE model_id = $1",
          [modelId]
        );

        if (existingModel) {
          return createErrorResponse("Model is already deployed", 400);
        }

        // Create deployment record
        const deployment = await queryOne<PrivateAIModel>(
          `INSERT INTO private_ai_models (
            model_id,
            instance_type,
            min_instances,
            status,
            deployed_by,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *`,
          [
            modelId,
            instanceType,
            minInstances,
            'deploying',
            user.id,
            new Date().toISOString(),
            new Date().toISOString()
          ]
        );

        // TODO: Trigger actual deployment process here
        // This would typically involve calling your cloud provider's API
        // to start the deployment process

        return createSuccessResponse({
          message: "Model deployment initiated",
          deployment,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        });
      } catch (error) {
        console.error("Error in private_ai_deploy:", error);
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
