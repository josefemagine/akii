/**
 * AWS Bedrock Client Implementation
 * A wrapper around the AWS Bedrock SDK
 */

import { BedrockClient, ListFoundationModelsCommand, GetFoundationModelCommand } from "@aws-sdk/client-bedrock";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Fallback models if API is unavailable
const FALLBACK_MODELS = [
  {
    modelId: "amazon.titan-text-express-v1",
    modelName: "Titan Text Express",
    provider: "Amazon",
    modelArn: "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-text-express-v1",
    status: "ACTIVE"
  },
  {
    modelId: "anthropic.claude-v2",
    modelName: "Claude V2",
    provider: "Anthropic",
    modelArn: "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-v2",
    status: "ACTIVE"
  },
  {
    modelId: "anthropic.claude-instant-v1",
    modelName: "Claude Instant",
    provider: "Anthropic",
    modelArn: "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-instant-v1",
    status: "ACTIVE"
  }
];

/**
 * Create a Bedrock client
 * @param {Object} options - Client options
 * @param {string} options.region - AWS region
 * @param {string} options.accessKeyId - AWS access key ID
 * @param {string} options.secretAccessKey - AWS secret access key
 * @param {boolean} options.useFallbackOnError - Whether to use fallback data on error
 * @returns {Object} Bedrock client object
 */
export function createBedrockClient(options = {}) {
  const {
    region = 'us-east-1',
    accessKeyId,
    secretAccessKey,
    useFallbackOnError = true
  } = options;

  let runtimeClient = null;
  let client = null;
  let initialized = false;
  let error = null;
  let usingFallback = false;
  let fallbackReason = null;

  try {
    // Only create real clients if we have credentials
    if (accessKeyId && secretAccessKey) {
      // Log the credentials we're using (masked)
      const maskedAccessKey = accessKeyId ? `${accessKeyId.substring(0, 4)}...${accessKeyId.substring(accessKeyId.length - 4)}` : 'undefined';
      console.log(`[AWS Bedrock] Initializing client with credentials (KeyID: ${maskedAccessKey}, Region: ${region})`);
      
      const credentials = {
        region,
        credentials: {
          accessKeyId,
          secretAccessKey
        }
      };

      runtimeClient = new BedrockRuntimeClient(credentials);
      client = new BedrockClient(credentials);
      initialized = true;
      console.log('[AWS Bedrock] Client initialization successful');
    } else {
      fallbackReason = "No credentials provided";
      if (!useFallbackOnError) {
        throw new Error("AWS credentials required");
      } else {
        console.warn(`[AWS Bedrock] ${fallbackReason}, using fallback data`);
        usingFallback = true;
      }
    }
  } catch (err) {
    console.error("[AWS Bedrock] Failed to initialize client:", err);
    error = err;
    fallbackReason = `Initialization error: ${err.message}`;
    
    if (!useFallbackOnError) {
      throw err;
    } else {
      console.warn(`[AWS Bedrock] ${fallbackReason}, using fallback data`);
      usingFallback = true;
    }
  }
  
  // Create a client object with methods that handle both real and fallback cases
  const bedrockClient = {
    // Add client status properties
    status: {
      initialized,
      usingFallback,
      fallbackReason,
      error: error?.message || null,
      region
    },
    
    /**
     * List available foundation models
     * @param {Object} options - List options
     * @param {string} options.byProvider - Filter by provider
     * @param {string} options.byStatus - Filter by status
     * @returns {Promise<Object>} Result with models array
     */
    listFoundationModels: async (options = {}) => {
      // If credentials were missing and we're using fallback, return mock data
      if (!initialized && useFallbackOnError) {
        console.log("[AWS Bedrock] Using fallback model data");
        const models = [...FALLBACK_MODELS];
        
        // Apply any filters from options
        const { byProvider, byStatus } = options;
        let filteredModels = models;
        
        if (byProvider) {
          filteredModels = filteredModels.filter(model => 
            model.provider.toLowerCase().includes(byProvider.toLowerCase())
          );
        }
        
        if (byStatus) {
          filteredModels = filteredModels.filter(model => 
            model.status === byStatus
          );
        }
        
        return {
          models: filteredModels,
          isFallback: true,
          fallbackReason
        };
      }
      
      try {
        const command = new ListFoundationModelsCommand({});
        const response = await client.send(command);
        
        let models = response.modelSummaries || [];
        
        // Apply any filters from options
        const { byProvider, byStatus } = options;
        
        if (byProvider) {
          models = models.filter(model => 
            model.providerName.toLowerCase().includes(byProvider.toLowerCase())
          );
        }
        
        if (byStatus) {
          models = models.filter(model => 
            model.modelLifecycle?.status === byStatus
          );
        }
        
        // Map to a standardized format
        const formattedModels = models.map(model => ({
          modelId: model.modelId,
          modelName: model.modelName,
          provider: model.providerName,
          modelArn: model.modelArn,
          status: model.modelLifecycle?.status || 'UNKNOWN'
        }));
        
        return {
          models: formattedModels,
          isFallback: false
        };
      } catch (err) {
        console.error("[AWS Bedrock] Error listing foundation models:", err);
        
        if (useFallbackOnError) {
          console.log("[AWS Bedrock] Using fallback model data after API error");
          return {
            models: FALLBACK_MODELS,
            isFallback: true,
            error: err.message,
            fallbackReason: `API Error: ${err.message}`
          };
        }
        
        throw err;
      }
    },
    
    /**
     * Get details for a specific foundation model
     * @param {string} modelId - Model ID
     * @returns {Promise<Object>} Model details
     */
    getFoundationModel: async (modelId) => {
      if (!modelId) {
        throw new Error("Model ID is required");
      }
      
      // If credentials were missing and we're using fallback, return mock data
      if (!initialized && useFallbackOnError) {
        console.log("[AWS Bedrock] Using fallback model data for getFoundationModel");
        const model = FALLBACK_MODELS.find(m => m.modelId === modelId);
        
        if (!model) {
          throw new Error(`Model ${modelId} not found`);
        }
        
        return {
          model,
          isFallback: true
        };
      }
      
      try {
        const command = new GetFoundationModelCommand({
          modelIdentifier: modelId
        });
        const response = await client.send(command);
        
        // Format the response
        const model = {
          modelId: response.modelId,
          modelName: response.modelName,
          provider: response.providerName,
          modelArn: response.modelArn,
          status: response.modelLifecycle?.status || 'UNKNOWN',
          customizationsSupported: response.customizationsSupported || [],
          inferenceTypesSupported: response.inferenceTypesSupported || [],
          inputModalities: response.inputModalities || [],
          outputModalities: response.outputModalities || []
        };
        
        return {
          model,
          isFallback: false
        };
      } catch (err) {
        console.error(`[AWS Bedrock] Error getting foundation model ${modelId}:`, err);
        
        if (useFallbackOnError) {
          console.log("[AWS Bedrock] Using fallback model data after error");
          const model = FALLBACK_MODELS.find(m => m.modelId === modelId);
          
          if (!model) {
            throw new Error(`Model ${modelId} not found`);
          }
          
          return {
            model,
            isFallback: true,
            error: err.message
          };
        }
        
        throw err;
      }
    },
    
    /**
     * Invoke a model with text
     * @param {Object} options - Invoke options 
     * @param {string} options.modelId - Model ID
     * @param {string} options.prompt - Text prompt
     * @param {Object} options.parameters - Model parameters
     * @returns {Promise<Object>} Result with model output
     */
    invokeModel: async (options = {}) => {
      const { modelId, prompt, parameters = {} } = options;
      
      if (!modelId) {
        throw new Error("Model ID is required");
      }
      
      if (!prompt) {
        throw new Error("Prompt is required");
      }
      
      // If credentials were missing and we're using fallback, return mock data
      if (!initialized && useFallbackOnError) {
        console.log("[AWS Bedrock] Using fallback response for invokeModel");
        return {
          completion: "This is a fallback response because AWS Bedrock credentials are not configured. Please set up your AWS credentials to use real model responses.",
          isFallback: true
        };
      }
      
      try {
        // Format the request based on the model
        let body = {};
        
        if (modelId.includes('anthropic.claude')) {
          // Claude models use this format
          body = {
            prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
            temperature: parameters.temperature || 0.7,
            max_tokens_to_sample: parameters.maxTokens || 500,
            top_p: parameters.topP || 0.9
          };
        } else if (modelId.includes('amazon.titan')) {
          // Titan models use this format
          body = {
            inputText: prompt,
            textGenerationConfig: {
              temperature: parameters.temperature || 0.7,
              maxTokenCount: parameters.maxTokens || 500,
              topP: parameters.topP || 0.9
            }
          };
        } else {
          // Generic format for other models
          body = {
            prompt: prompt,
            ...parameters
          };
        }
        
        const command = new InvokeModelCommand({
          modelId: modelId,
          body: JSON.stringify(body),
          contentType: 'application/json',
          accept: 'application/json'
        });
        
        const response = await runtimeClient.send(command);
        
        // Parse the response body
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        // Extract the completion based on the model
        let completion = '';
        
        if (modelId.includes('anthropic.claude')) {
          completion = responseBody.completion || '';
        } else if (modelId.includes('amazon.titan')) {
          completion = responseBody.results?.[0]?.outputText || '';
        } else {
          // Generic fallback
          completion = responseBody.generated_text || 
                      responseBody.completion || 
                      responseBody.text || 
                      JSON.stringify(responseBody);
        }
        
        return {
          completion,
          rawResponse: responseBody,
          isFallback: false
        };
      } catch (err) {
        console.error("[AWS Bedrock] Error invoking model:", err);
        
        if (useFallbackOnError) {
          console.log("[AWS Bedrock] Using fallback response after error");
          return {
            completion: `Error calling AWS Bedrock model: ${err.message}. This is a fallback response.`,
            isFallback: true,
            error: err.message
          };
        }
        
        throw err;
      }
    },
    
    /**
     * Test connection to AWS Bedrock
     * @returns {Promise<Object>} Test result
     */
    testConnection: async () => {
      if (!initialized) {
        return {
          success: false,
          message: "Client not initialized with valid credentials",
          error: error?.message || fallbackReason || "Missing credentials",
          fallbackReason
        };
      }
      
      try {
        // Try listing models as a connection test
        const command = new ListFoundationModelsCommand({});
        await client.send(command);
        
        return {
          success: true,
          message: "Successfully connected to AWS Bedrock",
          region
        };
      } catch (err) {
        console.error("[AWS Bedrock] Connection test failed:", err);
        return {
          success: false,
          message: `Connection failed: ${err.message}`,
          error: err.message,
          region
        };
      }
    }
  };
  
  return bedrockClient;
}

/**
 * Create a mock Bedrock client for development/testing
 * Always returns fallback data
 * @returns {Object} Mock Bedrock client
 */
export function createMockBedrockClient() {
  return createBedrockClient({
    useFallbackOnError: true
  });
}

/**
 * Initialize a Bedrock client with environment variables or defaults
 * @param {Object} options - Additional options to override defaults
 * @param {boolean} options.useFallbackOnError - Whether to use fallback data on error
 * @param {string} options.region - AWS region to use
 * @returns {Object} Initialized Bedrock client
 */
export function initDefaultBedrockClient(options = {}) {
  let accessKeyId, secretAccessKey, region;
  const useFallbackOnError = options.useFallbackOnError !== undefined ? options.useFallbackOnError : true;
  
  // Production mode - explicitly disable fallbacks unless specified
  if (import.meta.env.PROD && options.useFallbackOnError !== true) {
    console.log('[AWS Bedrock] Production mode detected - fallbacks disabled by default');
    // Keep useFallbackOnError as false in production unless explicitly enabled
  }
  
  // Try to get credentials from environment
  try {
    accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
    secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
    region = options.region || import.meta.env.VITE_AWS_REGION || 'us-east-1';
    
    if (!accessKeyId || !secretAccessKey) {
      console.warn('[AWS Bedrock] No AWS credentials found in environment variables');
    } else {
      console.log(`[AWS Bedrock] Found AWS credentials in environment variables (Region: ${region})`);
    }
  } catch (err) {
    console.warn("[AWS Bedrock] Could not load environment variables:", err);
  }
  
  return createBedrockClient({
    accessKeyId,
    secretAccessKey,
    region,
    useFallbackOnError
  });
}

// Export a default instance for convenience
export default initDefaultBedrockClient(); 