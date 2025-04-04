import { supabase } from './supabase';
import { insertIntoTable, fetchFromTable, updateInTable, deleteFromTable } from './direct-db-access';

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
    
    const { data: result, error } = await insertIntoTable('bedrock_instances', instanceData);
    
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
    
    const { data, error } = await deleteFromTable('bedrock_instances', { id: instanceId });
    
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