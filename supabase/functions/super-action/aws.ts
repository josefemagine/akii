// AWS Bedrock Integration using the official AWS SDK
import { CONFIG } from "./config.ts";

// Import AWS SDK for Bedrock
import {
  BedrockClient,
  ListFoundationModelsCommand
} from "@aws-sdk/client-bedrock";

import {
  BedrockRuntimeClient,
  InvokeModelCommand
} from "@aws-sdk/client-bedrock-runtime";

// Initialize the Bedrock client properly for production
function getBedrockClient() {
  console.log("[AWS] Initializing Bedrock client with region:", CONFIG.AWS_REGION);
  
  // For production, ensure we have the required credentials
  if (!CONFIG.AWS_ACCESS_KEY_ID || !CONFIG.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS credentials are not properly configured. Both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set.");
  }
  
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

function getBedrockRuntimeClient() {
  console.log("[AWS] Initializing BedrockRuntime client with region:", CONFIG.AWS_REGION);
  
  // For production, ensure we have the required credentials
  if (!CONFIG.AWS_ACCESS_KEY_ID || !CONFIG.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS credentials are not properly configured. Both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set.");
  }
  
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

// List provisioned models
export async function listProvisionedModelThroughputs(): Promise<{
  success: boolean,
  instances?: Array<{
    provisionedModelArn: string,
    modelId: string,
    provisionedModelStatus: string,
    provisionedThroughput: {
      commitmentDuration: string,
      provisionedModelThroughput: number
    },
    creationTime: string
  }>,
  error?: string
}> {
  try {
    console.log(`[AWS] Listing provisioned models with client config: region=${CONFIG.AWS_REGION}`);

    // Create the client
    const client = getBedrockClient();
    
    // Use the ListFoundationModelsCommand for AWS Bedrock
    console.log("[AWS] Sending ListFoundationModelsCommand");
    const command = new ListFoundationModelsCommand({});
    const result = await client.send(command);

    console.log(`[AWS] Got result: ${result.modelSummaries?.length || 0} models found`);

    // Map the result to our expected format
    const instances = result.modelSummaries?.map(model => ({
      provisionedModelArn: model.modelArn || `arn:aws:bedrock:${CONFIG.AWS_REGION}:model/${model.modelId}`,
      modelId: model.modelId || "unknown",
      provisionedModelStatus: "ACTIVE",
      provisionedThroughput: {
        commitmentDuration: "1m",
        provisionedModelThroughput: 1
      },
      creationTime: new Date().toISOString()
    })) || [];

    return {
      success: true,
      instances: instances
    };
  } catch (error) {
    console.error("[AWS] Error listing provisioned models:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Create a provisioned model
export async function createProvisionedModelThroughput(params: {
  modelId: string,
  commitmentDuration: string,
  modelUnits: number
}) {
  try {
    console.log(`[AWS] Creating provisioned model for ${params.modelId}`);

    // Create a unique ID for this instance that we'll track in our database
    const instanceId = `arn:aws:bedrock:${CONFIG.AWS_REGION}:custom:model/${params.modelId.split('/').pop()}-${Date.now()}`;
    
    // Integration with real AWS API would go here
    // This is a placeholder until you have the exact API commands for provisioned throughput

    return {
      success: true,
      instance: {
        modelId: params.modelId,
        commitmentDuration: params.commitmentDuration,
        provisionedModelThroughput: params.modelUnits,
        provisionedModelArn: instanceId
      },
      instance_id: instanceId
    };
  } catch (error) {
    console.error("[AWS] Error creating provisioned model:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Get a specific provisioned model
export async function getProvisionedModelThroughput(provisionedModelId: string) {
  try {
    console.log(`[AWS] Getting provisioned model ${provisionedModelId}`);

    // Implement the actual AWS API call when available
    // This is a placeholder
    const modelId = provisionedModelId.split('/').pop() || '';
    
    return {
      success: true,
      instance: {
        provisionedModelArn: provisionedModelId,
        modelId: modelId,
        provisionedModelStatus: "ACTIVE",
        provisionedThroughput: {
          commitmentDuration: "1m",
          provisionedModelThroughput: 1
        },
        creationTime: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`[AWS] Error getting provisioned model ${provisionedModelId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Delete a provisioned model
export async function deleteProvisionedModelThroughput(provisionedModelId: string) {
  try {
    console.log(`[AWS] Deleting provisioned model ${provisionedModelId}`);

    // Implement the actual AWS API call when available
    // This is a placeholder
    
    return {
      success: true,
      result: {
        success: true,
        provisionedModelArn: provisionedModelId,
        status: "DELETED"
      }
    };
  } catch (error) {
    console.error(`[AWS] Error deleting provisioned model ${provisionedModelId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Invoke a model to generate AI text
export async function invokeBedrockModel({
  instanceId,
  prompt,
  maxTokens = 500,
  temperature = 0.7,
  topP = 0.9,
  stopSequences = []
}) {
  try {
    console.log(`[AWS] Invoking model ${instanceId}`);

    // Prepare request body based on the model type
    const requestBody = {
      prompt,
      max_tokens_to_sample: maxTokens,
      temperature,
      top_p: topP,
      stop_sequences: stopSequences
    };

    const client = getBedrockRuntimeClient();
    const command = new InvokeModelCommand({
      modelId: instanceId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(requestBody)
    });

    const response = await client.send(command);

    // Convert response body to string and parse JSON
    const responseBody = new TextDecoder().decode(response.body);
    const responseData = JSON.parse(responseBody);

    // Extract response text based on model output format
    const responseText = responseData.completion || responseData.text || responseData.generation;

    // Calculate tokens (AWS doesn't provide token usage directly)
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(responseText.length / 4);

    return {
      success: true,
      response: responseText,
      usage: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens
      }
    };
  } catch (error) {
    console.error("[AWS] Error invoking model:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Get usage statistics for Bedrock instances
export async function getBedrockUsageStats(options = {}) {
  try {
    console.log(`[AWS] Getting usage statistics`);

    // First, get the list of instances
    const instancesResponse = await listProvisionedModelThroughputs();

    if (!instancesResponse.success) {
      throw new Error(instancesResponse.error || "Failed to list instances for usage statistics");
    }

    const instances = instancesResponse.instances || [];

    // AWS doesn't provide a direct API for token usage, so we'll estimate based on instance count
    // In a real implementation, you'd connect to AWS Cost Explorer API
    const usageData = instances.map(instance => ({
      instance_id: instance.provisionedModelArn || 'unknown',
      total_tokens: 0,
      input_tokens: 0,
      output_tokens: 0
    }));

    // Calculate total usage
    const totalUsage = usageData.reduce(
      (acc, cur) => {
        acc.total_tokens += cur.total_tokens;
        acc.input_tokens += cur.input_tokens;
        acc.output_tokens += cur.output_tokens;
        return acc;
      },
      { total_tokens: 0, input_tokens: 0, output_tokens: 0 }
    );

    return {
      success: true,
      usage: {
        total_tokens: totalUsage.total_tokens,
        input_tokens: totalUsage.input_tokens,
        output_tokens: totalUsage.output_tokens,
        instances: usageData
      },
      limits: {
        max_tokens: 100000, // Placeholder value
        usage_percentage: totalUsage.total_tokens / 1000
      }
    };
  } catch (error) {
    console.error("[AWS] Error getting usage statistics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 