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

// Get the appropriate API URL based on the environment
const getApiUrl = () => {
  return BedrockConfig.edgeFunctionUrl;
};

/**
 * Call the Supabase Edge Function
 * 
 * @param {Object} options - Call options
 * @param {string} options.action - The action to perform
 * @param {Object} options.data - Data to send with the request
 * @param {boolean} options.useMock - Whether to use mock data
 * @returns {Promise<{data: any, error: string|null}>} Function response
 */
const callEdgeFunction = async ({ action, data = {}, useMock = BedrockConfig.useMockData }) => {
  console.log(`[Bedrock] Calling edge function with action: ${action}`, { data, useMock });
  
  // For non-testing/debugging actions, require authentication
  const requiresAuth = !['testEnvironment', 'test'].includes(action);
  
  if (requiresAuth) {
    const token = await getAuthToken();
    if (!token) {
      console.error('[Bedrock] No valid auth token available');
      return { data: null, error: 'Authentication required' };
    }
  }
  
  // Use mock data in development mode if enabled and available
  if (useMock && !BedrockConfig.isProduction && devMockData[action]) {
    console.log(`[Bedrock] Using mock data for action: ${action}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return { data: devMockData[action], error: null };
  }

  try {
    // Get a valid token
    const token = await getAuthToken();
    
    // Determine the API URL
    const apiUrl = getApiUrl();
    
    // Create the properly structured request body
    const requestBody = {
      action: action,
      ...data  // This was spreading data at the top level, causing field name conflicts
    };
    
    // Log complete request details
    console.log(`[Bedrock] Making API request to ${apiUrl}`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : undefined
      },
      body: requestBody
    });
    
    // Make the API call
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(requestBody)
    });
    
    // Parse the response
    const result = await response.json();
    
    // Log response details
    console.log(`[Bedrock] API response for ${action}:`, { 
      status: response.status,
      result: result
    });
    
    if (!response.ok) {
      console.error(`[Bedrock] API error for ${action}:`, result);
      return { 
        data: null, 
        error: result.message || result.error || `API error: ${response.status}` 
      };
    }
    
    return { data: result, error: null };
  } catch (error) {
    console.error(`[Bedrock] Exception during ${action}:`, error);
    return { 
      data: null, 
      error: error.message || 'An unexpected error occurred' 
    };
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
  console.log('[Bedrock] Creating instance with parameters:', modelInfo);
  
  // Validate required fields
  if (!modelInfo.modelId) {
    console.error('[Bedrock] Missing required modelId parameter');
    return { data: null, error: 'modelId is required' };
  }
  
  // Convert 1m/6m commitment duration format to match what the API expects
  const modelData = {
    ...modelInfo,
    // Convert from "1m" or "6m" to the format the API expects
    commitmentDuration: modelInfo.commitmentDuration || "1m"
  };
  
  // Ensure data is properly structured
  return callEdgeFunction({
    action: 'provisionInstance',
    data: modelData
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
  console.log('[Bedrock] Starting AWS permission test');
  try {
    // Never use mock data for permission tests
    const useMock = false;
    
    // First get token to verify authentication
    const token = await getAuthToken();
    if (!token) {
      console.error('[Bedrock] No valid auth token available for AWS permission test');
      return { success: false, error: 'Authentication required' };
    }
    
    console.log('[Bedrock] Auth token obtained, proceeding with test');
    
    // Try to call the edge function with standard client first
    try {
      return await callEdgeFunction({
        action: 'aws-permission-test',
        data: {},
        useMock: false // Explicitly disable mocks for AWS permission tests
      });
    } catch (error) {
      console.error(`[Bedrock] Exception during AWS permission test:`, error);
      return { 
        success: false, 
        error: error.message || 'Error during AWS permission test',
        stack: error.stack,
        name: error.name
      };
    }
  } catch (error) {
    console.error(`[Bedrock] Exception during AWS permission test:`, error);
    return { 
      success: false, 
      error: error.message || 'Error during AWS permission test',
      stack: error.stack,
      name: error.name
    };
  }
};

/**
 * Get all available foundation models from AWS Bedrock
 * 
 * @param {Object} filters - Optional filter parameters
 * @param {string} filters.byProvider - Filter models by provider name
 * @param {string} filters.byOutputModality - Filter models by output modality (TEXT, IMAGE, etc.)
 * @param {string} filters.byInputModality - Filter models by input modality
 * @param {string} filters.byInferenceType - Filter models by inference type (ON_DEMAND, PROVISIONED)
 * @param {string} filters.byCustomizationType - Filter models by customization type (FINE_TUNING, etc.)
 * @returns {Promise<{data: Array, error: string|null}>} Available models or error
 */
const listFoundationModels = async (filters = {}) => {
  console.log('[Bedrock] Fetching available foundation models', filters ? 'with filters:' : '', filters);
  return callEdgeFunction({
    action: 'listFoundationModels',
    data: filters  // Send any filters to the server
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
  testAwsPermissions,
  listFoundationModels
};

export default BedrockClient; 