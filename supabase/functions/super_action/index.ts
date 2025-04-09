import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { queryOne } from "../_shared/postgres.ts";

interface SuperActionRequest {
  action: string;
  params?: Record<string, unknown>;
}

interface SuperActionResponse {
  result: unknown;
  timestamp: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: SuperActionRequest) => {
      try {
        const { action, params } = body;

        if (!action) {
          return createErrorResponse("Action is required", 400);
        }

        // Log the action for audit purposes
        console.log(`Super action executed by user ${user.id}: ${action}`);

        // Handle different actions
        switch (action) {
          case "test_connection":
            return createSuccessResponse({
              result: "Connection successful",
              timestamp: new Date().toISOString(),
            });

          case "get_user_info":
            const userData = await queryOne<UserProfile>(
              "SELECT * FROM profiles WHERE id = $1",
              [user.id]
            );

            if (!userData) {
              throw new Error("User profile not found");
            }

            return createSuccessResponse({
              result: userData,
              timestamp: new Date().toISOString(),
            });

          default:
            return createErrorResponse(`Unknown action: ${action}`, 400);
        }
      } catch (error) {
        console.error("Error in super_action:", error);
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