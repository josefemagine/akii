import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { queryOne, execute } from "../_shared/postgres.ts";

interface AdminUpdateUserRequest {
  userId: string;
  email?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
  subscriptionTier?: string;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: AdminUpdateUserRequest) => {
      try {
        // Check if user is admin
        const adminCheck = await queryOne<{ role: string }>(
          "SELECT role FROM profiles WHERE id = $1",
          [user.id]
        );

        if (!adminCheck || adminCheck.role !== "admin") {
          return createErrorResponse("Unauthorized: Admin access required", 403);
        }

        const { userId, email, role, isActive, subscriptionTier } = body;

        if (!userId) {
          return createErrorResponse("User ID is required", 400);
        }

        // Check if user exists
        const userExists = await queryOne<{ id: string }>(
          "SELECT id FROM profiles WHERE id = $1",
          [userId]
        );

        if (!userExists) {
          return createErrorResponse("User not found", 404);
        }

        // Build update fields
        const updates: string[] = [];
        const values: any[] = [];
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
        await execute(
          `UPDATE profiles 
           SET ${updates.join(", ")} 
           WHERE id = $${valueIndex}`,
          values
        );

        return createSuccessResponse({ 
          message: "User updated successfully",
          userId
        });

      } catch (error) {
        console.error("Error in admin_update_user:", error);
        return createErrorResponse(
          error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "An unexpected error occurred",
          500
        );
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
      requireAuth: true,
      requireBody: true,
    }
  );
}); 