// This function checks if the Supabase credentials are properly configured

import { handleRequest, createSuccessResponse, createErrorResponse, createAuthClient } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";

interface CredentialsCheckResponse {
  supabase_url: string;
  supabase_service_key: boolean;
  supabase_anon_key: boolean;
  supabase_project_id: string;
  postgres_connection: boolean;
}

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  return handleRequest(
    req,
    async () => {
      try {
        // Get required environment variables
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY");
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
        const supabaseProjectId = Deno.env.get("SUPABASE_PROJECT_ID");

        // Log environment variables for debugging
        console.log("SUPABASE_URL:", supabaseUrl ? "✅" : "❌");
        console.log("SUPABASE_SERVICE_KEY:", supabaseServiceKey ? "✅" : "❌");
        console.log("SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅" : "❌");
        console.log("SUPABASE_PROJECT_ID:", supabaseProjectId ? "✅" : "❌");

        // Extract project ID from URL if not provided directly
        let projectId = supabaseProjectId;
        if (!projectId && supabaseUrl) {
          const match = supabaseUrl.match(/https:\/\/([^.]+)\./);
          if (match) {
            projectId = match[1];
          }
        }

        // Construct Supabase URL if not available but project ID is known
        let url = supabaseUrl;
        if (!url && projectId) {
          url = `https://${projectId}.supabase.co`;
        }

        // Check if we have the required credentials
        if (!url || !supabaseServiceKey || !supabaseAnonKey) {
          return createErrorResponse("Missing required Supabase credentials", 400);
        }

        // Test Postgres connection
        let postgresConnection = false;
        try {
          const { rows } = await query("SELECT 1");
          postgresConnection = rows.length > 0;
        } catch (error) {
          console.error("Error testing Postgres connection:", error);
        }

        return createSuccessResponse({
          supabase_url: url,
          supabase_service_key: !!supabaseServiceKey,
          supabase_anon_key: !!supabaseAnonKey,
          supabase_project_id: projectId || "",
          postgres_connection: postgresConnection,
        });

      } catch (error) {
        console.error("Error in check_credentials:", error);
        return createErrorResponse(
          error instanceof Error ? error.message : "An unexpected error occurred",
          500
        );
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_SERVICE_KEY", "SUPABASE_ANON_KEY"],
      requireAuth: false,
    }
  );
});
