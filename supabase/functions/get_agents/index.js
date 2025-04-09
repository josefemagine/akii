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
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { includePublic = true, includeInactive = false } = body;
            // Build the query conditions
            const conditions = [];
            const params = [];
            let paramIndex = 1;
            // Only include active agents by default
            if (!includeInactive) {
                conditions.push(`is_active = true`);
            }
            // Include user's own agents and optionally public agents
            if (includePublic) {
                conditions.push(`(created_by = $${paramIndex} OR is_public = true)`);
            }
            else {
                conditions.push(`created_by = $${paramIndex}`);
            }
            params.push(user.id);
            // Build the final query
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
            const query_string = `
          SELECT * FROM agents
          ${whereClause}
          ORDER BY created_at DESC
        `;
            // Get the agents
            const { rows: agents } = yield query(query_string, params);
            return createSuccessResponse({
                agents,
                count: agents.length,
            });
        }
        catch (error) {
            console.error("Unexpected error in get_agents:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
        requireBody: false,
    });
}));
