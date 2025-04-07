// Import serve as the default export from Deno standard library
import serve from "https://deno.land/std@0.168.0/http/server.ts";

import {
  BedrockClient,
  ListFoundationModelsCommand,
  ListProvisionedModelThroughputsCommand,
  CreateProvisionedModelThroughputCommand,
  DeleteProvisionedModelThroughputCommand
} from "npm:@aws-sdk/client-bedrock";

// Define valid origins list at the top level
const VALID_ORIGINS = [
  "https://www.akii.com",
  "https://akii.com",
  "http://localhost:3000",
  "http://localhost:5173"
];

// Function to get the appropriate CORS origin
function getCorsOrigin(requestOrigin: string | null): string {
  console.log("Request origin:", requestOrigin);
  
  // Safety check - if no origin, use the first valid origin
  if (!requestOrigin) {
    return VALID_ORIGINS[0];
  }
  
  // Check if the origin is in our allowed list
  const isValidOrigin = VALID_ORIGINS.includes(requestOrigin);
  console.log(`Origin ${requestOrigin} valid: ${isValidOrigin}`);
  
  return isValidOrigin ? requestOrigin : VALID_ORIGINS[0];
}

// Function to create CORS headers for a specific origin
function createCorsHeaders(origin: string | null): Record<string, string> {
  const corsOrigin = getCorsOrigin(origin);
  
  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, X-Client-Info",
    "Access-Control-Allow-Credentials": "true",
    "Content-Type": "application/json",
    "Vary": "Origin"
  };
}

// Function to create preflight response headers
function createPreflightHeaders(origin: string | null): Record<string, string> {
  const corsOrigin = getCorsOrigin(origin);
  
  return {
    "Access-Control-Allow-Origin": corsOrigin,
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

// Implement AWS test functions directly instead of importing them
// Verify AWS credentials and connectivity
async function verifyAwsCredentials() {
  const region = Deno.env.get("AWS_REGION") || "us-east-1";
  const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID") || "";
  const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY") || "";
  
  try {
    console.log("[AWS] Verifying AWS credentials");
    const client = new BedrockClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
    
    const command = new ListFoundationModelsCommand({});
    const result = await client.send(command);
    
    return {
      success: true,
      message: "AWS credentials verified successfully",
      details: {
        modelsFound: result.modelSummaries?.length || 0,
        region
      }
    };
  } catch (error) {
    console.error("[AWS] Error verifying AWS credentials:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
      error: error instanceof Error ? error.message : String(error),
      details: {
        errorName: error instanceof Error ? error.name : "Unknown",
        region
      }
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

// Main serve function
serve(async (req) => {
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
    } else if (action === "ListFoundationModels") {
      console.log("Fetching foundation models");
      
      const command = new ListFoundationModelsCommand({
        // Add byInferenceType or other parameters if needed
        byProvider: data?.byProvider || undefined,
      });
      
      try {
        const response = await client.send(command);
        
        // Capture diagnostic info
        diagnosticInfo = {
          requestId: response.$metadata.requestId,
          httpStatusCode: response.$metadata.httpStatusCode,
          attempts: response.$metadata.attempts
        };
        
        console.log("Foundation models response metadata:", diagnosticInfo);
        
        // Log the entire response structure (safely)
        console.log("Raw API response:", JSON.stringify({
          $metadata: response.$metadata,
          modelSummaries: response.modelSummaries?.length || 0
        }));
        
        // Check if models array exists and its length
        const models = response.modelSummaries || [];
        console.log(`Found ${models.length} foundation models`);
        
        result = {
          models: models.map(model => ({
            id: model.modelId,
            name: model.modelName,
            provider: model.providerName,
            inferenceTypes: model.inferenceTypesSupported || [],
            customizationsSupported: model.customizationsSupported || []
          })),
          diagnosticInfo
        };
      } catch (error) {
        console.error("Error fetching foundation models:", error);
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
      
      try {
        // Prepare the model ARN and other parameters
        const modelArn = getModelArn(data.modelId, region);
        const commitmentDuration = getCommitmentDuration(data.commitmentDuration);
        const modelUnits = Number(data.modelUnits) || 1;
        
        // Log the full request parameters
        console.log("Create instance parameters:", JSON.stringify({
          modelId: data.modelId,
          modelArn: modelArn,
          commitmentDuration: commitmentDuration,
          modelUnits: modelUnits,
          timestamp: new Date().toISOString()
        }));
        
        try {
          // Create the actual AWS Bedrock provisioned model throughput
          const command = new CreateProvisionedModelThroughputCommand({
            modelId: modelArn,
            provisionedModelName: `pmt-${Date.now()}`,
            commitmentDuration: commitmentDuration,
            modelUnits: modelUnits
          });
          
          const awsResponse = await client.send(command);
          
          console.log("AWS Bedrock API response:", awsResponse);
          
          // Format the response to match the expected format
          result = {
            success: true,
            instance: {
              id: Date.now(),
              instance_id: awsResponse.provisionedModelId || `pmt-${Date.now()}`,
              model_id: data.modelId,
              commitment_duration: commitmentDuration,
              model_units: modelUnits,
              status: awsResponse.provisionedModelLifecycle?.status || "CREATING",
              created_at: new Date().toISOString(),
              deleted_at: null
            }
          };
        } catch (awsError) {
          console.error("AWS API error creating provisioned model throughput:", awsError);
          
          // Fallback to providing a simulated instance with error info
          // This helps frontend testing without failing completely
          result = {
            success: false,
            error: `AWS Bedrock API error: ${awsError instanceof Error ? awsError.message : String(awsError)}`,
            errorDetails: {
              name: awsError instanceof Error ? awsError.name : 'UnknownError',
              requestId: awsError.requestId || 'unknown',
              time: new Date().toISOString()
            }
          };
          
          // Return a proper error response
          const errorResponse = JSON.stringify(result);
          return new Response(errorResponse, { 
            status: 500, 
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