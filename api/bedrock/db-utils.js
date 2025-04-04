/**
 * Direct Supabase client for Vercel serverless functions 
 * This avoids the complex import chain that was causing issues
 */

import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseKey, logEnvironment } from './env-utils.js';
import * as awsUtils from './aws-utils.js';

// Log environment for debugging
logEnvironment();

// Create a direct Supabase client using environment variables
const supabaseUrl = getSupabaseUrl();
const supabaseKey = getSupabaseKey();

console.log('[API] Supabase config:', { 
  hasUrl: Boolean(supabaseUrl), 
  hasKey: Boolean(supabaseKey), 
  url: supabaseUrl ? `${supabaseUrl.substring(0, 8)}...` : 'missing',
  urlValid: supabaseUrl && supabaseUrl.startsWith('http')
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
    // Validate URL structure before initializing client
    try {
      new URL(supabaseUrl);
      supabase = createClient(supabaseUrl, supabaseKey);
      console.log('[API] Supabase client initialized successfully');
    } catch (urlError) {
      console.error('[API] Invalid Supabase URL format:', urlError.message);
    }
  } else {
    console.warn('[API] Missing or invalid Supabase credentials, using mock data');
    const issues = [];
    if (!supabaseUrl) issues.push('Missing URL');
    if (!supabaseKey) issues.push('Missing key');
    if (supabaseUrl && !supabaseUrl.startsWith('http')) issues.push('URL does not start with http');
    console.warn(`[API] Credential issues: ${issues.join(', ')}`);
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
 * Get all Bedrock instances from the database and AWS
 */
export async function getBedrockInstances() {
  try {
    console.log('[API] Fetching Bedrock instances from database and AWS');
    
    // Try to get instances from AWS Bedrock first
    const awsResult = await awsUtils.listBedrockInstances();
    
    // If AWS call succeeded, use those instances
    if (awsResult.instances && awsResult.instances.length > 0) {
      console.log(`[API] Using ${awsResult.instances.length} instances from AWS Bedrock`);
      
      // If we have a database, sync these instances
      if (supabase) {
        console.log('[API] Syncing AWS instances to database');
        
        // For each AWS instance, make sure it exists in the database
        for (const instance of awsResult.instances) {
          // Check if instance exists in database
          const { data: existingInstance } = await supabase
            .from('bedrock_instances')
            .select('id')
            .eq('id', instance.id)
            .single();
          
          if (!existingInstance) {
            // Insert new instance into database
            await supabase.from('bedrock_instances').insert({
              id: instance.id,
              name: instance.name,
              model_id: instance.modelId,
              throughput_name: instance.throughputName,
              status: instance.status,
              plan: instance.plan,
              created_at: instance.createdAt
            });
          } else {
            // Update existing instance
            await supabase
              .from('bedrock_instances')
              .update({
                name: instance.name,
                model_id: instance.modelId,
                throughput_name: instance.throughputName,
                status: instance.status,
                plan: instance.plan
              })
              .eq('id', instance.id);
          }
        }
      }
      
      return { instances: awsResult.instances, error: null };
    }
    
    // If AWS call failed or returned no instances, fallback to database
    if (supabase) {
      console.log('[API] Falling back to database for instances');
      
      const { data, error } = await supabase
        .from('bedrock_instances')
        .select('*');
      
      if (error) {
        console.error('[API] Error fetching instances from database:', error);
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
      
      console.log(`[API] Retrieved ${instances.length} Bedrock instances from database`);
      return { instances, error: null };
    }
    
    // If neither AWS nor database is available, use mock data
    console.log('[API] Using mock instances');
    return { instances: mockInstances, error: null };
  } catch (error) {
    console.error('[API] Unexpected error fetching instances:', error);
    return { 
      instances: mockInstances,
      error
    };
  }
}

/**
 * Create a new Bedrock instance in AWS and database
 */
export async function createBedrockInstance(data) {
  try {
    console.log('[API] Creating new Bedrock instance in AWS and database:', data);
    
    const { name, modelId, throughputName } = data;
    
    // Validate required fields
    if (!name || !modelId || !throughputName) {
      throw new Error('Missing required fields: name, modelId, throughputName');
    }
    
    // Determine the plan based on the model ID
    const plan = modelToPlan[modelId] || 'starter';
    
    // First try to create the instance in AWS
    const awsResult = await awsUtils.createBedrockInstance(data);
    
    // If AWS creation succeeded, use that instance
    if (awsResult.instance) {
      console.log(`[API] Successfully created instance in AWS: ${awsResult.instance.id}`);
      
      // If we have a database, save it there too
      if (supabase) {
        console.log('[API] Saving AWS instance to database');
        
        const dbData = {
          id: awsResult.instance.id,
          name: awsResult.instance.name,
          model_id: awsResult.instance.modelId,
          throughput_name: awsResult.instance.throughputName,
          status: awsResult.instance.status,
          plan: awsResult.instance.plan,
          created_at: awsResult.instance.createdAt
        };
        
        await supabase.from('bedrock_instances').insert(dbData);
      }
      
      return { instance: awsResult.instance, error: null };
    }
    
    // If AWS creation failed, log error but continue to create a mock or database entry
    console.warn('[API] AWS creation failed, falling back to database:', awsResult.error?.message);
    
    // Create the instance record for database
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
        error: awsResult.error 
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
    
    console.log('[API] Successfully created Bedrock instance in database:', instance.id);
    return { 
      instance, 
      error: awsResult.error ? new Error('Created mock instance due to AWS error: ' + awsResult.error.message) : null 
    };
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
 * Delete a Bedrock instance from AWS and database
 */
export async function deleteBedrockInstance(instanceId) {
  try {
    console.log('[API] Deleting Bedrock instance from AWS and database:', instanceId);
    
    if (!instanceId) {
      throw new Error('Instance ID is required');
    }
    
    // First try to delete from AWS
    const awsResult = await awsUtils.deleteBedrockInstance(instanceId);
    
    // If AWS deletion succeeded or failed due to instance not found, proceed with database deletion
    if (awsResult.success || (awsResult.error && awsResult.error.message.includes('not found'))) {
      console.log(`[API] ${awsResult.success ? 'Successfully deleted' : 'Instance not found in'} AWS`);
      
      // If we have a database connection, delete from there too
      if (supabase) {
        console.log('[API] Deleting instance from database');
        
        const { data, error } = await supabase
          .from('bedrock_instances')
          .delete()
          .eq('id', instanceId);
        
        if (error) {
          console.error('[API] Error deleting from database:', error);
          return { success: awsResult.success, error };
        }
      }
      
      console.log(`[API] Successfully deleted Bedrock instance: ${instanceId}`);
      return { success: true, error: null };
    }
    
    // If AWS deletion failed for other reasons, log error but try database deletion
    console.warn('[API] AWS deletion failed:', awsResult.error?.message);
    
    // Check if Supabase client is available
    if (!supabase) {
      console.log('[API] No Supabase client available, simulating deletion');
      return { success: false, error: awsResult.error };
    }
    
    const { data, error } = await supabase
      .from('bedrock_instances')
      .delete()
      .eq('id', instanceId);
    
    if (error) {
      console.error('[API] Error deleting from database:', error);
      return { success: false, error };
    }
    
    console.log(`[API] Deleted instance from database: ${instanceId}`);
    return { 
      success: true, 
      error: awsResult.error ? new Error('Deleted from database only: ' + awsResult.error.message) : null 
    };
  } catch (error) {
    console.error('[API] Error deleting instance:', error);
    return { success: false, error };
  }
} 