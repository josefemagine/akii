// AWS Bedrock Integration using the official AWS SDK
import { CONFIG } from "./config.ts";

// Import AWS SDK for Bedrock - more focused import
import { 
  BedrockClient, 
  ListFoundationModelsCommand,
  CreateProvisionedModelThroughputCommand,
  GetProvisionedModelThroughputCommand,
  DeleteProvisionedModelThroughputCommand,
  ListProvisionedModelThroughputsCommand,
  CommitmentDuration
} from "@aws-sdk/client-bedrock";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Initialize the Bedrock client properly for production
function getBedrockClient() {
  console.log("[AWS] Initializing Bedrock client with region:", CONFIG.AWS_REGION);
  
  // For production, ensure we have the required credentials and they're properly formatted
  if (!CONFIG.AWS_ACCESS_KEY_ID) {
    throw new Error("AWS_ACCESS_KEY_ID is not configured");
  }
  
  if (!CONFIG.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS_SECRET_ACCESS_KEY is not configured");
  }
  
  // Validate the format of AWS credentials
  if (!CONFIG.AWS_ACCESS_KEY_ID.startsWith('AKIA')) {
    throw new Error("AWS_ACCESS_KEY_ID appears to be invalid. It should start with 'AKIA'");
  }
  
  if (CONFIG.AWS_SECRET_ACCESS_KEY.length < 30) {
    throw new Error("AWS_SECRET_ACCESS_KEY appears to be too short");
  }
  
  console.log(`[AWS] Credentials validated: ACCESS KEY ID ${CONFIG.AWS_ACCESS_KEY_ID.substring(0, 4)}... (${CONFIG.AWS_ACCESS_KEY_ID.length} chars), SECRET KEY present (${CONFIG.AWS_SECRET_ACCESS_KEY.length} chars)`);
  
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
  
  // For production, use the same validation as the Bedrock client
  if (!CONFIG.AWS_ACCESS_KEY_ID) {
    throw new Error("AWS_ACCESS_KEY_ID is not configured");
  }
  
  if (!CONFIG.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS_SECRET_ACCESS_KEY is not configured");
  }
  
  // Validate the format of AWS credentials
  if (!CONFIG.AWS_ACCESS_KEY_ID.startsWith('AKIA')) {
    throw new Error("AWS_ACCESS_KEY_ID appears to be invalid. It should start with 'AKIA'");
  }
  
  if (CONFIG.AWS_SECRET_ACCESS_KEY.length < 30) {
    throw new Error("AWS_SECRET_ACCESS_KEY appears to be too short");
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

// List all foundation models when provisioned model list is requested
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
  error?: string,
  note?: string
}> {
  try {
    console.log(`[AWS] Listing provisioned model throughputs`);

    // Create the client
    const client = getBedrockClient();
    
    try {
      // Use ListProvisionedModelThroughputsCommand
      console.log("[AWS] Sending ListProvisionedModelThroughputsCommand");
      const command = new ListProvisionedModelThroughputsCommand({});
      const result = await client.send(command);

      console.log(`[AWS] Got throughputs result:`, result);

      if (result.provisionedModelSummaries && result.provisionedModelSummaries.length > 0) {
        // Map the result to our expected format
        const instances = result.provisionedModelSummaries.map(model => {
          // Extract model ID from modelArn (e.g., 'arn:aws:bedrock:us-west-2:123456789012:provisioned-model/modelId')
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
        // Fall back to listing foundation models if no provisioned models exist
        console.log("[AWS] No provisioned models found, fetching foundation models instead");
        return await listFoundationModelsAsFallback();
      }
    } catch (error) {
      console.error("[AWS] Error listing provisioned models, falling back to foundation models:", error);
      return await listFoundationModelsAsFallback();
    }
  } catch (error) {
    console.error("[AWS] Error in listProvisionedModelThroughputs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Fallback function to list foundation models if no provisioned models exist
async function listFoundationModelsAsFallback() {
  try {
    console.log(`[AWS] Listing foundation models as fallback`);

    // Create the client
    const client = getBedrockClient();
    
    // Use ListFoundationModelsCommand as fallback
    console.log("[AWS] Sending ListFoundationModelsCommand");
    const command = new ListFoundationModelsCommand({});
    const result = await client.send(command);

    console.log(`[AWS] Got foundation models result: ${result.modelSummaries?.length || 0} models found`);

    // Map the result to our expected format
    const instances = (result.modelSummaries || []).map(model => ({
      provisionedModelArn: model.modelArn || `arn:aws:bedrock:${CONFIG.AWS_REGION}:model/${model.modelId}`,
      modelId: model.modelId || "unknown",
      provisionedModelStatus: "AVAILABLE", // Foundation models are generally available
      provisionedThroughput: {
        commitmentDuration: "ONE_MONTH",
        provisionedModelThroughput: 1
      },
      creationTime: new Date().toISOString()
    }));

    return {
      success: true,
      instances,
      note: "These are foundation models. No provisioned models found."
    };
  } catch (error) {
    console.error("[AWS] Error in foundation models fallback:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Create a provisioned model - Using the command pattern properly
export async function createProvisionedModelThroughput(params: {
  modelId: string,
  commitmentDuration: string,
  modelUnits: number
}) {
  try {
    console.log(`[AWS] Creating provisioned model for ${params.modelId}`);
    const client = getBedrockClient();
    
    // Generate a unique name for the provisioned model
    const modelName = `model-${params.modelId.split('/').pop()}-${Date.now()}`;
    
    // Convert string commitment duration to enum value expected by AWS SDK
    // Valid values are "ONE_MONTH" | "SIX_MONTHS"
    let commitmentDurationEnum: CommitmentDuration;
    if (params.commitmentDuration === "1m") {
      commitmentDurationEnum = CommitmentDuration.ONE_MONTH;
    } else if (params.commitmentDuration === "6m") {
      commitmentDurationEnum = CommitmentDuration.SIX_MONTHS;
    } else {
      // Default to one month if unrecognized
      console.warn(`[AWS] Unrecognized commitment duration: ${params.commitmentDuration}. Using ONE_MONTH.`);
      commitmentDurationEnum = CommitmentDuration.ONE_MONTH;
    }
    
    // For debugging purposes, log the exact parameters we're using
    console.log(`[AWS] Creating provisioned model with params:`, {
      modelId: params.modelId,
      provisionedModelName: modelName,
      commitmentDuration: commitmentDurationEnum,
      modelUnits: params.modelUnits
    });
    
    // Create and send the command
    const command = new CreateProvisionedModelThroughputCommand({
      modelId: params.modelId,
      provisionedModelName: modelName,
      commitmentDuration: commitmentDurationEnum,
      modelUnits: params.modelUnits
    });
    
    console.log("[AWS] Command created, sending to AWS");
    const result = await client.send(command);
    
    console.log(`[AWS] Created provisioned model:`, result);
    
    return {
      success: true,
      instance: {
        modelId: params.modelId,
        commitmentDuration: params.commitmentDuration,
        provisionedModelThroughput: params.modelUnits,
        provisionedModelArn: result.provisionedModelArn || ''
      },
      instance_id: result.provisionedModelArn || ''
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
    const client = getBedrockClient();
    
    // Use GetProvisionedModelThroughputCommand
    const command = new GetProvisionedModelThroughputCommand({
      provisionedModelId: provisionedModelId
    });
    
    console.log("[AWS] Sending GetProvisionedModelThroughputCommand");
    const result = await client.send(command);
    
    console.log(`[AWS] Got provisioned model details:`, result);
    
    // Extract model ID from modelArn (e.g., 'arn:aws:bedrock:us-west-2:123456789012:provisioned-model/modelId')
    const modelIdMatch = (result.modelArn || '').match(/model\/([^\/]+)$/);
    const extractedModelId = modelIdMatch ? modelIdMatch[1] : '';
    
    return {
      success: true,
      instance: {
        provisionedModelArn: provisionedModelId,
        modelId: extractedModelId,
        provisionedModelStatus: result.status || "UNKNOWN",
        provisionedThroughput: {
          commitmentDuration: result.commitmentDuration || "ONE_MONTH",
          provisionedModelThroughput: result.modelUnits || 1
        },
        creationTime: result.creationTime instanceof Date ? 
          result.creationTime.toISOString() : 
          typeof result.creationTime === 'string' ? 
            result.creationTime : 
            new Date().toISOString()
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
    const client = getBedrockClient();
    
    // Use DeleteProvisionedModelThroughputCommand
    const command = new DeleteProvisionedModelThroughputCommand({
      provisionedModelId: provisionedModelId
    });
    
    console.log("[AWS] Sending DeleteProvisionedModelThroughputCommand");
    const result = await client.send(command);
    
    console.log(`[AWS] Deleted provisioned model:`, result);
    
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

// Verify AWS credentials functionality
export async function verifyAwsCredentials() {
  try {
    console.log('Verifying AWS Credentials');
    
    // Check if AWS credentials are configured
    if (!CONFIG.AWS_ACCESS_KEY_ID || !CONFIG.AWS_SECRET_ACCESS_KEY || !CONFIG.AWS_REGION) {
      return {
        success: false,
        message: "AWS credentials are not properly configured",
        details: {
          hasRegion: Boolean(CONFIG.AWS_REGION),
          hasAccessKey: Boolean(CONFIG.AWS_ACCESS_KEY_ID),
          hasSecretKey: Boolean(CONFIG.AWS_SECRET_ACCESS_KEY),
          useRealAws: true // Always using real AWS now
        }
      };
    }
    
    // Create a Bedrock client to test credentials
    const bedrockClient = getBedrockClient();
    
    // List foundation models as a simple call to verify credentials
    try {
      const command = new ListFoundationModelsCommand({});
      const response = await bedrockClient.send(command);
      
      return {
        success: true,
        message: "AWS credentials verified successfully",
        details: {
          models: response?.modelSummaries?.length || 0,
          firstModel: response?.modelSummaries && response.modelSummaries.length > 0 
            ? response.modelSummaries[0].modelId 
            : null
        }
      };
    } catch (error) {
      console.error('Error verifying AWS credentials:', error);
      return {
        success: false,
        message: "AWS credentials failed verification",
        error: error instanceof Error ? error.message : String(error),
        details: {
          errorType: error instanceof Error ? error.name : 'UnknownError',
          credentialsProvided: true
        }
      };
    }
  } catch (error) {
    console.error('Exception during AWS credential verification:', error);
    return {
      success: false,
      message: "Exception during AWS credential verification",
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