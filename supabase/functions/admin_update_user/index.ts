import { handleRequest, createSuccessResponse, createErrorResponse, createAuthClient } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";

// Augment query result with rows property
declare module "../_shared/postgres" {
  interface QueryResult<T> {
    rows: T[];
    rowCount: number;
  }
}


interface UpdateUserRequest {
  userId: string;
  role?: string;
  subscription_status?: string;
  subscription_tier?: string;
  subscription_end_date?: string | null;
}

interface UserProfile {
  id: string;
  email: string;
  role: string;
  subscription_status: string | null;
  subscription_tier: string | null;
  subscription_end_date: string | null;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, { userId, role, subscription_status, subscription_tier, subscription_end_date }: UpdateUserRequest) => {
      try {
        // Check if user is admin
        const { rows } = await query<{ role: string }>(
          "SELECT role FROM profiles WHERE id = $1",
          [user.id]
        );

        if (!rows[0] || rows[0].role !== "admin") {
          return createErrorResponse("Unauthorized: Admin access required", 403);
        }

        if (!userId) {
          return createErrorResponse("User ID is required", 400);
        }

        // Build update query dynamically based on provided fields
        const updates: string[] = [];
        const values: (string | null)[] = [userId];
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
        const { rows: profiles } = await query<UserProfile>(`
          UPDATE profiles
          SET ${updates.join(", ")}
          WHERE id = $1
          RETURNING id, email, role, subscription_status, subscription_tier, subscription_end_date
        `, values);

        if (!profiles[0]) {
          return createErrorResponse("User not found", 404);
        }

        return createSuccessResponse({ user: profiles[0] });

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
    }
  );
}); 