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
            const { agentId } = body;
            if (!agentId) {
                return createErrorResponse("Missing required field: agentId", 400);
            }
            // Get the agent
            const agent = yield queryOne("SELECT * FROM agents WHERE id = $1", [agentId]);
            if (!agent) {
                return createErrorResponse("Agent not found", 404);
            }
            // Check if agent is public or belongs to the user
            if (!agent.is_public && agent.created_by !== user.id && user.role !== "admin") {
                return createErrorResponse("Unauthorized to access this agent", 403);
            }
            return createSuccessResponse({
                agent,
            });
        }
        catch (error) {
            console.error("Unexpected error in get_agent:", error);
            return createErrorResponse("An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
        requireBody: true,
    });
}));
