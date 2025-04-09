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
import { query } from "../_shared/postgres.ts";
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Get all private AI models
            const { rows: models } = yield query("SELECT * FROM private_ai_models ORDER BY created_at DESC");
            return createSuccessResponse({
                models,
            });
        }
        catch (error) {
            console.error("Error listing private AI models:", error);
            return createErrorResponse("Failed to list private AI models", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
        requireAdmin: true,
    });
}));
