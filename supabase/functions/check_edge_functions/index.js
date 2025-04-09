var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { handleRequest, createSuccessResponse, createErrorResponse, createAuthClient } from "../_shared/auth.ts";
// List of edge functions to check
const EDGE_FUNCTIONS = [
    "health-check",
    "chat",
    "chat_with_agent",
    "process_document",
    "update_user_usage",
    "test_fireworks_models",
    "subscription_webhook",
    "create_agent",
    "private_ai_deploy",
    "generate_api_key",
    "check_credentials",
    "team_invite",
    "stripe-webhook",
    "super-action",
];
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const supabase = createAuthClient(req);
            const timestamp = new Date().toISOString();
            const functionStatuses = [];
            // Check each edge function
            for (const functionName of EDGE_FUNCTIONS) {
                try {
                    const response = yield fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/${functionName}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
                        },
                        body: JSON.stringify({ check: true }),
                    });
                    functionStatuses.push({
                        name: functionName,
                        status: response.ok ? "healthy" : "unhealthy",
                        lastChecked: timestamp,
                        error: response.ok ? undefined : `Status: ${response.status}`,
                    });
                }
                catch (error) {
                    functionStatuses.push({
                        name: functionName,
                        status: "unhealthy",
                        lastChecked: timestamp,
                        error: error.message,
                    });
                }
            }
            return createSuccessResponse({
                timestamp,
                functions: functionStatuses,
            });
        }
        catch (error) {
            console.error("Error checking edge functions:", error);
            return createErrorResponse("Failed to check edge functions", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
    });
}));
