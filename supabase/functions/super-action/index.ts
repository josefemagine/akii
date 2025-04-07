// deno-lint-ignore-file no-explicit-any

// Regular import for Deno versions used in Supabase Edge Functions
// Use Deno.serve directly (built-in since Deno 1.25)
// Remove the import for serve

// @ts-ignore - Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import {
  BedrockClient,
  ListFoundationModelsCommand,
  ListProvisionedModelThroughputsCommand,
  CreateProvisionedModelThroughputCommand,
  DeleteProvisionedModelThroughputCommand
} from "npm:@aws-sdk/client-bedrock";

// Add FoundationModel type definition at the top of the file after imports
interface FoundationModel {
  modelId: string;
  modelName: string;
  providerName: string;
  modelArn: string;
  responseStreamingSupported: boolean;
  inputModalities: string[];
  outputModalities: string[];
  inferenceTypesSupported: string[];
  region: string;
  modelAccessStatus: string;
  supportsProvisionedThroughput: boolean;
  customizationsSupported: string[];
}

// Define valid origins list at the top level
const VALID_ORIGINS = [
  "https://www.akii.com"
];

// Always only use us-east-1 
const REGIONS_WITH_PROVISIONED_THROUGHPUT = [
  "us-east-1"
  // Note: Other regions like us-west-2, eu-central-1, and eu-west-3 may not support all provisioned throughput models
];

// Add AWS credential variable references
const AWS_ACCESS_KEY_ID = Deno.env.get("AWS_ACCESS_KEY_ID") || "";
const AWS_SECRET_ACCESS_KEY = Deno.env.get("AWS_SECRET_ACCESS_KEY") || "";
const AWS_REGION = "us-east-1";  // Hardcoded to us-east-1

// Function to get the appropriate CORS origin
function getCorsOrigin(requestOrigin: string | null): string {
  console.log("Request origin:", requestOrigin);
  
  // Always return www.akii.com as the only valid origin
  return "https://www.akii.com";
}

// Function to create CORS headers for a specific origin
function createCorsHeaders(origin: string | null): Record<string, string> {
  // Always use www.akii.com as the origin
  return {
    "Access-Control-Allow-Origin": "https://www.akii.com",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, X-Client-Info",
    "Access-Control-Allow-Credentials": "true",
    "Content-Type": "application/json",
    "Vary": "Origin"
  };
}

// Function to create preflight response headers
function createPreflightHeaders(origin: string | null): Record<string, string> {
  // Always use www.akii.com as the origin
  return {
    "Access-Control-Allow-Origin": "https://www.akii.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

// Define interface for request data to fix property access errors
interface RequestData {
  action: string;
  data: {
    modelId?: string;
    commitmentDuration?: string;
    modelUnits?: number;
    provisionedModelId?: string;
    instanceId?: string;
    byProvider?: string;
    byOutputModality?: string;
    byInputModality?: string;
    byInferenceType?: string;
    byCustomizationType?: string;
    [key: string]: any;
  };
}

// Test AWS connectivity and credentials
async function verifyAwsCredentials(): Promise<{ success: boolean, message: string, data?: any }> {
  try {
    console.log("[API] Verifying AWS credentials");
    
    // Check if credentials are provided
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      console.log("[API] AWS credentials missing");
      return { 
        success: false, 
        message: "AWS credentials are not configured" 
      };
    }
    
    // Create a Bedrock client specifically for us-east-1
    const client = new BedrockClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }
    });
    
    console.log("[API] Created test Bedrock client for us-east-1");
    
    // Make a simple API call to test connectivity
    const command = new ListFoundationModelsCommand({
      maxResults: 1 // Minimal data to retrieve
    });
    
    console.log("[API] Sending test ListFoundationModels command");
    const response = await client.send(command);
    
    // Check if we got a successful response
    console.log(`[API] AWS test successful, retrieved ${response.modelSummaries?.length || 0} models`);
    
    return {
      success: true,
      message: "AWS credentials verified successfully",
      data: {
        modelsAvailable: response.modelSummaries?.length || 0,
        region: "us-east-1",
        requestId: response.$metadata.requestId,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("[API] AWS verification error:", error);
    
    // Format the error message depending on the error type
    let errorMessage = "Unknown error verifying AWS credentials";
    
    if (error instanceof Error) {
      if (error.name === "AccessDeniedException") {
        errorMessage = "Access denied. Check IAM permissions for Bedrock API access.";
      } else if (error.name === "TimeoutError") {
        errorMessage = "Connection to AWS timed out. Check network connectivity.";
      } else if (error.name === "UnrecognizedClientException") {
        errorMessage = "Invalid AWS credentials. Check access key and secret.";
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
}

// Run AWS permissions test
async function runAwsPermissionsTest() {
  const region = Deno.env.get("AWS_REGION") || "us-east-1";
  const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID") || "";
  const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY") || "";
  
  try {
    console.log("[AWS] Running AWS permissions test");
    const client = new BedrockClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
    
    // Test listing models
    let listModelsSuccess = false;
    let modelsFound = 0;
    
    try {
      const command = new ListFoundationModelsCommand({});
      const result = await client.send(command);
      listModelsSuccess = true;
      modelsFound = result.modelSummaries?.length || 0;
    } catch (error) {
      console.error("[AWS] Error listing models:", error);
      listModelsSuccess = false;
    }
    
    // Test listing provisioned throughputs
    let listProvisionedSuccess = false;
    
    try {
      const command = new ListProvisionedModelThroughputsCommand({});
      await client.send(command);
      listProvisionedSuccess = true;
    } catch (error) {
      console.error("[AWS] Error listing provisioned throughputs:", error);
      listProvisionedSuccess = false;
    }
    
    return {
      success: true,
      permissions: {
        listModels: { success: listModelsSuccess, message: listModelsSuccess ? `Found ${modelsFound} models` : "Failed to list models" },
        listProvisioned: { success: listProvisionedSuccess, message: listProvisionedSuccess ? "Successfully listed provisioned throughputs" : "Failed to list provisioned throughputs" },
        invokeModels: { success: true, message: "Invoke models permission assumed" },
        createProvisionedThroughput: { success: true, message: "Create provisioned throughput permission assumed" }
      },
      modelsFound: modelsFound
    };
  } catch (error) {
    console.error("[AWS] Error running permissions test:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      permissions: {
        listModels: { success: false, error: "Test failed" },
        listProvisioned: { success: false, error: "Test failed" },
        invokeModels: { success: false, error: "Test failed" },
        createProvisionedThroughput: { success: false, error: "Test failed" }
      }
    };
  }
}

// Function to convert the modelId to a model ARN if needed
function getModelArn(modelId: string, region: string): string {
  // If the modelId is already an ARN, return it as is
  if (modelId.startsWith('arn:aws:')) {
    return modelId;
  }
  
  // Otherwise construct the ARN based on the region and modelId
  return `arn:aws:bedrock:${region}::foundation-model/${modelId}`;
}

// Function to convert commitment duration from "1m" or "6m" format to AWS SDK enum value
function getCommitmentDuration(duration: string): string {
  if (!duration) return "ONE_MONTH";
  
  const normalizedDuration = duration.toLowerCase();
  if (normalizedDuration === "6m" || normalizedDuration === "six_months") {
    return "SIX_MONTHS";
  }
  
  // Default to one month
  return "ONE_MONTH";
}

// Function to check if a model supports provisioned throughput
// Now assumes all models potentially support provisioned throughput
function modelSupportsProvisionedThroughput(modelId: string): boolean {
  // Consider all models as potentially supporting provisioned throughput
  // This allows the frontend to make filtering decisions
  return true;
}

// Function to check if region supports provisioned throughput
function regionSupportsProvisionedThroughput(region: string): boolean {
  return REGIONS_WITH_PROVISIONED_THROUGHPUT.includes(region);
}

// Function to check AWS account prerequisites for provisioned throughput
async function checkAwsAccountPrerequisites(client: BedrockClient) {
  try {
    console.log("Checking AWS account prerequisites for provisioned throughput");
    
    // First check if we can list existing provisioned throughputs
    try {
      const command = new ListProvisionedModelThroughputsCommand({});
      await client.send(command);
      return {
        success: true,
        message: "Account appears to be set up for provisioned throughput"
      };
    } catch (error) {
      if (error.name === "ValidationException" && error.message === "Operation not allowed") {
        return {
          success: false,
          message: "Your AWS account may not be approved for provisioned throughput",
          details: {
            error: error.message,
            recommendation: "You need to request access to Bedrock provisioned throughput via AWS console"
          }
        };
      }
      
      if (error.name === "AccessDeniedException") {
        return {
          success: false,
          message: "Your AWS credentials do not have permission to use provisioned throughput",
          details: {
            error: error.message,
            recommendation: "Check your IAM permissions"
          }
        };
      }
      
      // Any other error
      return {
        success: false,
        message: "Error checking provisioned throughput prerequisites",
        details: {
          error: error.message,
          errorType: error.name
        }
      };
    }
  } catch (error) {
    console.error("Error checking AWS account prerequisites:", error);
    return {
      success: false,
      message: "Failed to check AWS account prerequisites",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Extract user ID from JWT token
async function extractUserIdFromJwt(req: Request): Promise<string | null> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No valid authorization header found");
      return null;
    }
    
    // Extract JWT token
    const token = authHeader.split(" ")[1];
    
    try {
      // Create a Supabase client using the configured service role
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.log("Missing Supabase configuration for JWT validation");
        
        // Try to parse token directly as fallback if we can't validate
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          console.log("Extracted user ID from JWT payload without validation:", payload.sub);
          return payload.sub || null;
        } catch (e) {
          console.error("Failed to parse JWT payload:", e);
          return null;
        }
      }
      
      // Dynamically import the Supabase client
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      
      // Create Supabase client
      const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
      
      // Verify the token
      const { data: { user }, error } = await supabaseClient.auth.getUser(token);
      
      if (error || !user) {
        console.error("JWT validation failed:", error?.message);
        return null;
      }
      
      console.log("JWT validation successful for user:", user.id);
      return user.id;
    } catch (error) {
      console.error("Error validating JWT:", error);
      
      // Try to parse token directly as fallback if validation fails
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Extracted user ID from JWT payload as fallback:", payload.sub);
        return payload.sub || null;
      } catch (e) {
        console.error("Failed to parse JWT payload:", e);
        return null;
      }
    }
  } catch (error) {
    console.error("Error extracting user ID from JWT:", error);
    return null;
  }
}

// Function for listing all foundation models (accessible to the user)
// This no longer filters by provisioned throughput status so frontend can handle filtering
async function listFoundationModels(client: BedrockClient): Promise<FoundationModel[]> {
  console.log("[AWS] Listing all foundation models");
  
  try {
    // Use a hardcoded us-east-1 region regardless of client region
    const command = new ListFoundationModelsCommand({});
    const response = await client.send(command);
    
    console.log(`[AWS] Retrieved ${response.modelSummaries?.length || 0} foundation models`);
    
    // Map AWS response to simplified model format
    const models = response.modelSummaries?.map(model => ({
      modelId: model.modelId || "",
      modelName: model.modelName || "",
      providerName: model.providerName || "",
      modelArn: model.modelArn || "",
      responseStreamingSupported: model.responseStreamingSupported || false,
      inputModalities: model.inputModalities || ["TEXT"],
      outputModalities: model.outputModalities || ["TEXT"],
      inferenceTypesSupported: model.inferenceTypesSupported || ["ON_DEMAND"],
      // Include all fields without filtering
      region: "us-east-1",
      modelAccessStatus: model.modelAccessStatus || "UNKNOWN",
      supportsProvisionedThroughput: true, // We'll leave it to frontend to determine this
      customizationsSupported: model.customizationsSupported || []
    })) || [];
    
    console.log(`[AWS] Converted ${models.length} models to simplified format`);
    return models;
  } catch (error) {
    console.error("[AWS] Error in listFoundationModels:", error);
    // Return empty array on error
    return [];
  }
}

// Handler for ListFoundationModels action
async function handleListFoundationModels(req: Request): Promise<Response> {
  try {
    console.log("[API] Handling ListFoundationModels request");
    
    // Get the client with explicit us-east-1 region
    const client = new BedrockClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }
    });
    
    console.log("[API] Created Bedrock client for us-east-1");
    
    // Check credentials before attempting API call
    console.log("[API] AWS Credentials check:", {
      hasAccessKey: !!AWS_ACCESS_KEY_ID,
      hasSecretKey: !!AWS_SECRET_ACCESS_KEY,
      accessKeyPrefix: AWS_ACCESS_KEY_ID ? AWS_ACCESS_KEY_ID.substring(0, 4) : "none"
    });
    
    try {
      // Make the API call to list foundation models
      console.log("[API] Sending ListFoundationModels command to AWS Bedrock");
      const command = new ListFoundationModelsCommand({});
      const response = await client.send(command);
      
      console.log(`[API] ListFoundationModels response received. Models count: ${response.modelSummaries?.length || 0}`);
      
      // Log the first model (if any) to help debug the structure
      if (response.modelSummaries && response.modelSummaries.length > 0) {
        console.log("[API] Sample model from response:", JSON.stringify(response.modelSummaries[0], null, 2));
      } else {
        console.log("[API] No models returned from AWS Bedrock API");
      }
      
      // Map the response to our expected format
      const models = response.modelSummaries?.map(model => ({
        modelId: model.modelId || "",
        modelName: model.modelName || "",
        providerName: model.providerName || "",
        modelArn: model.modelArn || "",
        responseStreamingSupported: model.responseStreamingSupported || false,
        inputModalities: model.inputModalities || ["TEXT"],
        outputModalities: model.outputModalities || ["TEXT"],
        inferenceTypesSupported: model.inferenceTypesSupported || ["ON_DEMAND"],
        region: "us-east-1",
        modelAccessStatus: model.modelAccessStatus || "UNKNOWN",
        // We'll flag all models as supporting provisioned throughput
        // and let the frontend filter based on model ID if needed
        supportsProvisionedThroughput: true,
        customizationsSupported: model.customizationsSupported || []
      })) || [];
      
      // Return the formatted models
      return createSuccessResponse({
        models: models,
        count: models.length,
        region: "us-east-1"
      });
    } catch (awsError) {
      console.error("[API] AWS API Error in ListFoundationModels:", awsError);
      
      // Create a more detailed error response with AWS error information
      return createErrorResponse("AWS Bedrock API Error", {
        message: awsError instanceof Error ? awsError.message : String(awsError),
        name: awsError instanceof Error ? awsError.name : "UnknownError",
        stack: awsError instanceof Error ? awsError.stack : undefined,
        region: "us-east-1"
      });
    }
  } catch (error) {
    console.error("[API] Unexpected error in handleListFoundationModels:", error);
    return createErrorResponse("Error listing foundation models", error);
  }
}

// Function to create a success response with proper headers
function createSuccessResponse(data: any): Response {
  return new Response(
    JSON.stringify(data),
    {
      status: 200,
      headers: createCorsHeaders(null)
    }
  );
}

// Function to create an error response with proper headers
function createErrorResponse(message: string, error: any): Response {
  const errorData = {
    error: message,
    details: error instanceof Error ? error.message : String(error)
  };
  
  return new Response(
    JSON.stringify(errorData),
    {
      status: 400,
      headers: createCorsHeaders(null)
    }
  );
}

// Function to get a Bedrock client configured for us-east-1
function getBedrockClient(): BedrockClient {
  return new BedrockClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
  });
}

// Main serve function
serve(async (req) => {
  console.log("Edge Function running. Supabase Edge Function Diagnostic Start");
  console.log(`Request URL: ${req.url}`);
  console.log(`Request method: ${req.method}`);
  console.log(`Request headers: ${[...req.headers.entries()].map(([key, value]) => `${key}: ${value}`).join(', ')}`);

  const origin = req.headers.get("origin");
  console.log(`Received request from origin: ${origin}`);
  
  // Handle preflight request
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    const preflightHeaders = createPreflightHeaders(origin);
    console.log("Preflight response headers:", preflightHeaders);
    
    return new Response(null, { 
      status: 204,
      headers: preflightHeaders
    });
  }

  try {
    // Create CORS headers for this request
    const corsHeaders = createCorsHeaders(origin);
    console.log("CORS response headers:", corsHeaders);
    
    // Get AWS configuration from environment
    const region = Deno.env.get("AWS_REGION") || "us-east-1";
    const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID") || "";
    const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY") || "";
    
    // Log AWS configuration (without exposing full credentials)
    console.log("AWS Config:", {
      region,
      hasAccessKey: !!accessKeyId,
      accessKeyPrefix: accessKeyId ? accessKeyId.substring(0, 4) + "..." : "not set",
      hasSecretKey: !!secretAccessKey
    });

    // Create AWS client with custom timeout - increase timeout for long operations
    const client = new BedrockClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      requestHandler: {
        timeout: 30000 // 30 seconds timeout (increased from 15s)
      }
    });

    // Parse request data - handle empty bodies and format errors gracefully
    let requestData: RequestData = { action: '', data: {} };
    try {
      if (req.method === "POST") {
        const contentType = req.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const body = await req.text();
          if (body && body.trim()) {
            requestData = JSON.parse(body) as RequestData;
          } else {
            throw new Error("Empty request body");
          }
        } else {
          throw new Error(`Unsupported content type: ${contentType}`);
        }
      }
    } catch (parseError) {
      console.error("Error parsing request data:", parseError);
      const errorResponse = new Response(
        JSON.stringify({
          error: `Invalid request data: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          timestamp: new Date().toISOString()
        }), 
        { 
          status: 400,
          headers: corsHeaders
        }
      );
      return errorResponse;
    }
    
    const { action, data } = requestData;
    
    console.log(`Processing action: ${action}`);
    
    let result;
    let diagnosticInfo = {};
    
    // Process action
    if (action === "aws-permission-test") {
      console.log("Running AWS permission tests");
      
      // First test basic credentials verification
      const credentialsResult = await verifyAwsCredentials();
      
      // Then run permissions test for different actions
      const permissionsResult = await runAwsPermissionsTest();
      
      // Return comprehensive test results
      result = {
        test_results: {
          timestamp: new Date().toISOString(),
          credentials: {
            success: credentialsResult.success,
            message: credentialsResult.message,
            region: region,
            hasAccessKey: !!accessKeyId,
            hasSecretAccessKey: !!secretAccessKey
          },
          permissions: permissionsResult.permissions || {},
          diagnostics: {
            environment: {
              runtime: "Deno Edge Function",
              region: Deno.env.get("REGION") || "unknown",
              function_name: "super-action"
            }
          }
        },
        success: true
      };
    } else if (action === "aws-provisioned-throughput-test") {
      console.log("Running AWS provisioned throughput test");
      
      // Test if specific regions support provisioned throughput
      const regionsToTest = ["us-east-1", "us-west-2", "eu-central-1", "eu-west-3"];
      const regionResults = {};
      
      // Test each region
      for (const testRegion of regionsToTest) {
        console.log(`Testing region ${testRegion}`);
        
        try {
          // Create a client for the specific region
          const regionalClient = new BedrockClient({
            region: testRegion,
            credentials: {
              accessKeyId,
              secretAccessKey,
            }
          });
          
          // Try to list provisioned models in this region
          try {
            const command = new ListProvisionedModelThroughputsCommand({});
            await regionalClient.send(command);
            regionResults[testRegion] = {
              success: true,
              message: "Region supports provisioned throughput"
            };
          } catch (error) {
            regionResults[testRegion] = {
              success: false,
              message: error.message || "Error testing region",
              errorType: error.name,
              isValidationError: error.name === "ValidationException" && error.message === "Operation not allowed"
            };
          }
        } catch (error) {
          regionResults[testRegion] = {
            success: false,
            message: "Failed to initialize client",
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
      
      // Check account prerequisites in the current region
      const prerequisitesCheck = await checkAwsAccountPrerequisites(client);
      
      // Test model availability
      const modelResults = {};
      const modelsToTest = [
        "anthropic.claude-v2",
        "anthropic.claude-3-sonnet-20240229-v1:0",
        "meta.llama2-13b-chat-v1"
      ];
      
      for (const modelId of modelsToTest) {
        try {
          console.log(`Testing model ${modelId}`);
          const modelArn = getModelArn(modelId, region);
          
          try {
            // Simply test if the model is listable
            const command = new ListFoundationModelsCommand({});
            const response = await client.send(command);
            
            // Check if this model is in the list
            const isModelAvailable = response.modelSummaries?.some(model => 
              model.modelId === modelId || model.modelId?.includes(modelId)
            );
            
            modelResults[modelId] = {
              success: isModelAvailable,
              message: isModelAvailable ? "Model is available" : "Model not found in region",
              supportsProvisionedThroughput: modelSupportsProvisionedThroughput(modelId),
              arn: modelArn
            };
          } catch (error) {
            modelResults[modelId] = {
              success: false,
              message: "Error checking model",
              error: error instanceof Error ? error.message : String(error),
              arn: modelArn
            };
          }
        } catch (error) {
          modelResults[modelId] = {
            success: false,
            message: "Failed to test model",
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
      
      // Return comprehensive diagnostic results
      result = {
        test_results: {
          timestamp: new Date().toISOString(),
          region: region,
          accountPrerequisites: prerequisitesCheck,
          regionTests: regionResults,
          modelTests: modelResults,
          recommendations: {
            recommendedRegion: REGIONS_WITH_PROVISIONED_THROUGHPUT[0],
            recommendedModels: ["anthropic.claude-3-sonnet-20240229-v1:0", "anthropic.claude-v2", "meta.llama2-70b-chat-v1"],
            nextSteps: "If tests show 'Operation not allowed', your AWS account may not be set up for provisioned throughput. Check AWS Bedrock console for activation."
          }
        },
        success: true
      };
    } else if (action === "ListFoundationModels") {
      console.log("Handling ListFoundationModels action");
      return handleListFoundationModels(req);
    } else if (action === "ListAccessibleModels") {
      console.log("Handling ListAccessibleModels action (redirecting to ListFoundationModels)");
      // For backward compatibility, redirect to ListFoundationModels
      return handleListFoundationModels(req);
    } else if (action === "ListProvisionedModelThroughputs") {
      console.log("Fetching provisioned model throughputs");
      
      const command = new ListProvisionedModelThroughputsCommand({});
      try {
        const response = await client.send(command);
        
        // Capture diagnostic info
        diagnosticInfo = {
          requestId: response.$metadata.requestId,
          httpStatusCode: response.$metadata.httpStatusCode,
          attempts: response.$metadata.attempts
        };
        
        console.log("Provisioned models response metadata:", diagnosticInfo);
        
        // Log the entire response structure (safely)
        console.log("Raw API response:", JSON.stringify({
          $metadata: response.$metadata,
          provisionedModelSummaries: response.provisionedModelSummaries || [],
          nextToken: response.nextToken
        }));
        
        // Check if models array exists and its length
        const models = response.provisionedModelSummaries || [];
        console.log(`Found ${models.length} provisioned models`);
        
        result = {
          models: models.map(model => ({
            id: model.provisionedModelId,
            name: model.modelId,
            throughput: model.provisionedThroughput,
            status: model.status
          })),
          diagnosticInfo
        };
      } catch (error) {
        console.error("Error fetching provisioned models:", error);
        // Provide detailed error information
        diagnosticInfo = {
          errorName: error.name,
          errorMessage: error.message,
          errorCode: error.$metadata?.httpStatusCode || error.Code,
          errorType: error.name === 'TimeoutError' ? 'TIMEOUT' : 
                    (error.name === 'AccessDeniedException' ? 'ACCESS_DENIED' : 'API_ERROR')
        };
        throw error;
      }
    } else if (action === "GetFoundationModel") {
      console.log(`Getting foundation model details for: ${data.modelId}`);
      
      // We don't have GetFoundationModelCommand available, so we'll use ListFoundationModels and filter
      console.log("Using ListFoundationModels as fallback for GetFoundationModel");
      
      try {
        // Get all foundation models first
        const command = new ListFoundationModelsCommand({});
        const response = await client.send(command);
        
        // Find the specific model by ID
        const foundModel = response.modelSummaries?.find(model => model.modelId === data.modelId);
        
        if (!foundModel) {
          throw new Error(`Model with ID ${data.modelId} not found`);
        }
        
        // Capture diagnostic info
        diagnosticInfo = {
          requestId: response.$metadata.requestId,
          httpStatusCode: response.$metadata.httpStatusCode,
          attempts: response.$metadata.attempts,
          note: "Using ListFoundationModels as fallback for GetFoundationModel"
        };
        
        console.log("Model details response metadata:", diagnosticInfo);
        
        result = {
          model: {
            id: foundModel.modelId,
            name: foundModel.modelName,
            provider: foundModel.providerName,
            responseStreamingSupported: foundModel.responseStreamingSupported || false,
            inputModalities: foundModel.inputModalities || [],
            outputModalities: foundModel.outputModalities || [],
            customizationsSupported: foundModel.customizationsSupported || []
          },
          diagnosticInfo
        };
      } catch (error) {
        console.error(`Error getting foundation model ${data.modelId}:`, error);
        diagnosticInfo = {
          errorName: error.name,
          errorMessage: error.message,
          errorCode: error.$metadata?.httpStatusCode || error.Code
        };
        throw error;
      }
    } else if (action === "CreateProvisionedModelThroughput" || action === "createInstance") {
      console.log("Creating provisioned model throughput", data);
      
      // Ensure modelId is properly set in the request
      if (!data.modelId) {
        const errorResponse = JSON.stringify({
          error: "modelId is required for creating provisioned model throughput",
          timestamp: new Date().toISOString()
        });
        return new Response(errorResponse, { 
          status: 400, 
          headers: corsHeaders 
        });
      }
      
      // Check if the model supports provisioned throughput
      if (!modelSupportsProvisionedThroughput(data.modelId)) {
        console.log(`Model ${data.modelId} does not support provisioned throughput`);
        const errorResponse = JSON.stringify({
          success: false,
          error: "The selected model does not support provisioned throughput",
          details: {
            modelId: data.modelId,
            supportedModels: "All models are now considered to potentially support provisioned throughput",
            documentation: "https://docs.aws.amazon.com/bedrock/latest/userguide/prov-throughput.html"
          },
          timestamp: new Date().toISOString()
        });
        return new Response(errorResponse, { 
          status: 400, 
          headers: corsHeaders 
        });
      }
      
      // Check if the region supports provisioned throughput
      if (!regionSupportsProvisionedThroughput(region)) {
        console.log(`Region ${region} may not fully support provisioned throughput`);
        const errorResponse = JSON.stringify({
          success: false,
          error: "The selected AWS region may not support provisioned throughput for this model",
          details: {
            region: region,
            supportedRegions: REGIONS_WITH_PROVISIONED_THROUGHPUT,
            recommendation: "Try using us-east-1 (N. Virginia) or us-west-2 (Oregon) region"
          },
          timestamp: new Date().toISOString()
        });
        return new Response(errorResponse, { 
          status: 400, 
          headers: corsHeaders 
        });
      }
      
      try {
        // First check if the AWS account is set up for provisioned throughput
        const prerequisitesCheck = await checkAwsAccountPrerequisites(client);
        console.log("AWS prerequisites check result:", JSON.stringify(prerequisitesCheck));
        
        if (!prerequisitesCheck.success) {
          const errorResponse = JSON.stringify({
            success: false,
            error: "AWS account prerequisites check failed",
            details: prerequisitesCheck,
            timestamp: new Date().toISOString()
          });
          return new Response(errorResponse, { 
            status: 400, 
            headers: corsHeaders 
          });
        }
        
        // Extract user ID from JWT token if available
        const userId = await extractUserIdFromJwt(req);
        if (userId) {
          console.log("Extracted user ID from JWT:", userId);
          // Add userId to data for tagging
          data.userId = userId;
        } else {
          console.log("No user ID extracted from JWT, will create instance without user tag");
        }
        
        // If prerequisites check passed, continue with the provisioned throughput creation
        // Prepare the model ARN and other parameters
        const modelArn = getModelArn(data.modelId, region);
        const commitmentDuration = getCommitmentDuration(data.commitmentDuration);
        const modelUnits = Number(data.modelUnits) || 1;
        
        // Log the full request parameters with more details
        const requestParams = {
          modelId: data.modelId,
          modelArn: modelArn,
          commitmentDuration: commitmentDuration,
          modelUnits: modelUnits,
          provisionedModelName: data.provisionedModelName,
          userId: data.userId,
          timestamp: new Date().toISOString(),
          region: region
        };
        
        console.log("Create instance parameters:", JSON.stringify(requestParams));
        
        try {
          // Create a unique, identifiable provisioned model name if not provided
          if (!data.provisionedModelName) {
            const dateStr = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
            data.provisionedModelName = `akii-pmt-${dateStr}`;
          }
          console.log(`Attempting to create provisioned model with name: ${data.provisionedModelName}`);
          
          // Create the actual AWS Bedrock provisioned model throughput
          const command = new CreateProvisionedModelThroughputCommand({
            modelId: modelArn,
            provisionedModelName: data.provisionedModelName,
            commitmentDuration: commitmentDuration,
            modelUnits: modelUnits,
            tags: {
              CreatedBy: "AkiiApp",
              CreatedAt: new Date().toISOString(),
              Source: "akii-super-action",
              ...(data.userId && { userId: data.userId }),
              ...(data.tags && typeof data.tags === 'object' ? data.tags : {})
            }
          });
          
          // Add a longer timeout for this specific operation
          const awsResponse = await Promise.race([
            client.send(command),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error("AWS Bedrock API timeout after 20 seconds")), 20000)
            )
          ]) as any;
          
          console.log("AWS Bedrock API response:", JSON.stringify(awsResponse));
          
          // Format the response to match the expected format
          result = {
            success: true,
            instance: {
              id: Date.now(),
              instance_id: awsResponse.provisionedModelId || data.provisionedModelName,
              model_id: data.modelId,
              commitment_duration: commitmentDuration,
              model_units: modelUnits,
              status: awsResponse.provisionedModelLifecycle?.status || "CREATING",
              created_at: new Date().toISOString(),
              deleted_at: null,
              userId: data.userId || null,
              name: data.provisionedModelName,
              tags: {
                CreatedBy: "AkiiApp",
                CreatedAt: new Date().toISOString(),
                Source: "akii-super-action",
                ...(data.userId && { userId: data.userId }),
                ...(data.tags && typeof data.tags === 'object' ? data.tags : {})
              }
            }
          };
        } catch (awsError) {
          console.error("AWS API error creating provisioned model throughput:", awsError);
          
          // Extract detailed error information with more specific message parsing
          let errorMessage = awsError.message || "Unknown error";
          
          // Try to extract the specific validation message from AWS
          if (errorMessage === "Operation not allowed" && awsError.name === "ValidationException") {
            errorMessage = "Operation not allowed. Your AWS account may not be approved for provisioned throughput or the feature may be unavailable in this region.";
          }
          
          const errorDetails = {
            name: awsError.name,
            message: errorMessage,
            code: awsError.$fault,
            httpStatus: awsError.$metadata?.httpStatusCode,
            requestId: awsError.$metadata?.requestId,
            attempts: awsError.$metadata?.attempts || 1
          };
          
          console.log("Error details:", JSON.stringify(errorDetails));
          
          // Determine possible causes based on error type
          let possibleCauses = [];
          let recommendedActions = [];
          
          if (awsError.name === "ValidationException") {
            possibleCauses = [
              "The model ID format may be incorrect",
              "The selected model may not support provisioned throughput",
              "The requested model units may be outside allowed range",
              "The commitment duration value may be invalid"
            ];
            recommendedActions = [
              "Verify that the model supports provisioned throughput",
              "Try a different foundation model",
              "Check the AWS Bedrock documentation for this specific model",
              "Verify the model ARN format is correct"
            ];
          } else if (awsError.name === "AccessDeniedException") {
            possibleCauses = [
              "IAM permissions may be insufficient",
              "AWS account may not have access to this feature"
            ];
            recommendedActions = [
              "Check IAM policy for bedrock:CreateProvisionedModelThroughput permission",
              "Ensure your AWS account has been approved for Bedrock provisioned throughput"
            ];
          } else if (awsError.name === "ServiceQuotaExceededException") {
            possibleCauses = [
              "You may have reached your account's quota for provisioned models",
              "You may have reached your quota for model units"
            ];
            recommendedActions = [
              "Check your Service Quotas in the AWS console",
              "Request a quota increase if needed"
            ];
          } else {
            possibleCauses = [
              "This may be an AWS Bedrock service issue",
              "The API parameters may be invalid",
              "Network connectivity issues"
            ];
            recommendedActions = [
              "Check the AWS status page",
              "Try again later"
            ];
          }
          
          // Provide a detailed error response
          result = {
            success: false,
            error: `AWS Bedrock API error: ${awsError.name}: ${awsError.message}`,
            errorDetails: {
              ...errorDetails,
              possibleCauses,
              recommendedActions,
              requestParameters: requestParams
            },
            timestamp: new Date().toISOString()
          };
          
          // Return a proper error response with appropriate status code
          const errorResponse = JSON.stringify(result);
          return new Response(errorResponse, { 
            status: awsError.$metadata?.httpStatusCode || 500, 
            headers: corsHeaders 
          });
        }
      } catch (error) {
        console.error("Error creating provisioned model throughput:", error);
        const errorResponse = JSON.stringify({
          error: `Failed to create provisioned model: ${error instanceof Error ? error.message : String(error)}`,
          timestamp: new Date().toISOString()
        });
        return new Response(errorResponse, { 
          status: 500, 
          headers: corsHeaders 
        });
      }
    } else if (action === "TestAuth") {
      console.log("Testing AWS Bedrock authentication");
      
      try {
        // Verify AWS credentials by making a simple API call
        const credentialsResult = await verifyAwsCredentials();
        
        // Return a simplified response for the auth check
        result = {
          connected: credentialsResult.success,
          status: credentialsResult.success ? "connected" : "error",
          message: credentialsResult.message,
          data: {
            timestamp: new Date().toISOString(),
            aws: {
              region: region,
              hasCredentials: !!accessKeyId && !!secretAccessKey
            }
          }
        };
      } catch (error) {
        console.error("Error in TestAuth:", error);
        result = {
          connected: false,
          status: "error",
          message: error instanceof Error ? error.message : String(error),
          error: error instanceof Error ? error.message : String(error)
        };
      }
    } else {
      console.log(`Unsupported action: ${action}`);
      return new Response(
        JSON.stringify({ error: "Unsupported action", action }),
        { 
          status: 400, 
          headers: corsHeaders 
        }
      );
    }

    // Return the result with CORS headers
    const responseBody = JSON.stringify(result || { error: "No action matched" });
    return new Response(responseBody, { 
      status: 200, 
      headers: corsHeaders 
    });
  } catch (error) {
    console.error("Unhandled server error:", error);
    return new Response(
      JSON.stringify({
        error: `Server error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: createCorsHeaders(origin) 
      }
    );
  }
});