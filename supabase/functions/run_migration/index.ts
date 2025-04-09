import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { execute } from "../_shared/postgres.ts";

interface MigrationRequest {
  sql: string;
  projectId?: string;
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async (user, body: MigrationRequest) => {
      try {
        // Check if user is admin
        if (user.role !== "admin") {
          return createErrorResponse("Unauthorized: Admin access required", 403);
        }

        const { sql, projectId } = body;

        if (!sql) {
          return createErrorResponse("SQL query is required", 400);
        }

        // Get environment variables with fallbacks
        const supabaseProjectId =
          projectId ||
          Deno.env.get("SUPABASE_PROJECT_ID") ||
          "injxxchotrvgvvzelhvj";
        const supabaseUrl =
          Deno.env.get("SUPABASE_URL") ||
          `https://${supabaseProjectId}.supabase.co`;

        // Log what we're using
        console.log(`Using Supabase URL: ${supabaseUrl}`);
        console.log(`Using Project ID: ${supabaseProjectId}`);

        try {
          // Execute the SQL query using the postgres utilities
          const result = await execute(sql, []);
          
          return createSuccessResponse({
            data: result,
          });
        } catch (sqlError) {
          console.error("Error executing SQL:", sqlError);
          return createErrorResponse(sqlError.message, 500);
        }
      } catch (error) {
        console.error("Unexpected error in run_migration:", error);
        return createErrorResponse("An unexpected error occurred", 500);
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_KEY"],
      requireAuth: true,
      requireAdmin: true,
      requireBody: true,
    }
  );
});
