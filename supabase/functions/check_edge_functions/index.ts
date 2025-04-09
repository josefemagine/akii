import { handleRequest, createSuccessResponse, createErrorResponse, createAuthClient } from "../_shared/auth.ts";

interface EdgeFunctionStatus {
  name: string;
  status: "healthy" | "unhealthy" | "unknown";
  lastChecked: string;
  error?: string;
}

interface EdgeFunctionsCheckResponse {
  timestamp: string;
  functions: EdgeFunctionStatus[];
}

// List of edge functions to check
const EDGE_FUNCTIONS = [
  "health-check",
  "chat",
  "chat_with_agent",
  "process_document",
  "update_user_usage",
  "test_fireworks_models",
  "subscription_webhook",
  "create_agent",
  "private_ai_deploy",
  "generate_api_key",
  "check_credentials",
  "team_invite",
  "stripe-webhook",
  "super-action",
] as const;

Deno.serve(async (req) => {
  return handleRequest(
    req,
    async () => {
      try {
        const supabase = createAuthClient(req);
        const timestamp = new Date().toISOString();
        const functionStatuses: EdgeFunctionStatus[] = [];

        // Check each edge function
        for (const functionName of EDGE_FUNCTIONS) {
          try {
            const response = await fetch(
              `${Deno.env.get("SUPABASE_URL")}/functions/v1/${functionName}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
                },
                body: JSON.stringify({ check: true }),
              }
            );

            functionStatuses.push({
              name: functionName,
              status: response.ok ? "healthy" : "unhealthy",
              lastChecked: timestamp,
              error: response.ok ? undefined : `Status: ${response.status}`,
            });
          } catch (error) {
            functionStatuses.push({
              name: functionName,
              status: "unhealthy",
              lastChecked: timestamp,
              error: error.message,
            });
          }
        }

        return createSuccessResponse({
          timestamp,
          functions: functionStatuses,
        });
      } catch (error) {
        console.error("Error checking edge functions:", error);
        return createErrorResponse("Failed to check edge functions", 500);
      }
    },
    {
      requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
      requireAuth: true,
    }
  );
}); 