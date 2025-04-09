// Import with type assertion for Deno environment
// @ts-ignore - Module will be resolved by Deno's import system
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "./cors.ts";

// Type declarations for Deno runtime APIs
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  export const env: Env;
}

// Validate required environment variables
export function validateSecrets(requiredSecrets: string[]): { isValid: boolean; error?: string } {
  for (const secret of requiredSecrets) {
    if (!Deno.env.get(secret)) {
      return { isValid: false, error: `${secret} is not set` };
    }
  }
  return { isValid: true };
}

// Create an error response with proper CORS headers
export function createErrorResponse(message: string, status: number = 500): Response {
  return new Response(
    JSON.stringify({
      status: "error",
      message,
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Create a success response with proper CORS headers
export function createSuccessResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify({
      status: "ok",
      ...data,
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Create a Supabase client with auth context
export function createAuthClient(req: Request, adminAccess: boolean = false) {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  // For admin access, use the service role key with minimal options
  if (adminAccess) {
    return createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    );
  }

  // For regular access, create client with the anon key
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  return client;
}

// Verify authentication and return user
export async function verifyAuth(req: Request, adminRequired: boolean = false): Promise<{ user: any; error?: string }> {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return { user: null, error: "No authorization token provided" };
  }

  const supabaseClient = createAuthClient(req);
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

  if (authError || !user) {
    return { user: null, error: "Authentication failed" };
  }

  if (adminRequired && user.role !== "admin") {
    return { user: null, error: "Admin access required" };
  }

  return { user };
}

// Handle common request setup including CORS and auth
export async function handleRequest(
  req: Request,
  handler: (user: any, body: any) => Promise<Response>,
  options: {
    requiredSecrets?: string[];
    requireAuth?: boolean;
    requireAdmin?: boolean;
    requireBody?: boolean;
  } = {}
): Promise<Response> {
  const {
    requiredSecrets = ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
    requireAuth = true,
    requireAdmin = false,
    requireBody = true,
  } = options;

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Validate secrets first
  const secretsValidation = validateSecrets(requiredSecrets);
  if (!secretsValidation.isValid) {
    return createErrorResponse(secretsValidation.error!, 500);
  }

  // Verify authentication if required
  if (requireAuth) {
    const { user, error } = await verifyAuth(req, requireAdmin);
    if (error || !user) {
      return createErrorResponse(error || "Authentication failed", 401);
    }

    // Parse request body if required
    let body;
    if (requireBody) {
      try {
        body = await req.json();
      } catch (error) {
        return createErrorResponse("Invalid request body", 400);
      }
    }

    // Call the handler with authenticated user and parsed body
    try {
      return await handler(user, body);
    } catch (error: any) {
      console.error("Error in request handler:", error);
      return createErrorResponse(error?.message || "Unknown error occurred", 500);
    }
  }

  // If no auth required, just call the handler
  try {
    const body = requireBody ? await req.json() : undefined;
    return await handler(null, body);
  } catch (error: any) {
    console.error("Error in request handler:", error);
    return createErrorResponse(error?.message || "Unknown error occurred", 500);
  }
} 