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
import { query, execute } from "../_shared/postgres.ts";
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { modelId } = body;
            if (!modelId) {
                return createErrorResponse("Missing required field: modelId", 400);
            }
            // Check if model exists
            const { rows: [existingModel] } = yield query("SELECT * FROM private_ai_models WHERE model_id = $1", [modelId]);
            if (!existingModel) {
                return createErrorResponse("Model not found", 404);
            }
            // Update model status to 'undeploying'
            yield execute("UPDATE private_ai_models SET status = $1, updated_at = $2 WHERE model_id = $3", ['undeploying', new Date().toISOString(), modelId]);
            // TODO: Trigger actual undeployment process here
            // This would typically involve calling your cloud provider's API
            // to stop the deployment process
            return createSuccessResponse({
                message: "Model undeployment initiated",
                model_id: modelId,
            });
        }
        catch (error) {
            console.error("Error in private_ai_undeploy:", error);
            return createErrorResponse(error.message);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
        requireAuth: true,
        requireAdmin: true,
        requireBody: true,
    });
}));
