// Supabase Edge Function for AWS Bedrock operations
// @ts-ignore - Deno-specific import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno-specific import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for all responses
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, X-Client-Info",
  "Access-Control-Allow-Credentials": "true"
};

// Environment setup
// @ts-ignore - Deno global
const AWS_ACCESS_KEY_ID = Deno.env.get("AWS_ACCESS_KEY_ID") || "";
// @ts-ignore - Deno global
const AWS_SECRET_ACCESS_KEY = Deno.env.get("AWS_SECRET_ACCESS_KEY") || "";
// @ts-ignore - Deno global
const AWS_REGION = Deno.env.get("AWS_REGION") || "us-east-1";
// @ts-ignore - Deno global
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
// @ts-ignore - Deno global
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Initialize Supabase client
const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

// JWT token validation
async function validateJwtToken(request: Request): Promise<{ user: any, error: string | null }> {
  // Get the Authorization header
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("[API] Missing or invalid Authorization header");
    return { user: null, error: "Missing or invalid Authorization header" };
  }
  
  // Extract token
  const token = authHeader.split(" ")[1];
  
  try {
    // Verify the JWT token using Supabase
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    
    if (error || !user) {
      console.log("[API] JWT verification failed:", error?.message);
      return { user: null, error: error?.message || "Invalid token" };
    }
    
    console.log("[API] JWT verification successful for user:", user.id);
    return { user, error: null };
  } catch (error) {
    console.error("[API] Error validating JWT:", error);
    return { user: null, error: "Error validating token" };
  }
}

// Handle diagnostics endpoint
async function handleTestEnv(request: Request): Promise<Response> {
  // Validate JWT token
  const { user, error } = await validateJwtToken(request);
  
  if (error) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: error }),
      { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    // Return environment diagnostic information
    return new Response(
      JSON.stringify({
        environment: {
          // @ts-ignore - Deno global
          isProduction: Deno.env.get("DENO_ENV") !== "development",
          aws: {
            region: AWS_REGION,
            hasAccessKey: Boolean(AWS_ACCESS_KEY_ID),
            hasSecretKey: Boolean(AWS_SECRET_ACCESS_KEY),
            accessKeyFormat: AWS_ACCESS_KEY_ID ? (AWS_ACCESS_KEY_ID.startsWith("AKIA") ? "valid" : "invalid") : "missing",
          },
          // @ts-ignore - Deno global
          platform: Deno.build.os,
          supabase: {
            hasUrl: Boolean(SUPABASE_URL),
            hasServiceKey: Boolean(SUPABASE_SERVICE_ROLE_KEY),
          },
          user: {
            id: user.id,
            email: user.email
          }
        }
      }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error handling test environment request:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

// Get all Bedrock model throughput instances
async function handleGetInstances(request: Request): Promise<Response> {
  // Validate JWT token
  const { user, error } = await validateJwtToken(request);
  
  if (error) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: error }),
      { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    // Get instances for the authenticated user only
    const { data, error: dbError } = await supabaseClient
      .from('bedrock_instances')
      .select('*')
      .eq('user_id', user.id);

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({ instances: data || [] }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error getting instances:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

// Create a mock Bedrock model throughput instance
async function handleCreateInstance(request: Request): Promise<Response> {
  // Validate JWT token
  const { user, error } = await validateJwtToken(request);
  
  if (error) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: error }),
      { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    // Get the request data
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (e) {
      console.error("[API] Error parsing request JSON:", e);
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Invalid JSON in request body" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    
    // Extract the data payload - could be directly in requestBody or in requestBody.data
    const requestData = requestBody.data || requestBody;
    console.log("[API] Request data for provisionInstance:", requestData);
    
    const { modelId, commitmentDuration, modelUnits } = requestData;

    if (!modelId || !commitmentDuration || !modelUnits) {
      return new Response(
        JSON.stringify({ 
          error: "Bad Request", 
          message: "Missing required fields (modelId, commitmentDuration, or modelUnits)",
          receivedData: requestData
        }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Create a mock instance ID
    const mockInstanceId = `arn:aws:bedrock:${AWS_REGION}:123456789012:provisioned-model/${modelId.split('/').pop()}-${Date.now()}`;
    
    try {
      // Store mock data in Supabase with user_id
      const { data, error: dbError } = await supabaseClient
        .from('bedrock_instances')
        .insert({
          instance_id: mockInstanceId,
          model_id: modelId,
          commitment_duration: commitmentDuration,
          model_units: modelUnits,
          status: 'CREATING',
          created_at: new Date().toISOString(),
          user_id: user.id  // Associate with the authenticated user
        })
        .select()
        .single();

      if (dbError) {
        console.error("[API] Database error creating instance:", dbError);
        return new Response(
          JSON.stringify({ 
            error: "Database Error", 
            message: dbError.message || "Failed to create instance in database",
            details: dbError
          }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          instance: data,
          info: "Created instance in database"
        }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    } catch (dbException) {
      console.error("[API] Unexpected database exception:", dbException);
      return new Response(
        JSON.stringify({ 
          error: "Database Exception", 
          message: dbException instanceof Error ? dbException.message : String(dbException)
        }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("[API] General error creating instance:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal Error", 
        message: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

// Delete a Bedrock model throughput instance
async function handleDeleteInstance(request: Request): Promise<Response> {
  // Validate JWT token
  const { user, error } = await validateJwtToken(request);
  
  if (error) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: error }),
      { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (e) {
      console.error("[API] Error parsing request JSON:", e);
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Invalid JSON in request body" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    
    // Extract the data payload - could be directly in requestBody or in requestBody.data
    const requestData = requestBody.data || requestBody;
    console.log("[API] Request data for deleteInstance:", requestData);
    
    const { instanceId } = requestData;

    if (!instanceId) {
      return new Response(
        JSON.stringify({ error: "Missing instanceId", receivedData: requestData }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Verify ownership of the instance
    const { data: instance, error: fetchError } = await supabaseClient
      .from('bedrock_instances')
      .select('id')
      .eq('instance_id', instanceId)
      .eq('user_id', user.id)
      .single();
      
    if (fetchError || !instance) {
      return new Response(
        JSON.stringify({ error: "Instance not found or not owned by user" }),
        { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Update status in Supabase 
    const { error: updateError } = await supabaseClient
      .from('bedrock_instances')
      .update({ status: 'DELETED', deleted_at: new Date().toISOString() })
      .eq('instance_id', instanceId)
      .eq('user_id', user.id);  // Ensure user can only delete their own instances

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting instance:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

// Handle OPTIONS requests for CORS
function handleOptionsRequest(request: Request): Response {
  return new Response(null, { 
    status: 204, // No content but successful
    headers: CORS_HEADERS
  });
}

// Main request handler
serve(async (request: Request) => {
  // Handle OPTIONS requests first (CORS preflight)
  if (request.method === "OPTIONS") {
    return handleOptionsRequest(request);
  }

  const url = new URL(request.url);
  
  try {
    console.log(`[super-action] Received ${request.method} request to ${url.pathname}`);
    
    // Clone the request for debugging
    const requestClone = request.clone();
    
    // For POST requests that use the action parameter
    if (request.method === "POST") {
      // Try to parse the request body with enhanced error handling
      let requestBody;
      let requestText;
      
      try {
        // First get the raw text for debugging
        requestText = await requestClone.text();
        console.log(`[super-action] Raw request body: ${requestText.substring(0, 200)}${requestText.length > 200 ? '...' : ''}`);
        
        // Now try to parse it
        try {
          requestBody = JSON.parse(requestText);
        } catch (jsonError) {
          console.error("[super-action] JSON parse error:", jsonError);
          return new Response(
            JSON.stringify({ 
              error: "Bad Request", 
              message: "Invalid JSON in request body",
              details: String(jsonError),
              receivedText: requestText.substring(0, 100) 
            }),
            { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        }
      } catch (error) {
        console.error("[super-action] Error reading request body:", error);
        return new Response(
          JSON.stringify({ 
            error: "Bad Request", 
            message: "Failed to read request body",
            details: String(error)
          }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      // Check if we have an action parameter
      const { action, data } = requestBody;
      
      if (!action) {
        return new Response(
          JSON.stringify({ error: "Missing required 'action' parameter" }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }
      
      console.log(`[super-action] Processing action: ${action}`, data);
      
      // Route based on action parameter
      try {
        switch (action) {
          case "testEnvironment":
            return await handleTestEnv(request);
          case "listInstances":
            return await handleGetInstances(request);
          case "provisionInstance":
            return await handleCreateInstance(request);
          case "deleteInstance":
            return await handleDeleteInstance(request);
          default:
            return new Response(
              JSON.stringify({ error: `Unknown action: ${action}` }),
              { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
            );
        }
      } catch (actionError) {
        console.error(`[super-action] Error processing ${action}:`, actionError);
        return new Response(
          JSON.stringify({ 
            error: "Action Processing Error", 
            message: actionError instanceof Error ? actionError.message : String(actionError),
            action: action
          }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Legacy routing based on URL path for backward compatibility
    if (url.pathname.endsWith("/test-env")) {
      return await handleTestEnv(request);
    } else if (url.pathname.endsWith("/instances") && request.method === "GET") {
      return await handleGetInstances(request);
    } else if (url.pathname.endsWith("/provision-instance") && request.method === "POST") {
      return await handleCreateInstance(request);
    } else if (url.pathname.endsWith("/delete-instance") && request.method === "DELETE") {
      return await handleDeleteInstance(request);
    }
    
    // Return 404 for unknown routes
    return new Response(
      JSON.stringify({ error: "Not Found", message: "Endpoint not found or method not allowed" }),
      { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unhandled error in request processing:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal Server Error", 
        message: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}); 