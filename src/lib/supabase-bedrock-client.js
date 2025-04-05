/**
 * Supabase Bedrock API Client
 * This client handles communication with Bedrock API endpoints 
 * through Supabase Edge Functions, using JWT authentication only.
 */

import { BedrockConfig } from './bedrock-config';
// Import the singleton Supabase client
import supabase from './supabase-client';
// Import diagnostic tool in development mode only
import { runClientDiagnostic } from './detect-client-duplicates';

// Run the diagnostic in development mode to detect any duplicate clients
if (BedrockConfig.isLocalDevelopment && process.env.NODE_ENV !== 'production') {
  console.log('[Bedrock] Checking for duplicate Supabase clients...');
  try {
    runClientDiagnostic();
  } catch (err) {
    console.warn('[Bedrock] Could not run client diagnostic:', err);
  }
}

/**
 * Get Supabase auth session with JWT token
 * @returns {Promise<Object|null>} Session object or null if not authenticated
 */
const getAuthSession = async () => {
  try {
    // Get current session using the singleton client
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[Bedrock] Error getting auth session:', error.message);
      return null;
    }
    
    if (!session) {
      console.error('[Bedrock] No active session found. User is not authenticated.');
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('[Bedrock] Failed to get auth session:', error);
    return null;
  }
};

/**
 * Get JWT token for authentication
 * @returns {Promise<string|null>} JWT token or null if not authenticated
 */
const getAuthToken = async () => {
  const session = await getAuthSession();
  return session?.access_token || null;
};

/**
 * Check if token is close to expiring and needs refresh
 * @param {Object} session - The current session
 * @returns {boolean} True if token needs refresh
 */
const needsTokenRefresh = (session) => {
  if (!session?.expires_at) return false;
  
  const expiresAt = new Date(session.expires_at * 1000); // Convert to milliseconds
  const now = new Date();
  const timeUntilExpiry = expiresAt.getTime() - now.getTime();
  
  return timeUntilExpiry < BedrockConfig.auth.refreshTokenThreshold;
};

/**
 * Refresh the auth token if needed
 * @returns {Promise<string|null>} Fresh JWT token or null if refresh failed
 */
const refreshTokenIfNeeded = async () => {
  try {
    const session = await getAuthSession();
    
    if (!session) return null;
    
    // Check if token needs refresh
    if (needsTokenRefresh(session)) {
      console.log('[Bedrock] Token is about to expire, refreshing...');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('[Bedrock] Error refreshing token:', error.message);
        return null;
      }
      
      return data.session?.access_token || null;
    }
    
    return session.access_token;
  } catch (error) {
    console.error('[Bedrock] Error during token refresh:', error);
    return null;
  }
};

/**
 * Check if user is authenticated with a valid token
 * @returns {Promise<boolean>} True if authenticated with valid token
 */
const isAuthenticated = async () => {
  const token = await refreshTokenIfNeeded();
  return !!token;
};

/**
 * Validate API configuration and connectivity
 * @returns {boolean} True if API is properly configured
 */
const validateApiConfiguration = () => {
  if (!BedrockConfig.edgeFunctionName) {
    console.error('[Bedrock] Edge function name is not configured.');
    return false;
  }
  
  return true;
};

/**
 * Development mock data for testing without a live Edge Function
 * This is only used in development mode when edge functions are unavailable
 */
const devMockData = {
  // Mock response for listInstances with empty instances array
  listInstances: {
    instances: []
  },
  // Mock response for testEnvironment
  testEnvironment: {
    apiVersion: "1.0.0",
    environment: "development",
    awsRegion: "us-east-1",
    auth: "OK",
    timestamp: new Date().toISOString(),
  },
  // Mock response for provisionInstance
  provisionInstance: {
    instance: {
      id: 3,
      instance_id: "ti-" + Math.random().toString(16).slice(2, 10),
      model_id: "amazon.titan-text-express-v1",
      commitment_duration: "ONE_MONTH",
      model_units: 2,
      status: "CREATING",
      created_at: new Date().toISOString(),
      deleted_at: null
    }
  },
  // Mock response for deleteInstance
  deleteInstance: {
    success: true
  },
  // Mock response for invokeModel
  invokeModel: {
    response: "This is a mock response from the AI model.",
    usage: {
      input_tokens: 10,
      output_tokens: 8,
      total_tokens: 18
    }
  },
  // Mock response for getUsageStats
  getUsageStats: {
    usage: {
      total_tokens: 0,
      input_tokens: 0,
      output_tokens: 0,
      instances: []
    },
    limits: {
      max_tokens: 10000,
      usage_percentage: 0
    }
  }
};

/**
 * Call the edge function directly using fetch as a fallback
 * This is used when the Supabase client's invoke method fails due to CORS issues
 */
const callEdgeFunctionDirect = async (functionName, action, data, token) => {
  try {
    const url = `${BedrockConfig.edgeFunctionUrl}`;
    
    console.log(`[Bedrock] Trying direct fetch to: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action,
        data
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Bedrock] Direct fetch error (${response.status}):`, errorText);
      return { data: null, error: `API error: ${response.status} ${errorText}` };
    }
    
    const responseData = await response.json();
    
    if (responseData?.error) {
      console.error(`[Bedrock] API error in direct fetch for action ${action}:`, responseData.error);
      return { data: null, error: responseData.error };
    }
    
    return { data: responseData, error: null };
  } catch (error) {
    console.error(`[Bedrock] Exception in direct fetch for action ${action}:`, error);
    return { data: null, error: error.message || 'Error in direct fetch' };
  }
};

/**
 * Call Supabase Edge Function with JWT auth
 * @param {Object} options - Function call options
 * @param {string} options.functionName - Edge function name
 * @param {string} options.action - Action to perform
 * @param {Object} options.data - Data to send
 * @param {boolean} options.useMock - Force use mock data
 * @returns {Promise<{data: any, error: string|null}>} Response or error
 */
const callEdgeFunction = async ({ 
  functionName = BedrockConfig.edgeFunctionName,
  action,
  data = {},
  useMock = false
}) => {
  // Check for mock mode via environment variable
  const useMockFromEnv = import.meta.env.VITE_USE_MOCK_SUPER_ACTION === 'true' || 
                          (typeof window !== 'undefined' && window.USE_MOCK_SUPER_ACTION === 'true');
  
  // Validate API config
  if (!validateApiConfiguration()) {
    return { data: null, error: 'API configuration invalid' };
  }
  
  // Use mock data in development, if force-enabled with useMock, or if env variable is set
  if ((BedrockConfig.isLocalDevelopment && BedrockConfig.useMockData) || useMock || useMockFromEnv) {
    console.log(`[Bedrock] Using mock data for action: ${action}`);
    console.log(`[Bedrock] useMock:${useMock}, useMockFromEnv:${useMockFromEnv}`);
    
    // Mock data delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return appropriate mock data based on action
    if (devMockData[action]) {
      return { data: devMockData[action], error: null };
    } else {
      console.warn(`[Bedrock] No mock data available for action: ${action}`);
      return { data: null, error: 'No mock data for this action' };
    }
  }
  
  try {
    // Get and refresh auth token if needed
    const token = await refreshTokenIfNeeded();
    
    if (!token) {
      console.error('[Bedrock] Authentication required. No valid token available.');
      return { data: null, error: 'Authentication required' };
    }
    
    try {
      // First try the standard Supabase client method
      const { data: responseData, error } = await supabase.functions.invoke(functionName, {
        body: { action, data }
      });
      
      if (error) {
        console.error(`[Bedrock] Error invoking ${functionName} for action ${action}:`, error);
        // If this fails, we will try the direct fetch approach below
        throw new Error(error.message || 'Edge function error');
      }
      
      return { data: responseData, error: null };
    } catch (error) {
      console.warn(`[Bedrock] Falling back to direct fetch for action ${action} due to error: ${error.message}`);
      // Try direct fetch as fallback when Supabase client fails (often due to CORS)
      return await callEdgeFunctionDirect(functionName, action, data, token);
    }
  } catch (error) {
    console.error(`[Bedrock] Exception calling edge function for action ${action}:`, error);
    return { data: null, error: error.message || 'Unknown error calling edge function' };
  }
};

/**
 * Get all Bedrock instances for the authenticated user
 * @returns {Promise<{data: Array, error: string|null}>} Bedrock instances or error
 */
const listInstances = async () => {
  return callEdgeFunction({
    action: 'listInstances'
  });
};

/**
 * Create a new Bedrock instance
 * 
 * @param {Object} modelInfo - Instance configuration
 * @param {string} modelInfo.modelId - The model ID
 * @param {string} modelInfo.commitmentDuration - Commitment duration
 * @param {number} modelInfo.modelUnits - Number of model units
 * @returns {Promise<{data: Object, error: string|null}>} New instance or error
 */
const createInstance = async (modelInfo) => {
  return callEdgeFunction({
    action: 'provisionInstance',
    data: modelInfo
  });
};

/**
 * Delete a Bedrock instance
 * 
 * @param {string} instanceId - ID of the instance to delete
 * @returns {Promise<{data: Object, error: string|null}>} Success status or error
 */
const deleteInstance = async (instanceId) => {
  return callEdgeFunction({
    action: 'deleteInstance',
    data: { instanceId }
  });
};

/**
 * Test API environment and configuration
 * @returns {Promise<{data: Object, error: string|null}>} Environment diagnostics or error
 */
const testEnvironment = async () => {
  return callEdgeFunction({
    action: 'testEnvironment'
  });
};

/**
 * Send a message to a Bedrock AI model
 * 
 * @param {Object} options - Invoke options
 * @param {number} options.instance_id - Instance ID
 * @param {string} options.prompt - The message to send
 * @param {number} options.max_tokens - Maximum tokens to generate
 * @returns {Promise<{data: Object, error: string|null}>} AI response or error
 */
const invokeModel = async ({ instance_id, prompt, max_tokens = 500 }) => {
  return callEdgeFunction({
    action: 'invokeModel',
    data: { 
      instance_id, 
      prompt, 
      max_tokens 
    }
  });
};

/**
 * Get usage statistics for Bedrock instances
 * 
 * @param {Object} options - Optional parameters
 * @param {number} options.instance_id - Optional instance ID to filter stats
 * @param {string} options.timeframe - Optional timeframe (day, week, month, year)
 * @returns {Promise<{data: Object, error: string|null}>} Usage statistics or error
 */
const getUsageStats = async (options = {}) => {
  return callEdgeFunction({
    action: 'getUsageStats',
    data: options
  });
};

/**
 * Test AWS permissions for different Bedrock operations
 * 
 * @returns {Promise<{success: boolean, test_results: Object, error: string|null}>} Test results or error
 */
const testAwsPermissions = async () => {
  return callEdgeFunction({
    action: 'aws-permission-test',
    data: {}
  });
};

// Expose client functions
export const BedrockClient = {
  // Authentication
  getAuthSession,
  getAuthToken,
  refreshTokenIfNeeded,
  isAuthenticated,
  validateApiConfiguration,
  
  // API operations
  callEdgeFunction,
  listInstances,
  createInstance,
  deleteInstance,
  testEnvironment,
  invokeModel,
  getUsageStats,
  testAwsPermissions
};

export default BedrockClient; 