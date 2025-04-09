var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { queryOne } from "../_shared/postgres.ts";
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { modelId, instanceType = "g4dn.xlarge", minInstances = 1 } = body;
            if (!modelId) {
                return createErrorResponse("Missing required field: modelId", 400);
            }
            // Check if model is already deployed
            const existingModel = yield queryOne("SELECT * FROM private_ai_models WHERE model_id = $1", [modelId]);
            if (existingModel) {
                return createErrorResponse("Model is already deployed", 400);
            }
            // Create deployment record
            const deployment = yield queryOne(`INSERT INTO private_ai_models (
            model_id,
            instance_type,
            min_instances,
            status,
            deployed_by,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *`, [
                modelId,
                instanceType,
                minInstances,
                'deploying',
                user.id,
                new Date().toISOString(),
                new Date().toISOString()
            ]);
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
        }
        catch (error) {
            console.error("Error in private_ai_deploy:", error);
            return createErrorResponse(error.message);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
        requireAuth: true,
        requireAdmin: true,
        requireBody: true,
    });
}));
