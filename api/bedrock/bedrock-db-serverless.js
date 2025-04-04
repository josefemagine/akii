/**
 * Simplified Bedrock database module for Vercel serverless functions
 * This version works without requiring direct database access
 */

/**
 * Model mapping for Bedrock instances
 */
export const modelToPlan = {
  'amazon.titan-text-lite-v1': 'starter',
  'amazon.titan-text-express-v1': 'pro',
  'anthropic.claude-instant-v1': 'business'
};

// Mock data for serverless environments where DB access isn't available
const mockInstances = [
  {
    id: "instance-1",
    name: "Production Titan Express",
    modelId: "amazon.titan-text-express-v1",
    throughputName: "pro-throughput",
    status: "InService",
    createdAt: new Date().toISOString(),
    plan: "pro"
  },
  {
    id: "instance-2",
    name: "Production Claude",
    modelId: "anthropic.claude-instant-v1",
    throughputName: "business-throughput",
    status: "InService",
    createdAt: new Date().toISOString(),
    plan: "business"
  }
];

// In-memory store for this instance of the serverless function
let serverlessInstances = [...mockInstances];

/**
 * Fetch all Bedrock instances 
 * For serverless functions without DB access
 */
export async function getBedrockInstances() {
  try {
    console.log('[Serverless] Fetching Bedrock instances');
    return { instances: serverlessInstances, error: null };
  } catch (e) {
    console.error('[Serverless] Error fetching instances:', e);
    return { 
      instances: mockInstances,
      error: e instanceof Error ? e : new Error(String(e))
    };
  }
}

/**
 * Create a new Bedrock instance
 * For serverless functions without DB access
 */
export async function createBedrockInstance(data) {
  try {
    console.log('[Serverless] Creating new Bedrock instance:', data);
    
    const { name, modelId, throughputName } = data;
    
    if (!name || !modelId || !throughputName) {
      throw new Error('Missing required fields: name, modelId, throughputName');
    }
    
    // Determine the plan based on the model ID
    const plan = modelToPlan[modelId] || 'starter';
    
    // Create the instance
    const instance = {
      id: `instance-${Date.now()}`,
      name,
      modelId,
      throughputName,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      plan
    };
    
    // Add to in-memory store (will be lost when function exits)
    serverlessInstances.push(instance);
    
    console.log('[Serverless] Successfully created Bedrock instance:', instance.id);
    return { instance, error: null };
  } catch (e) {
    console.error('[Serverless] Error creating instance:', e);
    return { 
      instance: null,
      error: e instanceof Error ? e : new Error(String(e))
    };
  }
}

/**
 * Delete a Bedrock instance
 * For serverless functions without DB access
 */
export async function deleteBedrockInstance(instanceId) {
  try {
    console.log('[Serverless] Deleting Bedrock instance:', instanceId);
    
    if (!instanceId) {
      throw new Error('Instance ID is required');
    }
    
    // Remove from in-memory store (will be reset when function exits)
    serverlessInstances = serverlessInstances.filter(instance => instance.id !== instanceId);
    
    console.log('[Serverless] Successfully deleted Bedrock instance (serverless mode)');
    return { success: true, error: null };
  } catch (e) {
    console.error('[Serverless] Error deleting instance:', e);
    return { 
      success: false,
      error: e instanceof Error ? e : new Error(String(e))
    };
  }
} 