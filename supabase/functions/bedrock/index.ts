// Add type declarations for Deno at the top of the file
// deno-lint-ignore-file no-explicit-any
// @ts-ignore - Deno types
/// <reference lib="deno.ns" />

// Supabase Edge Function for AWS Bedrock operations
// @ts-ignore - Deno-specific import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno-specific import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for all responses
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

    if (dbError) throw dbError;

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
  // Validate JWT token
  const { user, error } = await validateJwtToken(request);
  
  if (error) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: error }),
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