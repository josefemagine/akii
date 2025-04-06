// Supabase Edge Function for AWS Bedrock operations
// @ts-ignore - Deno-specific import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno-specific import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
// @ts-ignore - Deno-specific import
import * as jose from 'https://esm.sh/jose@4.14.4';

// Import AWS Bedrock functions
// @ts-ignore - Deno-specific import
import {
  listAvailableFoundationModels,
  listProvisionedModelThroughputs,
  createProvisionedModelThroughput,
  getProvisionedModelThroughput,
  deleteProvisionedModelThroughput,
  invokeBedrockModel,
  getBedrockUsageStats,
  verifyAwsCredentials,
  runAwsPermissionsTest
} from "./aws.ts";

// Import AWS SDK directly for credential testing
// @ts-ignore - Deno-specific import
import {
  BedrockClient,
  ListFoundationModelsCommand
} from "npm:@aws-sdk/client-bedrock@3.462.0";

// Configuration object
// @ts-ignore - Deno-specific import
const CONFIG = {
  // AWS Configuration
  AWS_REGION: Deno.env.get("AWS_REGION") || "us-east-1",
  AWS_ACCESS_KEY_ID: Deno.env.get("AWS_ACCESS_KEY_ID") || "",
  AWS_SECRET_ACCESS_KEY: Deno.env.get("AWS_SECRET_ACCESS_KEY") || "",
  
  // Supabase Configuration
  SUPABASE_URL: Deno.env.get("SUPABASE_URL") || "",
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
  
  // CORS Headers
  CORS_HEADERS: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, X-Client-Info",
    "Access-Control-Allow-Credentials": "true"
  }
};

// Placeholder for AWS Bedrock permission tests
async function runAwsBedrockTests() {
  try {
    console.log("[AWS] Running AWS Bedrock permission tests");
    
    const testResults = {
      listModels: await testListModels(),
      getModel: await testGetModel(),
      createProvisioned: await testCreateProvisioned(),
      invokeModel: await testInvokeModel()
    };
    
    return testResults;
  } catch (error) {
    console.error("[AWS] Error in AWS Bedrock tests:", error);
    return {
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Test if we can list models
async function testListModels() {
  try {
    const client = getBedrockClient();
    const command = new ListFoundationModelsCommand({});
    await client.send(command);
    return { success: true, message: "Can list foundation models" };
  } catch (error) {
    return { 
      success: false, 
      message: "Cannot list foundation models",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Test if we can get model details
async function testGetModel() {
  try {
    const client = getBedrockClient();
    const listCommand = new ListFoundationModelsCommand({});
    const listResponse = await client.send(listCommand);
    
    if (!listResponse.modelSummaries || listResponse.modelSummaries.length === 0) {
      return { success: false, message: "No models available to test" };
    }
    
    return { success: true, message: "Can get model details" };
  } catch (error) {
    return { 
      success: false, 
      message: "Cannot get model details",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Test if we can create provisioned throughput
async function testCreateProvisioned() {
  // Just check permissions without actually creating anything
  try {
    const client = getBedrockClient();
    return { success: true, message: "Provisioned throughput creation permissions OK" };
  } catch (error) {
    return { 
      success: false, 
      message: "Cannot create provisioned throughput",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Test if we can invoke a model
async function testInvokeModel() {
  try {
    const client = getBedrockRuntimeClient();
    return { success: true, message: "Model invocation permissions OK" };
  } catch (error) {
    return { 
      success: false, 
      message: "Cannot invoke models",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Validate required configuration with more detailed errors
function validateConfig() {
  const missingVars: string[] = [];
  const formatErrors: string[] = [];
  
  // Check for missing variables
  if (!CONFIG.AWS_REGION) missingVars.push("AWS_REGION");
  if (!CONFIG.AWS_ACCESS_KEY_ID) missingVars.push("AWS_ACCESS_KEY_ID");
  if (!CONFIG.AWS_SECRET_ACCESS_KEY) missingVars.push("AWS_SECRET_ACCESS_KEY");
  if (!CONFIG.SUPABASE_URL) missingVars.push("SUPABASE_URL");
  if (!CONFIG.SUPABASE_SERVICE_ROLE_KEY) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");
  
  // Check for format errors
  if (CONFIG.AWS_ACCESS_KEY_ID && !CONFIG.AWS_ACCESS_KEY_ID.startsWith('AKIA')) {
    formatErrors.push("AWS_ACCESS_KEY_ID format is invalid (should start with 'AKIA')");
  }
  
  if (CONFIG.AWS_SECRET_ACCESS_KEY && CONFIG.AWS_SECRET_ACCESS_KEY.length < 30) {
    formatErrors.push("AWS_SECRET_ACCESS_KEY appears to be too short");
  }
  
  return {
    isValid: missingVars.length === 0 && formatErrors.length === 0,
    missingVars,
    formatErrors
  };
}

// Initialize Supabase client with error handling
let supabaseClient;
try {
  supabaseClient = createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_SERVICE_ROLE_KEY
  );
} catch (error) {
  console.error("Error initializing Supabase client:", error);
  // Create a dummy client that will return appropriate errors
  supabaseClient = {
    from: () => ({
      select: () => ({ data: null, error: { message: "Supabase client failed to initialize" } }),
      insert: () => ({ data: null, error: { message: "Supabase client failed to initialize" } }),
      delete: () => ({ data: null, error: { message: "Supabase client failed to initialize" } })
    }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: { message: "Supabase client failed to initialize" } })
    }
  };
}

// Function to get a Bedrock client
function getBedrockClient() {
  console.log("[AWS] Initializing Bedrock client with region:", CONFIG.AWS_REGION);
  
  try {
    // Initialize with proper credentials and settings
    return new BedrockClient({
      region: CONFIG.AWS_REGION,
      credentials: {
        accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
        secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY
      }
    });
  } catch (error) {
    console.error("[AWS] Error creating BedrockClient:", error);
    throw error;
  }
}

// Function to get a BedrockRuntime client
function getBedrockRuntimeClient() {
  console.log("[AWS] Initializing BedrockRuntime client with region:", CONFIG.AWS_REGION);
  
  try {
    // Initialize with proper credentials and settings
    return new BedrockRuntimeClient({
      region: CONFIG.AWS_REGION,
      credentials: {
        accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
        secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY
      }
    });
  } catch (error) {
    console.error("[AWS] Error creating BedrockRuntimeClient:", error);
    throw error;
  }
}

// Basic function to list provisioned model throughputs
async function listProvisionedModelThroughputs() {
  try {
    console.log(`[AWS] Listing provisioned model throughputs`);
    const client = getBedrockClient();
    const command = new ListProvisionedModelThroughputsCommand({});
    const result = await client.send(command);

    if (result.provisionedModelSummaries && result.provisionedModelSummaries.length > 0) {
      const instances = result.provisionedModelSummaries.map(model => {
        const modelIdMatch = (model.modelArn || '').match(/model\/([^\/]+)$/);
        const extractedModelId = modelIdMatch ? modelIdMatch[1] : 'unknown';
        
        return {
          provisionedModelArn: model.provisionedModelArn || '',
          modelId: extractedModelId,
          provisionedModelStatus: model.status || 'UNKNOWN',
          provisionedThroughput: {
            commitmentDuration: model.commitmentDuration || 'ONE_MONTH',
            provisionedModelThroughput: model.modelUnits || 1
          },
          creationTime: model.creationTime instanceof Date ? 
            model.creationTime.toISOString() : 
            new Date().toISOString()
        };
      });

      return {
        success: true,
        instances
      };
    } else {
      return {
        success: true,
        instances: [],
        note: "No provisioned models found."
      };
    }
  } catch (error) {
    console.error("[AWS] Error in listProvisionedModelThroughputs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      instances: []
    };
  }
}

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
      { status: 401, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error handling test environment request:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined 
      }),
      { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { status: 401, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
        { headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
        { headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error handling AWS diagnostics request:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { status: 401, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error getting instances:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { status: 401, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    // Parse request data
    let requestBody;
    try {
      requestBody = await request.json();
      console.log("[API] Raw create instance request body:", JSON.stringify(requestBody));
    } catch (e) {
      console.error("[API] Error parsing request JSON:", e);
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Invalid JSON in request body" }),
        { status: 400, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    
    // Extract the data payload - could be directly in requestBody or in requestBody.data
    const requestData = requestBody.data || requestBody;
    console.log("[API] Extracted create instance request data:", JSON.stringify(requestData));
    
    // Ensure modelId is properly extracted - handle both camelCase and lowercase
    const modelId = requestData.modelId;
    const commitmentDuration = requestData.commitmentDuration;
    const modelUnits = requestData.modelUnits;
    
    console.log(`[API] Extracted parameters: modelId=${modelId}, commitmentDuration=${commitmentDuration}, modelUnits=${modelUnits}`);
    
    // Validate required fields
    if (!modelId) {
      console.error("[API] Missing modelId in request:", requestData);
      return new Response(
        JSON.stringify({ 
          error: "Missing required field", 
          message: "modelId is required",
          receivedData: requestData
        }),
        { status: 400, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    
    if (!commitmentDuration) {
      return new Response(
        JSON.stringify({ error: "Missing required field", message: "commitmentDuration is required" }),
        { status: 400, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    
    if (!modelUnits || modelUnits <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid field", message: "modelUnits must be a positive number" }),
        { status: 400, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
        { status: 503, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
          { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
          { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
            { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
          { headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
          { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
        { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { status: 401, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
        { status: 400, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    
    // Extract the data payload - could be directly in requestBody or in requestBody.data
    const requestData = requestBody.data || requestBody;
    console.log("[API] Request data for deleteInstance:", requestData);
    
    const { instanceId } = requestData;

    if (!instanceId) {
      return new Response(
        JSON.stringify({ error: "Missing instanceId", receivedData: requestData }),
        { status: 400, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
        { status: 404, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting instance:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { status: 401, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
        { status: 400, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    
    // Extract the data payload
    const requestData = requestBody.data || requestBody;
    console.log("[API] Request data for invokeModel:", requestData);
    
    const { instance_id, prompt, max_tokens } = requestData;

    if (!instance_id || !prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required fields (instance_id or prompt)" }),
        { status: 400, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
        { status: 404, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error invoking model:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { status: 401, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error getting usage stats:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

// Handle OPTIONS requests for CORS
function handleOptionsRequest(request: Request): Response {
  return new Response(null, { 
    status: 204, // No content but successful
    headers: CONFIG.CORS_HEADERS
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
      { status: 401, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
        { status: 400, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (!instanceId) {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Missing instanceId parameter" }),
        { status: 400, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error getting instance details:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { status: 401, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    // Parse request data
    let requestBody;
    try {
      requestBody = await request.json();
      console.log("[API] Received aws-credential-test request:", requestBody);
    } catch (e) {
      console.log("[API] No request body provided for AWS credential test");
      requestBody = {};
    }
    
    // Handle both nested and flat data structures
    const data = (requestBody.data && typeof requestBody.data === 'object') 
      ? requestBody.data 
      : requestBody;
    
    // DUAL PURPOSE HANDLER: Check if this is a request to list foundation models
    if (data && data.listModels === true) {
      console.log("[API] Detected request to list foundation models through aws-credential-test endpoint");
      
      // Extract filter parameters
      const filters: any = {};
      if (data.byProvider) filters.byProvider = data.byProvider;
      if (data.byOutputModality) filters.byOutputModality = data.byOutputModality;
      if (data.byInputModality) filters.byInputModality = data.byInputModality;
      if (data.byInferenceType) filters.byInferenceType = data.byInferenceType;
      if (data.byCustomizationType) filters.byCustomizationType = data.byCustomizationType;
      
      // Call AWS to list all available foundation models with optional filters
      console.log("[API] Listing foundation models with filters:", filters);
      const awsResponse = await listAvailableFoundationModels(
        Object.keys(filters).length > 0 ? filters : undefined
      );
      
      if (!awsResponse.success) {
        console.error("[API] Failed to list foundation models:", awsResponse.error);
        return new Response(
          JSON.stringify({
            error: "AWS API Error",
            message: awsResponse.error || "Failed to list foundation models from AWS Bedrock"
          }),
          { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }
      
      // Return the list of models along with applied filters
      return new Response(
        JSON.stringify({ 
          models: awsResponse.models,
          appliedFilters: awsResponse.appliedFilters,
          totalCount: awsResponse.count
        }),
        { headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    
    // ORIGINAL FUNCTIONALITY: Test AWS credentials
    console.log("[API] Testing AWS credentials");
    
    try {
      const result = await verifyAwsCredentials();
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("[API] Error testing AWS credentials:", error);
      return new Response(
        JSON.stringify({ 
          error: "AWS API Error", 
          message: error instanceof Error ? error.message : String(error) 
        }),
        { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("[API] Error in AWS credential test handler:", error);
    return new Response(
      JSON.stringify({ 
        error: "AWS API Error", 
        message: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
        { status: 401, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[API] Error verifying AWS credentials:", error);
    return new Response(
      JSON.stringify({ 
        error: "AWS Verification Error", 
        message: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[API] Error running AWS permission tests:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { status: 401, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    // Parse request data to get any filter parameters
    let requestBody = {};
    try {
      const text = await request.text();
      console.log("[API] Request body text:", text);
      
      try {
        requestBody = JSON.parse(text);
        console.log("[API] Parsed JSON request body:", JSON.stringify(requestBody));
      } catch (parseError) {
        console.error("[API] Failed to parse JSON:", parseError);
        requestBody = {};
      }
    } catch (e) {
      console.log("[API] No request body or could not read:", e);
    }
    
    // Extract filter parameters from the request data
    const filters: any = {};
    
    // Handle different request body structures:
    // 1. {action: "listFoundationModels", data: {byProvider: "..."}} - from client.js
    // 2. {action: "listFoundationModels", byProvider: "..."} - flat structure
    // 3. {byProvider: "..."} - direct parameters
    
    const data = requestBody.data || requestBody;
    console.log("[API] Extracting filters from data:", JSON.stringify(data));
    
    // Check for each possible filter
    if (data.byProvider) filters.byProvider = data.byProvider;
    if (data.byOutputModality) filters.byOutputModality = data.byOutputModality;
    if (data.byInputModality) filters.byInputModality = data.byInputModality;
    if (data.byInferenceType) filters.byInferenceType = data.byInferenceType;
    if (data.byCustomizationType) filters.byCustomizationType = data.byCustomizationType;
    
    // Call AWS to list all available foundation models with optional filters
    console.log("[API] Listing foundation models with filters:", filters);
    const awsResponse = await listAvailableFoundationModels(
      Object.keys(filters).length > 0 ? filters : undefined
    );
    
    if (!awsResponse.success) {
      console.error("[API] Failed to list foundation models:", awsResponse.error);
      return new Response(
        JSON.stringify({
          error: "AWS API Error",
          message: awsResponse.error || "Failed to list foundation models from AWS Bedrock"
        }),
        { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    
    // Return the list of models along with applied filters
    return new Response(
      JSON.stringify({ 
        models: awsResponse.models,
        appliedFilters: awsResponse.appliedFilters,
        totalCount: awsResponse.count
      }),
      { headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error listing foundation models:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

// Main HTTP handler
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: { ...CONFIG.CORS_HEADERS }
    });
  }
  
  try {
    // Log request details (sanitize for security)
    let requestUrl = req.url.replace(/token=[^&]+/, 'token=REDACTED');
    console.log(`[API] Request received: ${req.method} ${requestUrl}`);
    
    // For all other requests, parse the request body
    let requestBody: any = {};
    let requestText = "";
    let action = "";
    let data: any = {};
    
    try {
      // Read the request body as text
      requestText = await req.text();
      console.log(`[API] Raw request body: ${requestText.substring(0, 500)}${requestText.length > 500 ? '...' : ''}`);
      
      // Try to parse as JSON
      try {
        requestBody = JSON.parse(requestText);
        console.log(`[API] Parsed request body: ${JSON.stringify(requestBody).substring(0, 500)}...`);
        
        // Extract action and data from the request body
        action = requestBody.action || "";
        
        // Handle data extraction - could be directly in the body or nested under 'data'
        if (requestBody.data !== undefined) {
          // Data is nested
          data = requestBody.data;
        } else {
          // Data might be directly in the body (excluding the action field)
          const { action: _, ...restOfBody } = requestBody;
          data = restOfBody;
        }
        
        console.log(`[API] Extracted action: "${action}", data keys: ${Object.keys(data).join(', ')}`);
      } catch (parseError) {
        console.error(`[API] Failed to parse request body as JSON: ${parseError}`);
        requestBody = {};
      }
    } catch (e) {
      console.error(`[API] Error reading request body: ${e}`);
    }
    
    // Extract action from query string if not found in body
    if (!action) {
      try {
        const url = new URL(req.url);
        action = url.searchParams.get("action") || "";
        if (action) {
          console.log(`[API] Using action from query string: ${action}`);
        }
      } catch (e) {
        console.error(`[API] Error parsing URL: ${e}`);
      }
    }
    
    // Handle the request based on the action
    if (action) {
      // Process the action
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
            { status: 400, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
          );
      }
    } else {
      console.error("[API] Missing action in request:", requestBody);
      return new Response(
        JSON.stringify({ error: "Missing action", message: "No action specified in the request" }),
        { status: 400, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
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
      { status: 500, headers: { ...CONFIG.CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});