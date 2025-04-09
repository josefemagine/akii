// This function checks if the Supabase credentials are properly configured
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
    // This is needed if you're planning to invoke your function from a browser
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
            },
        });
    }
    return handleRequest(req, () => __awaiter(void 0, void 0, void 0, function* () {
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
                const { rows } = yield query("SELECT 1");
                postgresConnection = rows.length > 0;
            }
            catch (error) {
                console.error("Error testing Postgres connection:", error);
            }
            return createSuccessResponse({
                supabase_url: url,
                supabase_service_key: !!supabaseServiceKey,
                supabase_anon_key: !!supabaseAnonKey,
                supabase_project_id: projectId || "",
                postgres_connection: postgresConnection,
            });
        }
        catch (error) {
            console.error("Error in check_credentials:", error);
            return createErrorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_SERVICE_KEY", "SUPABASE_ANON_KEY"],
        requireAuth: false,
    });
}));
