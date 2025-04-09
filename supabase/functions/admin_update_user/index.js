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
    return handleRequest(req, (user_1, _a) => __awaiter(void 0, [user_1, _a], void 0, function* (user, { userId, role, subscription_status, subscription_tier, subscription_end_date }) {
        try {
            // Check if user is admin
            const { rows } = yield query("SELECT role FROM profiles WHERE id = $1", [user.id]);
            if (!rows[0] || rows[0].role !== "admin") {
                return createErrorResponse("Unauthorized: Admin access required", 403);
            }
            if (!userId) {
                return createErrorResponse("User ID is required", 400);
            }
            // Build update query dynamically based on provided fields
            const updates = [];
            const values = [userId];
            let paramIndex = 2;
            if (role !== undefined) {
                updates.push(`role = $${paramIndex}`);
                values.push(role);
                paramIndex++;
            }
            if (subscription_status !== undefined) {
                updates.push(`subscription_status = $${paramIndex}`);
                values.push(subscription_status);
                paramIndex++;
            }
            if (subscription_tier !== undefined) {
                updates.push(`subscription_tier = $${paramIndex}`);
                values.push(subscription_tier);
                paramIndex++;
            }
            if (subscription_end_date !== undefined) {
                updates.push(`subscription_end_date = $${paramIndex}`);
                values.push(subscription_end_date);
                paramIndex++;
            }
            if (updates.length === 0) {
                return createErrorResponse("No fields to update", 400);
            }
            // Update user profile
            const { rows: profiles } = yield query(`
          UPDATE profiles
          SET ${updates.join(", ")}
          WHERE id = $1
          RETURNING id, email, role, subscription_status, subscription_tier, subscription_end_date
        `, values);
            if (!profiles[0]) {
                return createErrorResponse("User not found", 404);
            }
            return createSuccessResponse({ user: profiles[0] });
        }
        catch (error) {
            console.error("Error in admin_update_user:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
    });
}));
