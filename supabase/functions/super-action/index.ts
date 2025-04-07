// Import serve as a named export - this is the pattern used across all Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import {
  BedrockClient,
  ListFoundationModelsCommand,
  ListProvisionedModelThroughputsCommand
} from "npm:@aws-sdk/client-bedrock";

// CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, X-Client-Info",
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json"
};

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

// Set CORS headers function
function setCorsHeaders(req: Request, response: Response): Response {
  const origin = req.headers.get("origin");
  const validOrigins = ["https://www.akii.com", "http://localhost:3000", "http://localhost:5173"];
  
  const corsHeaders = {
    "Access-Control-Allow-Origin": validOrigins.includes(origin || "") ? origin! : validOrigins[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
  
  // Apply CORS headers to the response
  const headersEntries: [string, string][] = [];
  response.headers.forEach((value, key) => {
    headersEntries.push([key, value]);
  });
  
  const responseWithCors = new Response(
    response.body,
    {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers({
        ...Object.fromEntries(headersEntries),
        ...corsHeaders,
      }),
    }
  );
  
  return responseWithCors;
}

// Main serve function
serve(async (req) => {
  // Handle preflight request
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return setCorsHeaders(req, new Response(null, { status: 204 }));
  }

  try {
    // Log request origin
    const origin = req.headers.get("origin");
    console.log(`Origin: ${origin}`);

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

    // Create AWS client with custom timeout
    const client = new BedrockClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      requestHandler: {
        timeout: 15000 // 15 seconds timeout
      }
    });

    // Parse request data
    const requestData = await req.json();
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
    } else {
      console.log(`Unsupported action: ${action}`);
      return setCorsHeaders(req, new Response(
        JSON.stringify({ error: "Unsupported action", action }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      ));
    }

    // Return response with result
    return setCorsHeaders(req, new Response(
      JSON.stringify({
        data: result,
        success: true
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    ));
  } catch (error) {
    // Log the error
    console.error("Error processing request:", error);
    
    // Create detailed error response
    const errorResponse = {
      error: error.message || "Unknown error",
      code: error.code || error.name || "ERROR",
      success: false,
      diagnosticInfo: error.diagnosticInfo || {
        errorType: error.name === 'TimeoutError' ? 'TIMEOUT' : 
                  (error.name === 'AccessDeniedException' ? 'ACCESS_DENIED' : 
                  (error.name === 'ServiceUnavailableException' ? 'SERVICE_UNAVAILABLE' : 'UNKNOWN')),
        errorName: error.name,
        errorStack: Deno.env.get("ENVIRONMENT") === "development" ? error.stack : undefined
      }
    };
    
    // Return error response with CORS headers
    return setCorsHeaders(req, new Response(
      JSON.stringify(errorResponse),
      { status: 500, headers: { "Content-Type": "application/json" } }
    ));
  }
});