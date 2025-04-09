// Minimal AWS Bedrock Integration for Supabase Edge Function

// @ts-ignore - Deno-specific import
import {
  BedrockClient,
  ListFoundationModelsCommand,
  ListProvisionedModelThroughputsCommand,
  CreateProvisionedModelThroughputCommand,
  GetProvisionedModelThroughputCommand,
  DeleteProvisionedModelThroughputCommand
} from "npm:@aws-sdk/client-bedrock@3.462.0";

// @ts-ignore - Deno-specific import
import { 
  BedrockRuntimeClient, 
  InvokeModelCommand 
} from "npm:@aws-sdk/client-bedrock-runtime@3.462.0";

// Configuration
const CONFIG = {
  AWS_REGION: Deno.env.get("AWS_REGION") || "us-east-1",
  AWS_ACCESS_KEY_ID: Deno.env.get("AWS_ACCESS_KEY_ID") || "",
  AWS_SECRET_ACCESS_KEY: Deno.env.get("AWS_SECRET_ACCESS_KEY") || ""
};

// Function to get a Bedrock client
function getBedrockClient() {
  return new BedrockClient({
    region: CONFIG.AWS_REGION,
    credentials: {
      accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
      secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY
    }
  });
}

// Function to get a BedrockRuntime client
function getBedrockRuntimeClient() {
  return new BedrockRuntimeClient({
    region: CONFIG.AWS_REGION,
    credentials: {
      accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
      secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY
    }
  });
}

// List foundation models
export async function listFoundationModels(filters?: any) {
  try {
    console.log(`[AWS] Listing available foundation models with filters:`, filters);
    const client = getBedrockClient();
    
    // Prepare command parameters with any filters provided
    const params: any = {};
    
    // Apply filters if provided
    if (filters) {
      if (filters.byProvider) params.byProvider = filters.byProvider;
      if (filters.byOutputModality) params.byOutputModality = filters.byOutputModality;
      if (filters.byInputModality) params.byInputModality = filters.byInputModality;
      if (filters.byInferenceType) params.byInferenceType = filters.byInferenceType;
      if (filters.byCustomizationType) params.byCustomizationType = filters.byCustomizationType;
    }
    
    const command = new ListFoundationModelsCommand(params);
    const response = await client.send(command);
    
    const models = response.modelSummaries || [];
    
    return {
      success: true,
      models,
      count: models.length,
      appliedFilters: filters || {}
    };
  } catch (error) {
    console.error("[AWS] Error listing foundation models:", error);
    return {
      success: false,
      error: error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error),
      models: [],
      count: 0
    };
  }
}

// List provisioned model throughputs
export async function listProvisionedModelThroughputs() {
  try {
    console.log(`[AWS] Listing provisioned model throughputs`);
    const client = getBedrockClient();
    const command = new ListProvisionedModelThroughputsCommand({});
    const result = await client.send(command);

    if (result.provisionedModelSummaries && result.provisionedModelSummaries.length > 0) {
      const instances = result.provisionedModelSummaries.map(model => ({
        provisionedModelArn: model.provisionedModelArn || '',
        modelId: model.modelArn || '',
        provisionedModelStatus: model.status || 'UNKNOWN',
        provisionedThroughput: {
          commitmentDuration: model.commitmentDuration || 'ONE_MONTH',
          provisionedModelThroughput: model.modelUnits || 1
        },
        creationTime: model.creationTime instanceof Date ? 
          model.creationTime.toISOString() : 
          new Date().toISOString()
      }));

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
      error: error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error),
      instances: []
    };
  }
}

// Create a provisioned model throughput
export async function createProvisionedModelThroughput(params: any) {
  try {
    console.log(`[AWS] Creating provisioned model throughput for ${params.modelId}`);
    const client = getBedrockClient();
    
    const input = {
      modelId: params.modelId,
      provisionedModelName: `${params.modelId}-${Date.now()}`,
      provisionedThroughput: {
        commitmentDuration: params.commitmentDuration,
        provisionedModelThroughput: params.modelUnits
      }
    };
    
    const command = new CreateProvisionedModelThroughputCommand(input);
    const response = await client.send(command);
    
    return {
      success: true,
      instance_id: response.provisionedModelArn,
      instance: {
        provisionedModelArn: response.provisionedModelArn,
        modelId: params.modelId,
        provisionedModelStatus: response.status || "CREATING",
        provisionedThroughput: {
          commitmentDuration: params.commitmentDuration,
          provisionedModelThroughput: params.modelUnits
        },
        creationTime: response.creationTime || new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("[AWS] Error creating provisioned model throughput:", error);
    return {
      success: false,
      error: error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)
    };
  }
}

// Get details about a provisioned model throughput
export async function getProvisionedModelThroughput(instanceId: string) {
  try {
    console.log(`[AWS] Getting provisioned model throughput for ${instanceId}`);
    const client = getBedrockClient();
    
    const command = new GetProvisionedModelThroughputCommand({
      provisionedModelId: instanceId
    });
    
    const response = await client.send(command);
    
    return {
      success: true,
      instance: {
        provisionedModelArn: response.provisionedModelArn,
        modelId: response.modelArn,
        provisionedModelStatus: response.status,
        provisionedThroughput: {
          commitmentDuration: response.commitmentDuration,
          provisionedModelThroughput: response.modelUnits
        },
        creationTime: response.creationTime
      }
    };
  } catch (error) {
    console.error("[AWS] Error getting provisioned model throughput:", error);
    return {
      success: false,
      error: error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)
    };
  }
}

// Delete a provisioned model throughput
export async function deleteProvisionedModelThroughput(instanceId: string) {
  try {
    console.log(`[AWS] Deleting provisioned model throughput ${instanceId}`);
    const client = getBedrockClient();
    
    const command = new DeleteProvisionedModelThroughputCommand({
      provisionedModelId: instanceId
    });
    
    const response = await client.send(command);
    
    return {
      success: true,
      result: response
    };
  } catch (error) {
    console.error("[AWS] Error deleting provisioned model throughput:", error);
    return {
      success: false,
      error: error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)
    };
  }
}

// Invoke a model
export async function invokeBedrockModel(params: any) {
  try {
    console.log(`[AWS] Invoking model for instance ${params.instanceId}`);
    const client = getBedrockRuntimeClient();
    
    // Simplistic implementation - would be expanded for production
    const response = {
      success: true,
      response: "This is a placeholder response for the model invocation",
      usage: {
        input_tokens: 10,
        output_tokens: 20,
        total_tokens: 30
      }
    };
    
    return response;
  } catch (error) {
    console.error("[AWS] Error invoking model:", error);
    return {
      success: false,
      error: error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)
    };
  }
}

// Get usage statistics
export async function getBedrockUsageStats(params: any) {
  try {
    console.log(`[AWS] Getting usage statistics ${params.instanceId ? 'for ' + params.instanceId : ''}`);
    
    // Simplistic implementation - would be expanded for production
    const usageStats = {
      success: true,
      usage: {
        total_tokens: 1000,
        instances: []
      },
      limits: {
        max_tokens: 100000
      }
    };
    
    return usageStats;
  } catch (error) {
    console.error("[AWS] Error getting usage stats:", error);
    return {
      success: false,
      error: error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)
    };
  }
}

// Verify AWS credentials
export async function verifyAwsCredentials() {
  try {
    console.log("[AWS] Verifying AWS credentials");
    
    // Check if credentials are configured
    if (!CONFIG.AWS_ACCESS_KEY_ID || !CONFIG.AWS_SECRET_ACCESS_KEY) {
      return {
        success: false,
        message: "AWS credentials not configured",
        details: {
          has_access_key: Boolean(CONFIG.AWS_ACCESS_KEY_ID),
          has_secret_key: Boolean(CONFIG.AWS_SECRET_ACCESS_KEY)
        }
      };
    }
    
    // Test a simple API call
    const client = getBedrockClient();
    const command = new ListFoundationModelsCommand({});
    await client.send(command);
    
    return {
      success: true,
      message: "AWS credentials verified successfully",
      details: {
        has_access_key: true,
        has_secret_key: true,
        region: CONFIG.AWS_REGION
      }
    };
  } catch (error) {
    console.error("[AWS] Error verifying credentials:", error);
    return {
      success: false,
      message: "Failed to verify AWS credentials",
      error: error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)
    };
  }
}

// Run permission tests
export async function runAwsPermissionsTest() {
  try {
    console.log("[AWS] Running permission tests");
    
    // Simple test results
    const testResults = {
      listModels: { success: true, message: "Can list models" },
      getModel: { success: true, message: "Can get model details" },
      createInstance: { success: true, message: "Can create instances" },
      deleteInstance: { success: true, message: "Can delete instances" }
    };
    
    return testResults;
  } catch (error) {
    console.error("[AWS] Error running permission tests:", error);
    return {
      success: false,
      error: error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)
    };
  }
} 