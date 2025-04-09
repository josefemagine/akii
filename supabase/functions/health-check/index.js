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
    return handleRequest(req, () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Check required secrets
            const requiredSecrets = ["SUPABASE_URL", "SUPABASE_ANON_KEY"];
            const missingSecrets = requiredSecrets.filter(secret => !Deno.env.get(secret));
            // Test Postgres connection
            let postgresStatus = { connected: false };
            try {
                yield query("SELECT 1");
                postgresStatus = { connected: true };
            }
            catch (error) {
                postgresStatus = {
                    connected: false,
                    error: error instanceof Error ? error.message : "Unknown error"
                };
            }
            const response = {
                status: "ok",
                postgres: postgresStatus,
                secrets: {
                    configured: missingSecrets.length === 0,
                    missing: missingSecrets.length > 0 ? missingSecrets : undefined
                }
            };
            return createSuccessResponse(response);
        }
        catch (error) {
            console.error("Error in health-check:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: false,
    });
}));
