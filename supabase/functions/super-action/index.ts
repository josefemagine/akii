// Supabase Edge Function for AWS Bedrock operations
// @ts-ignore - Deno-specific import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno-specific import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Import our AWS integration functions
// @ts-ignore - Deno-specific import
import {
  createProvisionedModelThroughput,
  listProvisionedModelThroughputs,
  getProvisionedModelThroughput,
  deleteProvisionedModelThroughput,
  invokeBedrockModel,
  getBedrockUsageStats
} from "./aws.ts";

// Import configuration
import { CONFIG, validateConfig } from "./config.ts";

// CORS headers for all responses
const CORS_HEADERS = CONFIG.CORS_HEADERS;

// Helper for environment variables
const getEnv = (name: string, defaultValue: string = ""): string => {
  // @ts-ignore - Deno.env access
  return Deno?.env?.get?.(name) || defaultValue;
};

// Environment setup
const AWS_REGION = getEnv("AWS_REGION", "us-east-1");
const AWS_ACCESS_KEY_ID = getEnv("AWS_ACCESS_KEY_ID");
const AWS_SECRET_ACCESS_KEY = getEnv("AWS_SECRET_ACCESS_KEY");
const SUPABASE_URL = getEnv("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");

// Initialize Supabase client
const supabaseClient = createClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_SERVICE_ROLE_KEY
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
    // Validate AWS configuration
    const awsConfig = validateConfig();
    
    // Return environment diagnostic information
    return new Response(
      JSON.stringify({
        environment: {
          // @ts-ignore - Deno global
          isProduction: Deno.env.get("DENO_ENV") !== "development",
          aws: {
            region: CONFIG.AWS_REGION,
            hasAccessKey: Boolean(CONFIG.AWS_ACCESS_KEY_ID),
            hasSecretKey: Boolean(CONFIG.AWS_SECRET_ACCESS_KEY),
            accessKeyFormat: CONFIG.AWS_ACCESS_KEY_ID ? (CONFIG.AWS_ACCESS_KEY_ID.startsWith("AKIA") ? "valid" : "invalid") : "missing",
            configValid: awsConfig.isValid,
            missingVars: awsConfig.missingVars
          },
          // @ts-ignore - Deno global
          platform: Deno.build.os,
          supabase: {
            hasUrl: Boolean(CONFIG.SUPABASE_URL),
            hasServiceKey: Boolean(CONFIG.SUPABASE_SERVICE_ROLE_KEY),
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
    // Call AWS Bedrock API to list instances
    const awsResponse = await listProvisionedModelThroughputs();
    
    if (!awsResponse.success) {
      throw new Error(awsResponse.error || "Failed to list instances from AWS Bedrock");
    }
    
    // Retrieve instances from Supabase for additional metadata
    const { data: dbInstances, error: dbError } = await supabaseClient
      .from('bedrock_instances')
      .select('*')
      .eq('user_id', user.id);

    if (dbError) throw dbError;
    
    // Merge AWS and database data
    // Create a map from the database instances
    const dbInstanceMap = new Map();
    (dbInstances || []).forEach(inst => {
      dbInstanceMap.set(inst.instance_id, inst);
    });
    
    // Map AWS instances to our format, merging with DB data
    const instances = (awsResponse.instances || []).map(awsInstance => {
      const instanceId = awsInstance.provisionedModelArn;
      const dbInstance = dbInstanceMap.get(instanceId);
      
      return {
        id: dbInstance?.id || null,
        instance_id: instanceId,
        model_id: awsInstance.modelId,
        status: awsInstance.provisionedModelStatus,
        model_units: awsInstance.provisionedThroughput?.provisionedModelThroughput || 0,
        commitment_duration: awsInstance.provisionedThroughput?.commitmentDuration || "1m",
        created_at: dbInstance?.created_at || new Date().toISOString(),
        user_id: user.id
      };
    });

    return new Response(
      JSON.stringify({ instances }),
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

// Create a Bedrock model throughput instance
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

    // Call AWS Bedrock API to create provisioned model throughput
    const awsResponse = await createProvisionedModelThroughput({
      modelId,
      commitmentDuration,
      modelUnits
    });
    
    if (!awsResponse.success) {
      throw new Error(awsResponse.error || "Failed to create instance in AWS Bedrock");
    }
    
    const instanceId = awsResponse.instance_id;
    console.log(`[API] Created AWS Bedrock instance: ${instanceId}`);
    
    try {
      // Store AWS data in Supabase with user_id
      const { data, error: dbError } = await supabaseClient
        .from('bedrock_instances')
        .insert({
          instance_id: instanceId,
          model_id: modelId,
          commitment_duration: commitmentDuration,
          model_units: modelUnits,
          status: 'CREATING', // Initial status
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
            details: dbError,
            aws_instance: awsResponse.instance
          }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          instance: data,
          info: "Created instance in AWS Bedrock and database",
          aws_instance: awsResponse.instance
        }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    } catch (dbException) {
      console.error("[API] Database exception:", dbException);
      return new Response(
        JSON.stringify({ 
          error: "Database Exception", 
          message: dbException instanceof Error ? dbException.message : String(dbException),
          aws_instance: awsResponse.instance
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

    // Call AWS Bedrock API to delete the provisioned model
    const awsResponse = await deleteProvisionedModelThroughput(instanceId);
    
    if (!awsResponse.success) {
      throw new Error(awsResponse.error || "Failed to delete instance from AWS Bedrock");
    }

    // Update status in Supabase 
    const { error: updateError } = await supabaseClient
      .from('bedrock_instances')
      .update({ status: 'DELETED', deleted_at: new Date().toISOString() })
      .eq('instance_id', instanceId)
      .eq('user_id', user.id);  // Ensure user can only delete their own instances

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true,
        aws_result: awsResponse.result
      }),
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

// Invoke a Bedrock model
async function handleInvokeModel(request: Request): Promise<Response> {
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
    
    // Extract the data payload
    const requestData = requestBody.data || requestBody;
    console.log("[API] Request data for invokeModel:", requestData);
    
    const { instance_id, prompt, max_tokens } = requestData;

    if (!instance_id || !prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required fields (instance_id or prompt)" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Verify ownership of the instance
    const { data: instance, error: fetchError } = await supabaseClient
      .from('bedrock_instances')
      .select('id, instance_id, model_id')
      .eq('instance_id', instance_id)
      .eq('user_id', user.id)
      .single();
      
    if (fetchError || !instance) {
      return new Response(
        JSON.stringify({ error: "Instance not found or not owned by user" }),
        { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Call AWS Bedrock API to invoke the model
    const invokeResponse = await invokeBedrockModel({
      instanceId: instance_id,
      prompt,
      maxTokens: max_tokens || 500
    });
    
    if (!invokeResponse.success) {
      throw new Error(invokeResponse.error || "Failed to invoke model");
    }

    // Record usage in database
    const { error: usageError } = await supabaseClient
      .from('bedrock_usage')
      .insert({
        instance_id: instance_id,
        user_id: user.id,
        input_tokens: invokeResponse.usage?.input_tokens || 0,
        output_tokens: invokeResponse.usage?.output_tokens || 0,
        total_tokens: invokeResponse.usage?.total_tokens || 0,
        created_at: new Date().toISOString()
      });

    if (usageError) {
      console.error("[API] Error recording usage:", usageError);
    }

    return new Response(
      JSON.stringify({
        response: invokeResponse.response,
        usage: invokeResponse.usage
      }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error invoking model:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

// Get usage statistics
async function handleGetUsageStats(request: Request): Promise<Response> {
  // Validate JWT token
  const { user, error } = await validateJwtToken(request);
  
  if (error) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: error }),
      { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    // Option to filter by instance ID
    let requestBody;
    let instanceId = null;
    
    // Try to get parameters from request body if present
    try {
      requestBody = await request.json();
      const data = requestBody.data || requestBody;
      instanceId = data.instance_id;
    } catch (e) {
      // Ignore parse errors - body is optional
    }
    
    // Get usage from database
    let query = supabaseClient
      .from('bedrock_usage')
      .select(`
        id,
        instance_id,
        input_tokens,
        output_tokens,
        total_tokens,
        created_at
      `)
      .eq('user_id', user.id);
      
    // Filter by instance if specified
    if (instanceId) {
      query = query.eq('instance_id', instanceId);
    }
    
    const { data: usageData, error: usageError } = await query;
    
    if (usageError) {
      throw usageError;
    }
    
    // Call AWS to get real-time usage statistics
    const awsUsageStats = await getBedrockUsageStats({ instanceId });
    
    // Combine DB usage data with AWS data
    const combinedUsage = {
      // Calculated from database records
      db_usage: {
        total_tokens: usageData.reduce((sum, item) => sum + (item.total_tokens || 0), 0),
        input_tokens: usageData.reduce((sum, item) => sum + (item.input_tokens || 0), 0),
        output_tokens: usageData.reduce((sum, item) => sum + (item.output_tokens || 0), 0),
        instance_breakdown: Object.values(usageData.reduce((acc, item) => {
          if (!acc[item.instance_id]) {
            acc[item.instance_id] = {
              instance_id: item.instance_id,
              total_tokens: 0,
              input_tokens: 0,
              output_tokens: 0
            };
          }
          acc[item.instance_id].total_tokens += item.total_tokens || 0;
          acc[item.instance_id].input_tokens += item.input_tokens || 0;
          acc[item.instance_id].output_tokens += item.output_tokens || 0;
          return acc;
        }, {}))
      },
      // From AWS
      aws_usage: awsUsageStats.success ? awsUsageStats.usage : null,
      aws_limits: awsUsageStats.success ? awsUsageStats.limits : null
    };

    return new Response(
      JSON.stringify({ usage: combinedUsage }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error getting usage stats:", error);
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
          case "invokeModel":
            return await handleInvokeModel(request);
          case "getUsageStats":
            return await handleGetUsageStats(request);
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

// Helper for checking AWS credentials
function checkAwsCredentials(): Response | null {
  if (!CONFIG.AWS_ACCESS_KEY_ID || !CONFIG.AWS_SECRET_ACCESS_KEY) {
    return new Response(
      JSON.stringify({ 
        error: "Service Misconfigured", 
        message: "AWS credentials are not configured on the server" 
      }),
      { status: 503, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
  return null;
} 