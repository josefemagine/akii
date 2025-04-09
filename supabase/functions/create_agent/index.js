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
            const { name, description, systemPrompt, isPublic = false } = body;
            if (!name || !description || !systemPrompt) {
                return createErrorResponse("Missing required fields: name, description, systemPrompt", 400);
            }
            // Create the agent
            const agent = yield queryOne(`INSERT INTO agents (
            name,
            description,
            system_prompt,
            is_public,
            created_by,
            is_active,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
          RETURNING *`, [name, description, systemPrompt, isPublic, user.id]);
            if (!agent) {
                throw new Error("Error creating agent");
            }
            return createSuccessResponse({
                message: "Agent created successfully",
                agent,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
            });
        }
        catch (error) {
            console.error("Error in create_agent:", error);
            return createErrorResponse(error.message);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
        requireAuth: true,
        requireAdmin: true,
        requireBody: true,
    });
}));
