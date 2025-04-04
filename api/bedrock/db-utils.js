/**
 * Direct Supabase client for Vercel serverless functions 
 * This avoids the complex import chain that was causing issues
 */

import { createClient } from '@supabase/supabase-js';

// Create a direct Supabase client using environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// Create the client
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Model mapping for Bedrock instances
 */
export const modelToPlan = {
  'amazon.titan-text-lite-v1': 'starter',
  'amazon.titan-text-express-v1': 'pro',
  'anthropic.claude-instant-v1': 'business'
};

/**
 * Bedrock instance utility functions
 */

/**
 * Get all Bedrock instances from the database
 */
export async function getBedrockInstances() {
  try {
    console.log('[API] Fetching Bedrock instances from database');
    
    const { data, error } = await supabase
      .from('bedrock_instances')
      .select('*');
    
    if (error) {
      console.error('[API] Error fetching instances:', error);
      return { instances: [], error };
    }
    
    // Map database fields to API response format
    const instances = data.map(instance => ({
      id: instance.id,
      name: instance.name,
      modelId: instance.model_id,
      throughputName: instance.throughput_name || 'standard-throughput',
      status: instance.status,
      createdAt: instance.created_at,
      plan: instance.plan
    }));
    
    console.log(`[API] Retrieved ${instances.length} Bedrock instances`);
    return { instances, error: null };
  } catch (error) {
    console.error('[API] Unexpected error fetching instances:', error);
    return { 
      instances: [],
      error
    };
  }
}

/**
 * Create a new Bedrock instance in the database
 */
export async function createBedrockInstance(data) {
  try {
    console.log('[API] Creating new Bedrock instance:', data);
    
    const { name, modelId, throughputName } = data;
    
    // Validate required fields
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
    
    const { data: result, error } = await supabase
      .from('bedrock_instances')
      .insert(instanceData)
      .select()
      .single();
    
    if (error) {
      console.error('[API] Error creating instance in database:', error);
      return { instance: null, error };
    }
    
    // Map database fields to API response format
    const instance = {
      id: result.id,
      name: result.name,
      modelId: result.model_id,
      throughputName: result.throughput_name || 'standard-throughput',
      status: result.status,
      createdAt: result.created_at,
      plan: result.plan
    };
    
    console.log('[API] Successfully created Bedrock instance:', instance.id);
    return { instance, error: null };
  } catch (error) {
    console.error('[API] Error creating instance:', error);
    return { 
      instance: null, 
      error 
    };
  }
}

/**
 * Delete a Bedrock instance from the database
 */
export async function deleteBedrockInstance(instanceId) {
  try {
    console.log('[API] Deleting Bedrock instance:', instanceId);
    
    if (!instanceId) {
      throw new Error('Instance ID is required');
    }
    
    const { data, error } = await supabase
      .from('bedrock_instances')
      .delete()
      .eq('id', instanceId);
    
    if (error) {
      console.error('[API] Error deleting instance from database:', error);
      return { success: false, error };
    }
    
    console.log('[API] Successfully deleted instance:', instanceId);
    return { success: true, error: null };
  } catch (error) {
    console.error('[API] Error deleting instance:', error);
    return { 
      success: false, 
      error 
    };
  }
} 