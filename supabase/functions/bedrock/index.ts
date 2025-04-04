// Supabase Edge Function for AWS Bedrock operations
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for all responses
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

// Environment setup
const AWS_ACCESS_KEY_ID = Deno.env.get("AWS_ACCESS_KEY_ID") || "";
const AWS_SECRET_ACCESS_KEY = Deno.env.get("AWS_SECRET_ACCESS_KEY") || "";
const AWS_REGION = Deno.env.get("AWS_REGION") || "us-east-1";
const BEDROCK_API_KEY = Deno.env.get("BEDROCK_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Initialize Supabase client
const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

// API key validation
function isValidApiKey(request: Request): boolean {
  // Check for API key in x-api-key or authorization header
  const apiKey = request.headers.get("x-api-key") || request.headers.get("authorization");
  
  // Allow access in development with no key
  if (Deno.env.get("DENO_ENV") === "development" && !BEDROCK_API_KEY) {
    console.log("[API] Development mode, skipping API key validation");
    return true;
  }
  
  if (!apiKey) {
    console.log("[API] Missing API key in headers");
    return false;
  }
  
  // Extract token from "Bearer token" format if present
  const token = apiKey.startsWith("Bearer ") ? apiKey.slice(7) : apiKey;
  
  if (token !== BEDROCK_API_KEY) {
    console.log("[API] Invalid API key provided");
    return false;
  }
  
  return true;
}

// Handle diagnostics endpoint
async function handleTestEnv(request: Request): Promise<Response> {
  // Check API key
  if (!isValidApiKey(request)) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    // Return environment diagnostic information
    return new Response(
      JSON.stringify({
        environment: {
          isProduction: Deno.env.get("DENO_ENV") !== "development",
          aws: {
            region: AWS_REGION,
            hasAccessKey: Boolean(AWS_ACCESS_KEY_ID),
            hasSecretKey: Boolean(AWS_SECRET_ACCESS_KEY),
            accessKeyFormat: AWS_ACCESS_KEY_ID ? (AWS_ACCESS_KEY_ID.startsWith("AKIA") ? "valid" : "invalid") : "missing",
          },
          platform: Deno.build.os,
          supabase: {
            hasUrl: Boolean(SUPABASE_URL),
            hasServiceKey: Boolean(SUPABASE_SERVICE_ROLE_KEY),
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
  // Check API key
  if (!isValidApiKey(request)) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    const { data, error } = await supabaseClient
      .from('bedrock_instances')
      .select('*');

    if (error) throw error;

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
  // Check API key
  if (!isValidApiKey(request)) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    const requestData = await request.json();
    const { modelId, commitmentDuration, modelUnits } = requestData;

    if (!modelId || !commitmentDuration || !modelUnits) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Create a mock instance ID
    const mockInstanceId = `arn:aws:bedrock:${AWS_REGION}:123456789012:provisioned-model/${modelId.split('/').pop()}-${Date.now()}`;
    
    // Store mock data in Supabase
    const { data, error } = await supabaseClient
      .from('bedrock_instances')
      .insert({
        instance_id: mockInstanceId,
        model_id: modelId,
        commitment_duration: commitmentDuration,
        model_units: modelUnits,
        status: 'CREATING',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        instance: data,
        info: "Created instance in database"
      }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating instance:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

// Delete a Bedrock model throughput instance
async function handleDeleteInstance(request: Request): Promise<Response> {
  // Check API key
  if (!isValidApiKey(request)) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    const requestData = await request.json();
    const { instanceId } = requestData;

    if (!instanceId) {
      return new Response(
        JSON.stringify({ error: "Missing instanceId" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Update status in Supabase 
    const { error } = await supabaseClient
      .from('bedrock_instances')
      .update({ status: 'DELETED', deleted_at: new Date().toISOString() })
      .eq('instance_id', instanceId);

    if (error) throw error;

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
    headers: CORS_HEADERS
  });
}

// Main request handler
serve(async (request: Request) => {
  const url = new URL(request.url);
  
  // Handle OPTIONS requests (CORS preflight)
  if (request.method === "OPTIONS") {
    return handleOptionsRequest(request);
  }
  
  // Route requests based on path and method
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
    JSON.stringify({ error: "Not Found" }),
    { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
  );
}); 