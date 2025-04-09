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
        var _a;
        try {
            const { page = 1, limit = 10, search, isPublic } = body;
            // Calculate offset for pagination
            const offset = (page - 1) * limit;
            // Build WHERE clause for the SQL query
            let whereClause = "";
            const queryParams = [];
            let paramCount = 0;
            // Add filter for public agents or agents created by the user
            if (isPublic !== undefined) {
                whereClause += `WHERE is_public = $${++paramCount}`;
                queryParams.push(isPublic);
            }
            else {
                whereClause += `WHERE (is_public = true OR created_by = $${++paramCount})`;
                queryParams.push(user.id);
            }
            // Add search filter if provided
            if (search) {
                whereClause += ` AND (name ILIKE $${++paramCount} OR description ILIKE $${++paramCount})`;
                queryParams.push(`%${search}%`, `%${search}%`);
            }
            // Get total count
            const countResult = yield query(`SELECT COUNT(*) as count FROM agents ${whereClause}`, queryParams);
            const total = ((_a = countResult.rows[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
            // Get agents with pagination
            const agentsResult = yield query(`SELECT * FROM agents ${whereClause} ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`, [...queryParams, limit, offset]);
            return createSuccessResponse({
                agents: agentsResult.rows,
                total: parseInt(total.toString()),
                page,
                limit,
            });
        }
        catch (error) {
            console.error("Unexpected error in list_agents:", error);
            return createErrorResponse("An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
    });
}));
