/**
 * AWS Bedrock client utilities for provisioning and managing Bedrock resources
 */

import { getBedrockApiKey, getAwsAccessKeyId, getAwsSecretAccessKey, getAwsRegion } from './env-utils.js';

// Check if we're in a Node.js environment (for AWS SDK import)
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

// Import AWS SDK dynamically to avoid issues in browser environments
let BedrockClient, ListProvisionedModelThroughputsCommand, 
    CreateProvisionedModelThroughputCommand, DeleteProvisionedModelThroughputCommand,
    GetProvisionedModelThroughputCommand;

// Initialize client only in Node environment
let bedrockClient = null;

// Map of throughput names to commitment durations and capacities
const throughputConfigs = {
  'starter-throughput': { commitmentDuration: 'MONTHLY', capacity: 1 },
  'pro-throughput': { commitmentDuration: 'MONTHLY', capacity: 2 },
  'business-throughput': { commitmentDuration: 'MONTHLY', capacity: 5 }
};

// Initialize AWS SDK and client
async function initAwsClient() {
  if (!isNode) {
    console.warn('[AWS] Cannot initialize AWS SDK in browser environment');
    return null;
  }
  
  try {
    // Get AWS credentials from environment variables using utility functions
    const awsRegion = getAwsRegion();
    const accessKeyId = getAwsAccessKeyId();
    const secretAccessKey = getAwsSecretAccessKey();
    
    console.log(`[AWS] Initializing AWS SDK with region: ${awsRegion}`);
    console.log(`[AWS] Access key provided: ${Boolean(accessKeyId)}, Secret key provided: ${Boolean(secretAccessKey)}`);
    
    // Check if credentials are available
    if (!accessKeyId || !secretAccessKey) {
      console.error('[AWS] Missing AWS credentials');
      return null;
    }
    
    // Dynamic import of AWS SDK to avoid issues in browser environments
    const { BedrockRuntime } = await import('@aws-sdk/client-bedrock-runtime');
    const sdkModule = await import('@aws-sdk/client-bedrock');
    
    // Assign SDK components
    BedrockClient = sdkModule.BedrockClient;
    ListProvisionedModelThroughputsCommand = sdkModule.ListProvisionedModelThroughputsCommand;
    CreateProvisionedModelThroughputCommand = sdkModule.CreateProvisionedModelThroughputCommand;
    DeleteProvisionedModelThroughputCommand = sdkModule.DeleteProvisionedModelThroughputCommand;
    GetProvisionedModelThroughputCommand = sdkModule.GetProvisionedModelThroughputCommand;
    
    // Initialize AWS Bedrock client with credentials from environment variables
    bedrockClient = new BedrockClient({
      region: awsRegion,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
    
    console.log(`[AWS] AWS Bedrock client initialized successfully for region ${awsRegion}`);
    return bedrockClient;
  } catch (error) {
    console.error('[AWS] Error initializing AWS SDK:', error);
    return null;
  }
}

/**
 * Get all provisioned Bedrock model throughputs
 */
export async function listBedrockInstances() {
  try {
    // Initialize client if needed
    if (!bedrockClient) {
      await initAwsClient();
    }
    
    // If client initialization failed, return empty result
    if (!bedrockClient) {
      console.warn('[AWS] Bedrock client not available, cannot list instances');
      return { instances: [], error: new Error('AWS Bedrock client not available') };
    }
    
    console.log('[AWS] Listing Bedrock provisioned throughputs');
    const command = new ListProvisionedModelThroughputsCommand({});
    const response = await bedrockClient.send(command);
    
    // Transform response to our API format
    const instances = response.provisionedModelThroughputs.map(instance => ({
      id: instance.provisionedModelId,
      name: instance.provisionedModelName,
      modelId: instance.modelId,
      throughputName: `${instance.provisionedThroughput?.provisionedModelThroughput}-throughput`,
      status: instance.provisionedModelThroughputStatus,
      createdAt: instance.creationTime,
      plan: instance.tags?.plan || getModelPlan(instance.modelId)
    }));
    
    console.log(`[AWS] Retrieved ${instances.length} Bedrock instances from AWS`);
    return { instances, error: null };
  } catch (error) {
    console.error('[AWS] Error listing Bedrock instances from AWS:', error);
    return { instances: [], error };
  }
}

/**
 * Create a new provisioned Bedrock model throughput
 */
export async function createBedrockInstance(data) {
  try {
    // Initialize client if needed
    if (!bedrockClient) {
      await initAwsClient();
    }
    
    // If client initialization failed, return error
    if (!bedrockClient) {
      console.warn('[AWS] Bedrock client not available, cannot create instance');
      return { instance: null, error: new Error('AWS Bedrock client not available') };
    }
    
    const { name, modelId, throughputName } = data;
    
    // Validate required fields
    if (!name || !modelId || !throughputName) {
      const error = new Error('Missing required fields');
      return { instance: null, error };
    }
    
    // Get throughput configuration based on selected throughput name
    const throughputConfig = throughputConfigs[throughputName] || 
      { commitmentDuration: 'MONTHLY', capacity: 1 };
    
    // Determine plan based on model or throughput
    const plan = getModelPlan(modelId);
    
    console.log(`[AWS] Creating Bedrock instance: ${name}, model: ${modelId}, plan: ${plan}`);
    
    // Prepare AWS command
    const command = new CreateProvisionedModelThroughputCommand({
      modelId,
      provisionedModelName: name,
      provisionedThroughput: {
        commitmentDuration: throughputConfig.commitmentDuration,
        provisionedModelThroughput: throughputConfig.capacity
      },
      tags: { plan }
    });
    
    // Call AWS to create the instance
    const response = await bedrockClient.send(command);
    
    // Transform response to our API format
    const instance = {
      id: response.provisionedModelId,
      name,
      modelId,
      throughputName,
      status: 'Creating', // Initial status
      createdAt: new Date().toISOString(),
      plan
    };
    
    console.log(`[AWS] Successfully created Bedrock instance: ${instance.id}`);
    return { instance, error: null };
  } catch (error) {
    console.error('[AWS] Error creating Bedrock instance in AWS:', error);
    return { instance: null, error };
  }
}

/**
 * Delete a provisioned Bedrock model throughput
 */
export async function deleteBedrockInstance(instanceId) {
  try {
    // Initialize client if needed
    if (!bedrockClient) {
      await initAwsClient();
    }
    
    // If client initialization failed, return error
    if (!bedrockClient) {
      console.warn('[AWS] Bedrock client not available, cannot delete instance');
      return { success: false, error: new Error('AWS Bedrock client not available') };
    }
    
    if (!instanceId) {
      return { success: false, error: new Error('Instance ID is required') };
    }
    
    console.log(`[AWS] Deleting Bedrock instance: ${instanceId}`);
    
    // Prepare AWS command
    const command = new DeleteProvisionedModelThroughputCommand({
      provisionedModelId: instanceId
    });
    
    // Call AWS to delete the instance
    await bedrockClient.send(command);
    
    console.log(`[AWS] Successfully deleted Bedrock instance: ${instanceId}`);
    return { success: true, error: null };
  } catch (error) {
    console.error('[AWS] Error deleting Bedrock instance in AWS:', error);
    return { success: false, error };
  }
}

/**
 * Get details for a specific Bedrock instance
 */
export async function getBedrockInstance(instanceId) {
  try {
    // Initialize client if needed
    if (!bedrockClient) {
      await initAwsClient();
    }
    
    // If client initialization failed, return error
    if (!bedrockClient) {
      console.warn('[AWS] Bedrock client not available, cannot get instance details');
      return { instance: null, error: new Error('AWS Bedrock client not available') };
    }
    
    if (!instanceId) {
      return { instance: null, error: new Error('Instance ID is required') };
    }
    
    console.log(`[AWS] Getting Bedrock instance details: ${instanceId}`);
    
    // Prepare AWS command
    const command = new GetProvisionedModelThroughputCommand({
      provisionedModelId: instanceId
    });
    
    // Call AWS to get the instance details
    const response = await bedrockClient.send(command);
    
    // Transform response to our API format
    const instance = {
      id: response.provisionedModelId,
      name: response.provisionedModelName,
      modelId: response.modelId,
      throughputName: `${response.provisionedThroughput?.provisionedModelThroughput}-throughput`,
      status: response.provisionedModelThroughputStatus,
      createdAt: response.creationTime,
      plan: response.tags?.plan || getModelPlan(response.modelId)
    };
    
    console.log(`[AWS] Retrieved details for Bedrock instance: ${instanceId}`);
    return { instance, error: null };
  } catch (error) {
    console.error('[AWS] Error getting Bedrock instance details from AWS:', error);
    return { instance: null, error };
  }
}

/**
 * Map model IDs to plan types
 */
export function getModelPlan(modelId) {
  const planMap = {
    'amazon.titan-text-lite-v1': 'starter',
    'amazon.titan-text-express-v1': 'pro',
    'anthropic.claude-instant-v1': 'business',
    'anthropic.claude-v2': 'business'
  };
  
  return planMap[modelId] || 'starter';
}

// Initialize the client on module import
initAwsClient(); 