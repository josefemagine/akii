import { _supabase } from './supabase.js';
import { insertIntoTable, fetchFromTable, _updateInTable, deleteFromTable } from './direct-db-access.js';
import { createClient } from '@supabase/supabase-js';
import supabaseSingleton from './supabase-singleton';

/**
 * Model mapping for Bedrock instances
 */
export const modelToPlan = {
  'amazon.titan-text-lite-v1': 'starter',
  'amazon.titan-text-express-v1': 'pro',
  'anthropic.claude-instant-v1': 'business'
};

/**
 * Fetch all Bedrock instances from the database
 * @returns {Promise<{instances: Array, error: Error|null}>}
 */
export async function getBedrockInstances() {
  try {
    console.log('Fetching Bedrock instances from database');
    
    const { data, error } = await fetchFromTable('bedrock_instances');
    
    if (error) {
      console.error('Error fetching Bedrock instances:', error);
      return { instances: [], error };
    }
    
    // Map database fields to API response format
    const instances = data.map(instance => ({
      id: instance.id,
      name: instance.name,
      modelId: instance.model_id,
      throughputName: instance.throughput_name,
      status: instance.status,
      createdAt: instance.created_at,
      plan: instance.plan
    }));
    
    console.log(`Retrieved ${instances.length} Bedrock instances`);
    return { instances, error: null };
  } catch (e) {
    console.error('Unexpected error fetching Bedrock instances:', e);
    return { 
      instances: [],
      error: e instanceof Error ? e : new Error(String(e))
    };
  }
}

/**
 * Create a new Bedrock instance
 * @param {Object} data - Instance data
 * @param {string} data.name - Instance name
 * @param {string} data.modelId - Model ID
 * @param {string} data.throughputName - Throughput name
 * @returns {Promise<{instance: Object|null, error: Error|null}>}
 */
export async function createBedrockInstance(data) {
  try {
    console.log('Creating new Bedrock instance:', data);
    
    const { name, modelId, throughputName } = data;
    
    if (!name || !modelId || !throughputName) {
      throw new Error('Missing required fields: name, modelId, throughputName');
    }
    
    // Determine the plan based on the model ID
    const plan = modelToPlan[modelId] || 'starter';
    
    // Create the instance record
    const instanceData = {
      id: `instance-${Date.now()}`,
      name,
      model_id: modelId,
      throughput_name: throughputName,
      status: 'Pending',
      plan,
      created_at: new Date().toISOString()
    };
    
    const { data: _result, error } = await insertIntoTable('bedrock_instances', instanceData);
    
    if (error) {
      console.error('Error creating Bedrock instance:', error);
      return { instance: null, error };
    }
    
    // Map database record to API response format
    const instance = {
      id: instanceData.id,
      name: instanceData.name,
      modelId: instanceData.model_id,
      throughputName: instanceData.throughput_name,
      status: instanceData.status,
      createdAt: instanceData.created_at,
      plan: instanceData.plan
    };
    
    console.log('Successfully created Bedrock instance:', instance.id);
    return { instance, error: null };
  } catch (e) {
    console.error('Unexpected error creating Bedrock instance:', e);
    return { 
      instance: null,
      error: e instanceof Error ? e : new Error(String(e))
    };
  }
}

/**
 * Delete a Bedrock instance
 * @param {string} instanceId - Instance ID to delete
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function deleteBedrockInstance(instanceId) {
  try {
    console.log('Deleting Bedrock instance:', instanceId);
    
    if (!instanceId) {
      throw new Error('Instance ID is required');
    }
    
    const { data: _data, error } = await deleteFromTable('bedrock_instances', { id: instanceId });
    
    if (error) {
      console.error('Error deleting Bedrock instance:', error);
      return { success: false, error };
    }
    
    console.log('Successfully deleted Bedrock instance:', instanceId);
    return { success: true, error: null };
  } catch (e) {
    console.error('Unexpected error deleting Bedrock instance:', e);
    return { 
      success: false,
      error: e instanceof Error ? e : new Error(String(e))
    };
  }
}

/**
 * Initialize the Supabase client for Bedrock operations
 * @param {Object} options - Initialization options
 * @returns {Object} The initialized client
 */
export function initBedrockDbClient(options = {}) {
  if (supabaseSingleton) {
    return supabaseSingleton;
  }
  
  if (_supabase) {
    return _supabase;
  }
  
  const { supabaseUrl, supabaseKey } = options;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in initBedrockDbClient');
    return null;
  }
  
  try {
    console.warn('[Bedrock DB] Creating temporary Supabase client. This may cause GoTrueClient duplication warnings.');
    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Error initializing Supabase client for Bedrock:', error);
    return null;
  }
}

/**
 * Fetch Bedrock AWS credentials from the database
 * @param {Object} options - Options including user ID and Supabase client
 * @returns {Promise<Object>} The AWS credentials
 */
export async function fetchBedrockCredentials(options = {}) {
  const { 
    userId,
    supabaseClient = null,
    useLocalClient = true
  } = options;
  
  if (!userId) {
    console.error('User ID is required to fetch Bedrock credentials');
    return {
      error: 'User ID is required',
      credentials: null
    };
  }
  
  try {
    const client = supabaseClient || (useLocalClient ? (supabaseSingleton || _supabase) : null);
    
    const { data: _data, error } = await getFromTable(
      'bedrock_credentials',
      ['aws_access_key_id', 'aws_secret_access_key', 'aws_region'],
      { user_id: userId },
      client,
      useLocalClient
    );
    
    if (error) throw error;
    
    if (!_data || _data.length === 0) {
      console.log('No Bedrock credentials found for user', userId);
      return {
        error: 'No credentials found',
        credentials: null
      };
    }
    
    const credentials = {
      accessKeyId: _data[0].aws_access_key_id,
      secretAccessKey: _data[0].aws_secret_access_key,
      region: _data[0].aws_region || 'us-east-1'
    };
    
    return {
      error: null,
      credentials
    };
  } catch (error) {
    console.error('Error fetching Bedrock credentials:', error);
    return {
      error: error.message || 'Failed to fetch credentials',
      credentials: null
    };
  }
}

/**
 * Store Bedrock instance in the database
 * @param {Object} options - Options including instance details
 * @returns {Promise<Object>} Result of the operation
 */
export async function storeBedrockInstance(options = {}) {
  const {
    userId,
    instanceId,
    modelId,
    status = 'creating',
    commitmentDuration = 'ONE_MONTH',
    modelUnits = 1,
    supabaseClient = null,
    useLocalClient = true
  } = options;
  
  if (!userId || !instanceId || !modelId) {
    console.error('Missing required parameters for storing Bedrock instance');
    return {
      error: 'Missing required parameters (userId, instanceId, modelId)',
      success: false
    };
  }
  
  try {
    const _result = await insertIntoTable(
      'bedrock_instances',
      {
        user_id: userId,
        instance_id: instanceId,
        model_id: modelId,
        status,
        commitment_duration: commitmentDuration,
        model_units: modelUnits,
        created_at: new Date().toISOString()
      },
      supabaseClient,
      useLocalClient
    );
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error storing Bedrock instance:', error);
    return {
      error: error.message || 'Failed to store Bedrock instance',
      success: false
    };
  }
}

/**
 * Record Bedrock usage in the database
 * @param {Object} options - Usage details
 * @returns {Promise<Object>} Result of the operation
 */
export async function recordBedrockUsage(options = {}) {
  const {
    userId,
    instanceId,
    modelId,
    tokensUsed = 0,
    promptTokens = 0,
    completionTokens = 0,
    cost = 0,
    supabaseClient = null,
    useLocalClient = true
  } = options;
  
  if (!userId) {
    console.error('Missing userId in recordBedrockUsage');
    return { success: false, error: 'Missing userId' };
  }
  
  if (!instanceId && !modelId) {
    console.error('Missing both instanceId and modelId in recordBedrockUsage');
    return { success: false, error: 'Missing model identification' };
  }
  
  try {
    const _data = await insertIntoTable(
      'bedrock_usage',
      {
        user_id: userId,
        instance_id: instanceId,
        model_id: modelId,
        tokens_used: tokensUsed,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        cost,
        timestamp: new Date().toISOString()
      },
      supabaseClient,
      useLocalClient
    );
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error recording Bedrock usage:', error);
    return {
      success: false,
      error: error.message || 'Error recording usage'
    };
  }
}

/**
 * Get AWS credentials for Bedrock
 * @returns {Promise<Object>} AWS credentials
 */
export async function getAwsCredentials() {
  // This is a placeholder - in a real app, you'd get these from a secure source
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  };
}

/**
 * Initialize the Bedrock client with AWS credentials
 * @param {Object} options - Initialization options
 * @returns {Promise<Object>} Initialization result
 */
export async function initializeBedrock(supabaseClient, initOptions = {}) {
  console.log("[Bedrock] Initializing Bedrock client with options:", initOptions);
  
  try {
    // Retrieve AWS credentials from the database or API
    const credentials = await getAwsCredentials();
    
    // Check if we have valid credentials
    if (!credentials || credentials.error) {
      console.error("[Bedrock] Failed to get AWS credentials:", credentials?.error);
      return { success: false, error: credentials?.error || "Failed to get AWS credentials" };
    }
    
    console.log("[Bedrock] AWS credentials retrieved successfully");
    return { success: true, credentials };
  } catch (error) {
    console.error("[Bedrock] Error initializing Bedrock:", error);
    return { success: false, error: error.message || "Error initializing Bedrock" };
  }
} 