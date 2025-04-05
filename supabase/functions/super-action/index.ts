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
  getBedrockUsageStats,
  verifyAwsCredentials,
  listAvailableFoundationModels
} from "./aws.ts";

// Import AWS SDK directly for credential testing
import {
  BedrockClient,
  ListFoundationModelsCommand
} from "@aws-sdk/client-bedrock";

// Import configuration
import { CONFIG, validateConfig } from "./config.ts";

// Import AWS test module
import { runAwsBedrockTests } from "./aws-test.ts";

// CORS headers for all responses
const CORS_HEADERS = CONFIG.CORS_HEADERS;

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
            secretKeyLength: CONFIG.AWS_SECRET_ACCESS_KEY ? CONFIG.AWS_SECRET_ACCESS_KEY.length : 0,
            accessKeyLength: CONFIG.AWS_ACCESS_KEY_ID ? CONFIG.AWS_ACCESS_KEY_ID.length : 0,
            accessKeyStart: CONFIG.AWS_ACCESS_KEY_ID ? CONFIG.AWS_ACCESS_KEY_ID.substring(0, 4) : "",
            configValid: awsConfig.isValid,
            missingVars: awsConfig.missingVars,
            formatErrors: awsConfig.formatErrors
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
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined 
      }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

// Handle AWS diagnostics endpoint
async function handleAwsDiagnostics(request: Request): Promise<Response> {
  // Validate JWT token
  const { user, error } = await validateJwtToken(request);
  
  if (error) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: error }),
      { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    // Return AWS diagnostic information
    const awsKeys = {
      region: CONFIG.AWS_REGION,
      accessKeyId: CONFIG.AWS_ACCESS_KEY_ID ? `${CONFIG.AWS_ACCESS_KEY_ID.substring(0, 4)}...${CONFIG.AWS_ACCESS_KEY_ID.slice(-4)}` : 'missing',
      secretKeyPresent: Boolean(CONFIG.AWS_SECRET_ACCESS_KEY),
      secretKeyLength: CONFIG.AWS_SECRET_ACCESS_KEY ? CONFIG.AWS_SECRET_ACCESS_KEY.length : 0
    };
    
    console.log("[API] AWS diagnostics requested, keys info:", awsKeys);
    
    // Test AWS connectivity with a simple call
    console.log("[API] Testing AWS connectivity...");
    try {
      const listResult = await listProvisionedModelThroughputs();
      return new Response(
        JSON.stringify({
          diagnostics: {
            aws: awsKeys,
            connectionTest: {
              success: listResult.success,
              error: listResult.error || null,
              modelsCount: listResult.instances?.length || 0
            }
          }
        }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("[API] AWS connectivity test failed:", error);
      return new Response(
        JSON.stringify({
          diagnostics: {
            aws: awsKeys,
            connectionTest: {
              success: false,
              error: error instanceof Error ? error.message : String(error)
            }
          }
        }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error handling AWS diagnostics request:", error);
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
    // Parse request data
    let requestBody;
    try {
      requestBody = await request.json();
      console.log("[API] Raw request body:", JSON.stringify(requestBody));
    } catch (e) {
      console.error("[API] Error parsing request JSON:", e);
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Invalid JSON in request body" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    
    // Extract the data payload - could be directly in requestBody or in requestBody.data
    const requestData = requestBody.data || requestBody;
    console.log("[API] Extracted request data:", JSON.stringify(requestData));
    
    const { modelId, commitmentDuration, modelUnits } = requestData;
    
    // Validate required fields
    if (!modelId) {
      console.error("[API] Missing modelId in request:", requestData);
      return new Response(
        JSON.stringify({ 
          error: "Missing required field", 
          message: "modelId is required",
          receivedData: requestData
        }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    
    if (!commitmentDuration) {
      return new Response(
        JSON.stringify({ error: "Missing required field", message: "commitmentDuration is required" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    
    if (!modelUnits || modelUnits <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid field", message: "modelUnits must be a positive number" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Log the request for debugging
    console.log("[API] Create instance request:", {
      modelId,
      commitmentDuration,
      modelUnits,
      userId: user.id
    });

    // Verify AWS credentials are present and valid
    console.log("[API] Verifying AWS credentials before proceeding");
    const credentialCheck = await verifyAwsCredentials();
    if (!credentialCheck.success) {
      console.error("[API] AWS credentials verification failed:", credentialCheck.message, credentialCheck);
      return new Response(
        JSON.stringify({ 
          error: "AWS Configuration Error", 
          message: credentialCheck.message || "AWS credentials are not properly configured",
          details: credentialCheck
        }),
        { status: 503, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    console.log("[API] AWS credentials verified successfully:", credentialCheck);

    // Call AWS Bedrock API to create provisioned model throughput
    console.log("[API] Calling AWS Bedrock to create model throughput with params:", {
      modelId,
      commitmentDuration,
      modelUnits
    });
    
    try {
      const awsResponse = await createProvisionedModelThroughput({
        modelId,
        commitmentDuration,
        modelUnits
      });
      
      if (!awsResponse.success) {
        console.error("[API] AWS API call failed:", awsResponse.error, awsResponse);
        return new Response(
          JSON.stringify({
            error: "AWS API Error",
            message: awsResponse.error || "Failed to create instance in AWS Bedrock",
            details: awsResponse
          }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }
      
      // Extract instance ID from the AWS response
      const instanceId = awsResponse.instance_id || (awsResponse.instance && awsResponse.instance.provisionedModelArn);
      
      // Check if we have a valid instance ID
      if (!instanceId) {
        console.error("[API] No instance ID returned from AWS:", awsResponse);
        return new Response(
          JSON.stringify({ 
            error: "AWS API Error", 
            message: "AWS did not return a valid instance ID",
            aws_response: awsResponse
          }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }
      
      console.log(`[API] Created AWS Bedrock instance: ${instanceId}`);
      
      // Store in Supabase for user association
      try {
        const { data: dbInstance, error: dbError } = await supabaseClient
          .from('bedrock_instances')
          .insert({
            instance_id: instanceId,
            model_id: modelId,
            commitment_duration: commitmentDuration,
            model_units: modelUnits,
            status: "CREATING", // Initial status
            created_at: new Date().toISOString(),
            user_id: user.id
          })
          .select()
          .single();
          
        if (dbError) {
          console.error("[API] Database error:", dbError);
          return new Response(
            JSON.stringify({ 
              error: "Database Error", 
              message: dbError.message,
              aws_instance: awsResponse.instance,
              instance_id: instanceId
            }),
            { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        }
        
        // Return the combined data
        return new Response(
          JSON.stringify({ 
            instance: {
              id: dbInstance.id,
              instance_id: instanceId,
              model_id: modelId,
              status: "CREATING",
              model_units: modelUnits,
              commitment_duration: commitmentDuration,
              created_at: dbInstance.created_at,
              user_id: user.id
            },
            aws_response: awsResponse.instance 
          }),
          { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      } catch (dbException) {
        console.error("[API] Database exception:", dbException);
        return new Response(
          JSON.stringify({ 
            error: "Database Exception", 
            message: dbException instanceof Error ? dbException.message : String(dbException),
            aws_instance: awsResponse.instance,
            instance_id: instanceId
          }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }
    } catch (awsException) {
      console.error("[API] AWS Exception:", awsException);
      return new Response(
        JSON.stringify({
          error: "AWS Exception",
          message: awsException instanceof Error ? awsException.message : String(awsException),
          stack: awsException instanceof Error ? awsException.stack : undefined
        }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("[API] General error creating instance:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal Error", 
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
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

// Get a specific Bedrock model throughput instance
async function handleGetInstance(request: Request): Promise<Response> {
  // Implementation for getting a specific instance
  // Validate JWT token
  const { user, error } = await validateJwtToken(request);
  
  if (error) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: error }),
      { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    // Get the instance ID from the request
    let instanceId;
    try {
      const body = await request.json();
      instanceId = body.instanceId || body.instance_id;
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Invalid JSON or missing instanceId" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (!instanceId) {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Missing instanceId parameter" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Get instance details from AWS
    const awsResponse = await getProvisionedModelThroughput(instanceId);
    
    if (!awsResponse.success) {
      throw new Error(awsResponse.error || "Failed to get instance from AWS Bedrock");
    }
    
    // Get instance metadata from database
    const { data: dbInstance, error: dbError } = await supabaseClient
      .from('bedrock_instances')
      .select('*')
      .eq('instance_id', instanceId)
      .eq('user_id', user.id)
      .single();
      
    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 is "not found" which is fine
      throw dbError;
    }
    
    // Combine AWS and DB data
    const instance = {
      id: dbInstance?.id || null,
      instance_id: instanceId,
      model_id: awsResponse.instance?.modelId || null,
      status: awsResponse.instance?.provisionedModelStatus || "UNKNOWN",
      model_units: awsResponse.instance?.provisionedThroughput?.provisionedModelThroughput || 0,
      commitment_duration: awsResponse.instance?.provisionedThroughput?.commitmentDuration || null,
      created_at: dbInstance?.created_at || awsResponse.instance?.creationTime || null,
      user_id: user.id
    };
    
    return new Response(
      JSON.stringify({ instance }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error getting instance details:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

// Handle AWS credential test
async function handleAwsCredentialTest(request: Request): Promise<Response> {
  // Validate JWT token
  const { user, error } = await validateJwtToken(request);
  
  if (error) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: error }),
      { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  console.log("[API] Running AWS credential test");
  
  try {
    // Step 1: Check if environment variables are set
    const credentialResults = {
      envVars: {
        AWS_REGION: {
          exists: Boolean(CONFIG.AWS_REGION),
          value: CONFIG.AWS_REGION
        },
        AWS_ACCESS_KEY_ID: {
          exists: Boolean(CONFIG.AWS_ACCESS_KEY_ID),
          format: CONFIG.AWS_ACCESS_KEY_ID.startsWith('AKIA') ? 'valid' : 'invalid',
          length: CONFIG.AWS_ACCESS_KEY_ID.length,
          prefix: CONFIG.AWS_ACCESS_KEY_ID.substring(0, 4)
        },
        AWS_SECRET_ACCESS_KEY: {
          exists: Boolean(CONFIG.AWS_SECRET_ACCESS_KEY),
          length: CONFIG.AWS_SECRET_ACCESS_KEY.length
        }
      },
      clientCreation: { 
        success: false, 
        error: null as string | null
      },
      apiRequest: { 
        success: false, 
        error: null as string | null, 
        result: null as { modelsCount: number; firstModelId: string | null } | null 
      }
    };
    
    // Step 2: Try to create the clients
    try {
      // First just create the client to see if it works
      const bedrockClient = new BedrockClient({
        region: CONFIG.AWS_REGION,
        credentials: {
          accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
          secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY
        }
      });
      
      credentialResults.clientCreation.success = true;
      
      // Step 3: Try a simple API call
      try {
        console.log("[API] Testing AWS SDK with ListFoundationModelsCommand");
        const command = new ListFoundationModelsCommand({});
        const result = await bedrockClient.send(command);
        
        credentialResults.apiRequest.success = true;
        credentialResults.apiRequest.result = {
          modelsCount: result.modelSummaries?.length || 0,
          firstModelId: result.modelSummaries?.[0]?.modelId || null
        };
      } catch (apiError) {
        console.error("[API] Error making AWS API call:", apiError);
        credentialResults.apiRequest.success = false;
        credentialResults.apiRequest.error = apiError instanceof Error ? apiError.message : String(apiError);
      }
    } catch (clientError) {
      console.error("[API] Error creating AWS client:", clientError);
      credentialResults.clientCreation.success = false;
      credentialResults.clientCreation.error = clientError instanceof Error ? clientError.message : String(clientError);
    }
    
    // Return diagnostic results
    return new Response(
      JSON.stringify({
        aws_credential_test: credentialResults,
        validation: validateConfig()
      }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[API] Unhandled error in AWS credential test:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined 
      }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

// Handle verify AWS credentials endpoint
async function handleVerifyAwsCredentials(request: Request): Promise<Response> {
  try {
    // Validate JWT token
    const { user, error } = await validateJwtToken(request);
    
    if (error) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: error }),
        { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    console.log("[API] Verifying AWS credentials");
    
    // Run the verification
    const result = await verifyAwsCredentials();
    
    return new Response(
      JSON.stringify({
        message: result.message,
        success: result.success,
        details: result.details,
        error: result.error
      }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[API] Error verifying AWS credentials:", error);
    return new Response(
      JSON.stringify({ 
        error: "AWS Verification Error", 
        message: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

// Handle AWS permission diagnostics
async function handleAwsPermissionsTest(request: Request): Promise<Response> {
  try {
    console.log("[API] Running AWS Bedrock permission diagnostic tests");
    
    // Run the AWS permission tests
    const testResults = await runAwsBedrockTests();
    
    console.log("[API] AWS permission tests completed");
    
    return new Response(
      JSON.stringify({ 
        success: true,
        test_results: testResults 
      }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[API] Error running AWS permission tests:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

// Handle listing all available foundation models
async function handleListFoundationModels(request: Request): Promise<Response> {
  // Validate JWT token
  const { user, error } = await validateJwtToken(request);
  
  if (error) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: error }),
      { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    // Call AWS to list all available foundation models
    console.log("[API] Listing all available foundation models");
    const awsResponse = await listAvailableFoundationModels();
    
    if (!awsResponse.success) {
      console.error("[API] Failed to list foundation models:", awsResponse.error);
      return new Response(
        JSON.stringify({
          error: "AWS API Error",
          message: awsResponse.error || "Failed to list foundation models from AWS Bedrock"
        }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    
    // Return the list of models
    return new Response(
      JSON.stringify({ models: awsResponse.models }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error listing foundation models:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

// Main request handler
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  
  let requestBody;
  let action = "";
  let data = {};
  
  try {
    // Parse JSON request body
    try {
      requestBody = await req.clone().json();
      console.log("[API] Received request body:", requestBody);
      
      // Extract action and data from the request body
      if (typeof requestBody === 'object') {
        action = requestBody.action || "";
        data = requestBody.data || {};
      }
    } catch (error) {
      console.error("[API] Error parsing request body:", error);
      return new Response(
        JSON.stringify({ error: "Invalid request body", message: "The request body could not be parsed as JSON" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    
    if (!action) {
      console.error("[API] Missing action in request:", requestBody);
      return new Response(
        JSON.stringify({ error: "Missing action", message: "No action specified in the request" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`[API] Processing action: ${action}, data:`, data);
    
    // EMERGENCY DEBUG CODE - With enhanced security
    if (action === "emergency-debug") {
      console.log("[API] Running emergency-debug endpoint - this should only be used for diagnostics by administrators");
      
      // Always validate the token for security - no unauthenticated access
      const { user, error } = await validateJwtToken(req);
      if (error) {
        console.log("[API] Unauthorized attempt to access emergency-debug endpoint");
        return new Response(
          JSON.stringify({ error: "Unauthorized", message: "Admin authentication required" }),
          { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }
      
      // Only proceed if user is authenticated
      try {
        // Load environment variables directly from Deno for debugging
        const accessKeyId = CONFIG.AWS_ACCESS_KEY_ID || "";
        const secretKey = CONFIG.AWS_SECRET_ACCESS_KEY || "";
        
        // Define the interface for the info object
        interface EnvDebugInfo {
          config: {
            aws_region: string;
            aws_access_key_id_full: string;
            aws_secret_access_key_parts: string;
            has_access_key: boolean;
            has_secret_key: boolean;
            access_key_valid_format: boolean;
            access_key_length: number;
            secret_key_length: number;
            potential_issues: {
              access_key_format: boolean;
              secret_key_too_short: boolean;
              missing_access_key: boolean;
              missing_secret_key: boolean;
            };
          };
          environment: {
            AWS_REGION: string;
            AWS_ACCESS_KEY_ID: string;
            AWS_SECRET_ACCESS_KEY: string;
            AWS_ACCESS_KEY_ID_LENGTH: number;
            AWS_SECRET_ACCESS_KEY_LENGTH: number;
          };
          validation: ReturnType<typeof validateConfig>;
          timestamps: {
            current: string;
            timezone: string;
          };
          api_test?: {
            success: boolean;
            models_count?: number;
            first_model?: string | null;
            error?: string;
            error_name?: string;
            stack?: string;
          };
        }
        
        // Safely format the keys - showing more details but still maintaining security
        const envInfo: EnvDebugInfo = {
          config: {
            aws_region: CONFIG.AWS_REGION,
            aws_access_key_id_full: accessKeyId ? 
              // Show first 4 chars and last 4 chars with * in between
              `${accessKeyId.substring(0, 4)}****${accessKeyId.length > 8 ? accessKeyId.slice(-4) : ''}` : 
              "<not-set>",
            aws_secret_access_key_parts: secretKey ? 
              // Show first 2 chars and last 4 chars with * in between
              `${secretKey.substring(0, 2)}****${secretKey.length > 6 ? secretKey.slice(-4) : ''}` : 
              "<not-set>",
            has_access_key: Boolean(accessKeyId),
            has_secret_key: Boolean(secretKey),
            access_key_valid_format: accessKeyId?.startsWith('AKIA') || false,
            access_key_length: accessKeyId?.length || 0,
            secret_key_length: secretKey?.length || 0,
            // Validate common issues with keys
            potential_issues: {
              access_key_format: !accessKeyId?.startsWith('AKIA') && accessKeyId?.length > 0,
              secret_key_too_short: secretKey?.length < 30 && secretKey?.length > 0,
              missing_access_key: !accessKeyId,
              missing_secret_key: !secretKey
            }
          },
          environment: {
            // @ts-ignore - Deno global
            AWS_REGION: Deno?.env?.get("AWS_REGION") || "<not-set-in-env>",
            // Only show partial key with masking
            // @ts-ignore - Deno global 
            AWS_ACCESS_KEY_ID: Deno?.env?.get("AWS_ACCESS_KEY_ID") ? 
              // @ts-ignore - Deno global - Show first 4 and last 4 characters with * between
              `${Deno.env.get("AWS_ACCESS_KEY_ID")?.substring(0, 4)}****${Deno.env.get("AWS_ACCESS_KEY_ID")?.slice(-4)}` : 
              "<not-set-in-env>",
            // @ts-ignore - Deno global - Show first 2 and last 4 characters with * between
            AWS_SECRET_ACCESS_KEY: Deno?.env?.get("AWS_SECRET_ACCESS_KEY") ?
              // @ts-ignore - Deno global
              `${Deno.env.get("AWS_SECRET_ACCESS_KEY")?.substring(0, 2)}****${Deno.env.get("AWS_SECRET_ACCESS_KEY")?.slice(-4)}` :
              "<not-set-in-env>",
            // @ts-ignore - Deno global
            AWS_ACCESS_KEY_ID_LENGTH: (Deno?.env?.get("AWS_ACCESS_KEY_ID") || "").length,
            // @ts-ignore - Deno global
            AWS_SECRET_ACCESS_KEY_LENGTH: (Deno?.env?.get("AWS_SECRET_ACCESS_KEY") || "").length,
          },
          validation: validateConfig(),
          timestamps: {
            current: new Date().toISOString(),
            timezone: "UTC"
          }
        };
        
        // Test AWS SDK connection
        try {
          const client = new BedrockClient({
            region: CONFIG.AWS_REGION,
            credentials: {
              accessKeyId: CONFIG.AWS_ACCESS_KEY_ID || "",
              secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY || ""
            }
          });
          
          const command = new ListFoundationModelsCommand({});
          const result = await client.send(command);
          
          // Add API test results to the response
          envInfo.api_test = {
            success: true,
            models_count: result.modelSummaries?.length || 0,
            first_model: result.modelSummaries && result.modelSummaries.length > 0 ? 
              result.modelSummaries[0].modelId : null
          };
        } catch (apiError) {
          // Include API errors in the response
          envInfo.api_test = {
            success: false,
            error: apiError instanceof Error ? apiError.message : String(apiError),
            error_name: apiError instanceof Error ? apiError.name : "Unknown",
            stack: apiError instanceof Error ? apiError.stack?.split("\n").slice(0, 3).join("\n") : undefined
          };
        }
        
        return new Response(
          JSON.stringify({
            message: "Emergency debug information (AWS credentials)",
            env: envInfo,
            user: {
              id: user.id, 
              email: user.email
            }
          }),
          { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("[EMERGENCY-DEBUG] Error:", error);
        return new Response(
          JSON.stringify({ 
            error: "Emergency Debug Error",
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined 
          }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Map legacy action names to new ones
    if (action === 'testEnvironment') {
      console.log(`[API] Mapping legacy action 'testEnvironment' to 'test'`);
      action = 'test';
    } else if (action === 'provisionInstance') {
      console.log(`[API] Mapping legacy action 'provisionInstance' to 'createInstance'`);
      action = 'createInstance';
    }
    
    try {
      // Validate AWS credentials before proceeding (EXCEPT for test endpoints)
      if (!['test', 'aws-diagnostics', 'aws-credential-test', 'emergency-debug', 'verify-aws-credentials'].includes(action)) {
        if (!CONFIG.AWS_ACCESS_KEY_ID || !CONFIG.AWS_SECRET_ACCESS_KEY) {
          console.error("[API] Missing AWS credentials:", { 
            hasAccessKey: Boolean(CONFIG.AWS_ACCESS_KEY_ID), 
            hasSecretKey: Boolean(CONFIG.AWS_SECRET_ACCESS_KEY),
            action: action
          });
          
          return new Response(
            JSON.stringify({ 
              error: "Service Misconfigured", 
              message: "AWS credentials are not properly configured. Contact your administrator." 
            }),
            { status: 503, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        }
      }
      
      // Route the request based on action
      console.log(`[API] Routing request to handler for action: ${action}`);
      switch (action) {
        case "test":
          return await handleTestEnv(req);
          
        case "aws-diagnostics":
          return await handleAwsDiagnostics(req);
          
        case "aws-credential-test":
          return await handleAwsCredentialTest(req);
          
        case "listInstances":
          return await handleGetInstances(req);
          
        case "createInstance":
          console.log(`[API] Handling createInstance action`);
          return await handleCreateInstance(req);
          
        case "deleteInstance":
          return await handleDeleteInstance(req);
          
        case "getInstance":
          return await handleGetInstance(req);
          
        case "invokeModel":
          return await handleInvokeModel(req);
          
        case "getUsageStats":
          return await handleGetUsageStats(req);
          
        case "verify-aws-credentials":
          return await handleVerifyAwsCredentials(req);
          
        case "aws-permission-test":
          console.log(`[API] Running AWS permission tests`);
          return await handleAwsPermissionsTest(req);
          
        case "listFoundationModels":
          return await handleListFoundationModels(req);
          
        default:
          console.log(`[API] Unknown action: ${action}`);
          return new Response(
            JSON.stringify({ 
              error: "Invalid action", 
              validActions: ["test", "aws-diagnostics", "aws-credential-test", "emergency-debug", "listInstances", "createInstance", "deleteInstance", "getInstance", "invokeModel", "getUsageStats", "verify-aws-credentials", "aws-permission-test", "listFoundationModels"],
              received: action
            }),
            { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
      }
    } catch (error) {
      // Handle AWS SDK specific errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let statusCode = 500;
      
      // More specific error handling based on AWS error patterns
      if (errorMessage.includes("The security token included in the request is invalid") || 
          errorMessage.includes("request signature we calculated does not match")) {
        errorMessage = "AWS authentication failed. The access credentials are invalid or expired.";
        statusCode = 401;
      } else if (errorMessage.includes("Missing Authentication Token")) {
        errorMessage = "AWS request is missing proper authentication. Check AWS configuration.";
        statusCode = 401;
      } else if (errorMessage.includes("AccessDenied") || errorMessage.includes("not authorized")) {
        errorMessage = "AWS access denied. The credentials don't have permission to perform this action.";
        statusCode = 403;
      }
      
      console.error(`[API] Error processing request for action ${action}:`, error);
      return new Response(
        JSON.stringify({ 
          error: "AWS API Error", 
          message: errorMessage,
          action: action
        }),
        { status: statusCode, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("[API] Error processing request:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal Error", 
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}); 