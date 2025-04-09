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
            const { agentId, name, description, systemPrompt, isPublic, isActive } = body;
            if (!agentId) {
                return createErrorResponse("Missing required field: agentId", 400);
            }
            // Check if agent exists and belongs to the user
            const agent = yield queryOne("SELECT id, created_by FROM agents WHERE id = $1", [agentId]);
            if (!agent) {
                return createErrorResponse("Agent not found", 404);
            }
            // Check if user is the creator or has admin role
            if (agent.created_by !== user.id && user.role !== "admin") {
                return createErrorResponse("Unauthorized to update this agent", 403);
            }
            // Prepare update data
            const updateData = {
                updated_at: new Date().toISOString(),
            };
            if (name !== undefined)
                updateData.name = name;
            if (description !== undefined)
                updateData.description = description;
            if (systemPrompt !== undefined)
                updateData.system_prompt = systemPrompt;
            if (isPublic !== undefined)
                updateData.is_public = isPublic;
            if (isActive !== undefined)
                updateData.is_active = isActive;
            // Build the update query
            const setClauses = Object.entries(updateData)
                .map(([key, value], index) => `${key} = $${index + 2}`)
                .join(", ");
            const values = [agentId, ...Object.values(updateData)];
            // Update the agent
            const updatedAgent = yield queryOne(`UPDATE agents 
           SET ${setClauses}
           WHERE id = $1
           RETURNING *`, values);
            return createSuccessResponse({
                message: "Agent updated successfully",
                agent: updatedAgent,
            });
        }
        catch (error) {
            console.error("Unexpected error in update_agent:", error);
            return createErrorResponse("An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
        requireBody: true,
    });
}));
