/**
 * Direct Supabase client for Vercel serverless functions 
 * This avoids the complex import chain that was causing issues
 */

import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseKey, logEnvironment } from './env-utils.js';

// Log environment for debugging
logEnvironment();

// Create a direct Supabase client using environment variables
const supabaseUrl = getSupabaseUrl();
const supabaseKey = getSupabaseKey();

console.log('[API] Supabase config:', { 
  hasUrl: Boolean(supabaseUrl), 
  hasKey: Boolean(supabaseKey), 
  url: supabaseUrl ? `${supabaseUrl.substring(0, 8)}...` : 'missing' 
});

// Mock instance functions for when Supabase isn't available
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

// Create the client only if we have valid URLs
let supabase = null;
try {
  if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[API] Supabase client initialized successfully');
  } else {
    console.warn('[API] Missing or invalid Supabase credentials, using mock data');
  }
} catch (error) {
  console.error('[API] Error initializing Supabase client:', error);
}

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
    
    // Check if Supabase client is available
    if (!supabase) {
      console.log('[API] No Supabase client available, using mock data');
      return { instances: mockInstances, error: null };
    }
    
    const { data, error } = await supabase
      .from('bedrock_instances')
      .select('*');
    
    if (error) {
      console.error('[API] Error fetching instances:', error);
      return { instances: mockInstances, error };
    }
    
    // If no data found, return mock instances
    if (!data || data.length === 0) {
      console.log('[API] No instances found in database, using mock data');
      return { instances: mockInstances, error: null };
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
      instances: mockInstances,
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
    
    // Check if Supabase client is available
    if (!supabase) {
      console.log('[API] No Supabase client available, returning mock instance');
      return { 
        instance: {
          id: instanceData.id,
          name: instanceData.name,
          modelId: instanceData.model_id,
          throughputName: instanceData.throughput_name,
          status: instanceData.status,
          createdAt: instanceData.created_at,
          plan: instanceData.plan
        }, 
        error: null 
      };
    }
    
    const { data: result, error } = await supabase
      .from('bedrock_instances')
      .insert(instanceData)
      .select()
      .single();
    
    if (error) {
      console.error('[API] Error creating instance in database:', error);
      // Return a mock instance as fallback
      return { 
        instance: {
          id: instanceData.id,
          name: instanceData.name,
          modelId: instanceData.model_id,
          throughputName: instanceData.throughput_name,
          status: instanceData.status,
          createdAt: instanceData.created_at,
          plan: instanceData.plan
        }, 
        error 
      };
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
    // Create a fallback instance with the data we have
    const fallbackInstance = {
      id: `instance-${Date.now()}`,
      name: data.name || 'Unknown',
      modelId: data.modelId || 'unknown-model',
      throughputName: data.throughputName || 'standard-throughput',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      plan: data.modelId ? (modelToPlan[data.modelId] || 'starter') : 'starter'
    };
    
    return { 
      instance: fallbackInstance, 
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
    
    // Check if Supabase client is available
    if (!supabase) {
      console.log('[API] No Supabase client available, simulating deletion');
      return { success: true, error: null };
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