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
import { queryOne, execute } from "../_shared/postgres.ts";
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Check if user is admin
            const adminCheck = yield queryOne("SELECT role FROM profiles WHERE id = $1", [user.id]);
            if (!adminCheck || adminCheck.role !== "admin") {
                return createErrorResponse("Unauthorized: Admin access required", 403);
            }
            const { userId, email, role, isActive, subscriptionTier } = body;
            if (!userId) {
                return createErrorResponse("User ID is required", 400);
            }
            // Check if user exists
            const userExists = yield queryOne("SELECT id FROM profiles WHERE id = $1", [userId]);
            if (!userExists) {
                return createErrorResponse("User not found", 404);
            }
            // Build update fields
            const updates = [];
            const values = [];
            let valueIndex = 1;
            if (email !== undefined) {
                updates.push(`email = $${valueIndex++}`);
                values.push(email);
            }
            if (role !== undefined) {
                updates.push(`role = $${valueIndex++}`);
                values.push(role);
            }
            if (isActive !== undefined) {
                updates.push(`is_active = $${valueIndex++}`);
                values.push(isActive);
            }
            if (subscriptionTier !== undefined) {
                updates.push(`subscription_tier = $${valueIndex++}`);
                values.push(subscriptionTier);
            }
            if (updates.length === 0) {
                return createErrorResponse("No fields to update", 400);
            }
            // Add user ID and updated_at
            updates.push(`updated_at = $${valueIndex++}`);
            values.push(new Date().toISOString());
            values.push(userId);
            // Update the user profile
            yield execute(`UPDATE profiles 
           SET ${updates.join(", ")} 
           WHERE id = $${valueIndex}`, values);
            return createSuccessResponse({
                message: "User updated successfully",
                userId
            });
        }
        catch (error) {
            console.error("Error in admin_update_user:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
        requireBody: true,
    });
}));
