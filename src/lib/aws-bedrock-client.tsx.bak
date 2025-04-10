import React from "react";
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
 * @returns {Object} Bedrock client object
 */
export function createBedrockClient(options = {}) {
  const {
    region = 'us-east-1',
    accessKeyId,
    secretAccessKey
  } = options;

  let runtimeClient = null;
  let client = null;
  let initialized = false;
  let error = null;

  try {
    // Require real credentials
    if (!accessKeyId || !secretAccessKey) {
      throw new Error("AWS credentials are required. Missing access key ID or secret access key.");
    }
    
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
  } catch (err) {
    console.error('[AWS Bedrock] Client initialization failed:', err);
    error = err;
  }

  // Status object for client
  const clientStatus = {
    initialized,
    success: initialized,
    error: error ? error.message : null,
    message: error ? error.message : 'AWS Bedrock client initialized successfully',
    credentials: {
      region,
      hasAccessKey: Boolean(accessKeyId),
      hasSecretKey: Boolean(secretAccessKey)
    }
  };

  const bedrockClient = {
    // Add client status properties
    clientStatus,
    
    /**
     * List available foundation models
     * @param {Object} options - Options for listing models
     * @returns {Promise<Object>} Found models
     */
    listFoundationModels: async (options = {}) => {
      if (!initialized) {
        throw new Error("AWS Bedrock client not initialized: " + (error ? error.message : "Unknown error"));
      }
      
      try {
        const command = new ListFoundationModelsCommand({
          byProvider: options.byProvider,
          byOutputModality: options.byOutputModality,
          byInferenceType: options.byInferenceType
        });
        const response = await client.send(command);
        
        // Format the response
        const models = (response.modelSummaries || []).map(model => ({
          modelId: model.modelId,
          modelName: model.modelName || model.modelId,
          provider: model.providerName || 'Unknown',
          modelArn: model.modelArn,
          status: model.modelLifecycle?.status || 'UNKNOWN',
          customizationsSupported: model.customizationsSupported || [],
          inferenceTypesSupported: model.inferenceTypesSupported || [],
          inputModalities: model.inputModalities || [],
          outputModalities: model.outputModalities || []
        }));
        
        return {
          models,
          isFallback: false
        };
      } catch (err) {
        console.error('[AWS Bedrock] Error listing foundation models:', err);
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
      
      if (!initialized) {
        throw new Error("AWS Bedrock client not initialized: " + (error ? error.message : "Unknown error"));
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
        throw err;
      }
    },
    
    /**
     * Invoke a Bedrock model
     * @param {Object} options - Options for invoking the model
     * @param {string} options.modelId - Model ID
     * @param {string} options.prompt - Prompt to send to the model
     * @param {Object} options.parameters - Additional parameters for the model
     * @returns {Promise<Object>} Model response
     */
    invokeModel: async (options = {}) => {
      const { modelId, prompt, parameters = {} } = options;
      
      if (!modelId) {
        throw new Error("Model ID is required");
      }
      
      if (!prompt) {
        throw new Error("Prompt is required");
      }
      
      if (!initialized) {
        throw new Error("AWS Bedrock client not initialized: " + (error ? error.message : "Unknown error"));
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
        const responseBody = new TextDecoder().decode(response.body);
        let parsedResponse;
        
        try {
          parsedResponse = JSON.parse(responseBody);
        } catch (parseError) {
          console.error('[AWS Bedrock] Error parsing response JSON:', parseError);
          return {
            completion: responseBody,
            rawResponse: responseBody,
            parseError: true
          };
        }
        
        // Extract the completion based on the model type
        let completion = '';
        
        if (modelId.includes('anthropic.claude')) {
          completion = parsedResponse.completion || '';
        } else if (modelId.includes('amazon.titan')) {
          completion = parsedResponse.results ? parsedResponse.results[0]?.outputText || '' : '';
        } else {
          // Generic extraction, take the whole response
          completion = responseBody;
        }
        
        return {
          completion,
          rawResponse: parsedResponse,
          isFallback: false
        };
      } catch (err) {
        console.error('[AWS Bedrock] Error invoking model:', err);
        throw err;
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
interface FALLBACK_MODELSProps {}

    
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