import { handleRequest, createSuccessResponse, createErrorResponse, createAuthClient } from "../_shared/auth.ts";
import { query } from "../_shared/postgres.ts";

interface HealthCheckResponse {
  status: string;
  postgres: {
    connected: boolean;
    error?: string;
  };
  secrets: {
    configured: boolean;
    missing?: string[];
  };
}

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async () => {
      try {
        // Check required secrets
        const requiredSecrets = ["SUPABASE_URL", "SUPABASE_ANON_KEY"];
        const missingSecrets = requiredSecrets.filter(secret => !Deno.env.get(secret));
        
        // Test Postgres connection
        let postgresStatus: HealthCheckResponse["postgres"] = { connected: false };
        try {
          await query("SELECT 1");
          postgresStatus = { connected: true };
        } catch (error) {
          postgresStatus = { 
            connected: false, 
            error: error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Unknown error" 
          };
        }

        const response: HealthCheckResponse = {
          status: "ok",
          postgres: postgresStatus,
          secrets: {
            configured: missingSecrets.length === 0,
            missing: missingSecrets.length > 0 ? missingSecrets : undefined
          }
        };

        return createSuccessResponse(response);

      } catch (error) {
        console.error("Error in health-check:", error);
        return createErrorResponse(
          error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "An unexpected error occurred",
          500
        );
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
      requireAuth: false,
    }
  );
}); 