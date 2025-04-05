/**
 * Supabase Bedrock API Client
 * This client handles communication with Bedrock API endpoints,
 * using proper authentication through Supabase JWT tokens.
 * The client uses Supabase Edge Functions invoke API with proper JWT authentication.
 */

import { BedrockConfig } from './bedrock-config';
// Import the singleton Supabase client instead of creating a new one
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
 * Get the API key for Bedrock requests
 * Prefers localStorage saved key, falls back to environment variable
 */
const getApiKey = () => {
  // Check for saved API key in localStorage first
  const savedKey = localStorage.getItem('bedrock-api-key');
  
  if (savedKey) {
    console.log('[Bedrock] Using saved API key from localStorage');
    return savedKey;
  }
  
  // Otherwise use the environment variable
  return BedrockConfig.apiKey || '';
};

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
  // Mock response for listInstances
  listInstances: {
    instances: [
      {
        id: 1,
        instance_id: "ti-123456789abcdef",
        model_id: "amazon.titan-text-lite-v1",
        commitment_duration: "ONE_MONTH",
        model_units: 1,
        status: "INSERVICE",
        created_at: new Date().toISOString(),
        deleted_at: null
      },
      {
        id: 2,
        instance_id: "ti-987654321fedcba",
        model_id: "amazon.titan-text-express-v1",
        commitment_duration: "ONE_MONTH",
        model_units: 2,
        status: "CREATING",
        created_at: new Date().toISOString(),
        deleted_at: null
      }
    ]
  },
  // Mock response for testEnv
  testEnv: {
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
  }
};

/**
 * Unified edge function invocation with enhanced error handling and auth management
 * 
 * @param {Object} options - Function call options
 * @param {string} options.functionName - Edge function name (defaults to BedrockConfig.edgeFunctionName)
 * @param {Object} options.payload - Payload to send to the function
 * @param {boolean} options.requireAuth - Whether authentication is required (defaults to BedrockConfig.auth.requireAuth)
 * @param {boolean} options.useApiKey - Whether to include API key in the payload
 * @param {string} options.action - The action to perform (required)
 * @param {boolean} options.useMock - Whether to use mock data in development (defaults to false)
 * @returns {Promise<{data: any, error: string|null}>} Response data or error
 */
const callEdgeFunction = async ({ 
  functionName = BedrockConfig.edgeFunctionName,
  payload = {},
  requireAuth = BedrockConfig.auth.requireAuth,
  useApiKey = true,
  action,
  useMock = false
}) => {
  if (!action) {
    console.error('[Bedrock] Missing required action parameter');
    return { data: null, error: 'Missing required action parameter' };
  }
  
  // Use mock data in development mode if requested or if devUseMockApi is true in the config
  const shouldUseMock = (useMock || (BedrockConfig.isLocalDevelopment && BedrockConfig.devUseMockApi === true));
  
  // If in development and using mock data, return mock data immediately
  if (shouldUseMock) {
    console.log(`[Bedrock] Using MOCK data for action: ${action}`);
    
    // Add small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data for the requested action
    if (devMockData[action]) {
      return { data: devMockData[action], error: null };
    } else {
      console.warn(`[Bedrock] No mock data available for action: ${action}`);
      return { data: null, error: `No mock data available for action: ${action}` };
    }
  }
  
  try {
    if (!validateApiConfiguration()) {
      throw new Error('API is not properly configured');
    }
    
    // Authentication check if required
    if (requireAuth) {
      // First refresh token if needed
      await refreshTokenIfNeeded();
      
      // Then verify authentication
      const isUserAuthenticated = await isAuthenticated();
      if (!isUserAuthenticated) {
        throw new Error('User is not authenticated. Please sign in to access this feature.');
      }
    }
    
    // Final payload preparation
    const finalPayload = { 
      ...payload, 
      action 
    };
    
    // Add API key if needed
    if (useApiKey) {
      const apiKey = getApiKey();
      if (apiKey) {
        finalPayload.apiKey = apiKey;
      }
    }
    
    console.log(`[Bedrock] Invoking edge function '${functionName}' with action: ${action}`);
    
    let response;
    
    // In local development with a proxy URL, use direct fetch with auth header
    if (BedrockConfig.isLocalDevelopment && BedrockConfig.edgeFunctionUrl.startsWith('/api/')) {
      // Get auth token for the request
      const authToken = await getAuthToken();
      
      // Make direct fetch call to the proxy URL
      const fetchResponse = await fetch(BedrockConfig.edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(finalPayload),
      });
      
      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        
        // If in development and hitting 404 errors, suggest using mock data
        if (BedrockConfig.isLocalDevelopment && (fetchResponse.status === 404 || fetchResponse.status === 403)) {
          console.warn('[Bedrock] Edge function not available in development. Consider using mock data with useMock:true');
          console.warn('[Bedrock] Or add devUseMockApi:true to BedrockConfig to always use mock data in development');
          
          // If configured to fall back to mock data, do so
          if (BedrockConfig.devFallbackToMock) {
            console.log('[Bedrock] Falling back to mock data due to Edge Function error');
            
            if (devMockData[action]) {
              return { data: devMockData[action], error: null };
            }
          }
        }
        
        throw new Error(`Edge Function Error (${fetchResponse.status}): ${errorText}`);
      }
      
      response = { data: await fetchResponse.json(), error: null };
    } else {
      // Use Supabase client for regular edge function invocation
      response = await supabase.functions.invoke(functionName, {
        body: finalPayload
      });
      
      if (response.error) {
        // Enhanced authentication error handling
        if (response.error.message?.includes('JWT') || 
            response.error.message?.includes('auth') || 
            response.error.message?.includes('unauthorized') || 
            response.error.status === 401) {
          
          // Specific error messaging for authentication issues
          if (response.error.message?.includes('expired')) {
            throw new Error('Your authentication session has expired. Please sign in again.');
          } else {
            throw new Error(`Authentication error: ${response.error.message}. Please sign in again.`);
          }
        }
        
        // Specific error handling for common errors
        if (response.error.status === 404) {
          // If in development and the edge function is not found, suggest using mock data
          if (BedrockConfig.isLocalDevelopment && BedrockConfig.devFallbackToMock) {
            console.log('[Bedrock] Edge function not found, falling back to mock data');
            
            if (devMockData[action]) {
              return { data: devMockData[action], error: null };
            }
          }
          
          throw new Error(`Edge function '${functionName}' not found. Please check your deployment.`);
        } else if (response.error.status === 500) {
          throw new Error(`Server error: ${response.error.message}. The edge function encountered an internal error.`);
        } else if (response.error.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        throw new Error(`Edge Function Error: ${response.error.message}`);
      }
    }
    
    return { data: response.data, error: null };
  } catch (error) {
    console.error(`[Bedrock] Error invoking function (${action}):`, error);
    
    // If in development and configured to fall back to mock data on error, do so
    if (BedrockConfig.isLocalDevelopment && BedrockConfig.devFallbackToMock && devMockData[action]) {
      console.log('[Bedrock] Falling back to mock data due to error');
      return { data: devMockData[action], error: null };
    }
    
    return { data: null, error: error.message };
  }
};

/**
 * Get a list of all Bedrock model throughput instances
 */
const listInstances = async () => {
  try {
    const { data, error } = await callEdgeFunction({
      action: 'listInstances'
    });
    
    if (error) {
      throw new Error(error);
    }
    
    return { instances: data?.instances || [], error: null };
  } catch (error) {
    console.error('[Bedrock] Error listing instances:', error);
    return { instances: [], error: error.message };
  }
};

/**
 * Create a new Bedrock model throughput instance
 * @param {Object} modelInfo - Model information including modelId, commitmentDuration, modelUnits
 */
const createInstance = async (modelInfo) => {
  try {
    const { data, error } = await callEdgeFunction({
      action: 'provisionInstance', 
      payload: { modelInfo }
    });
    
    if (error) {
      throw new Error(error);
    }
    
    return { instance: data?.instance, error: null };
  } catch (error) {
    console.error('[Bedrock] Error creating instance:', error);
    return { instance: null, error: error.message };
  }
};

/**
 * Delete a Bedrock model throughput instance
 * @param {string} instanceId - The instance ID to delete
 */
const deleteInstance = async (instanceId) => {
  try {
    const { data, error } = await callEdgeFunction({
      action: 'deleteInstance', 
      payload: { instanceId }
    });
    
    if (error) {
      throw new Error(error);
    }
    
    return { success: data?.success, error: null };
  } catch (error) {
    console.error('[Bedrock] Error deleting instance:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test API environment and connectivity
 */
const testEnvironment = async () => {
  try {
    const { data, error } = await callEdgeFunction({
      action: 'testEnv'
    });
    
    if (error) {
      throw new Error(error);
    }
    
    return { 
      environment: data, 
      error: null 
    };
  } catch (error) {
    console.error('[Bedrock] Error testing environment:', error);
    return { 
      environment: null, 
      error: error.message
    };
  }
};

// Export all client functions
export const BedrockClient = {
  listInstances,
  createInstance,
  deleteInstance,
  testEnvironment,
  getApiKey,
  getAuthToken,
  getAuthSession,
  refreshTokenIfNeeded,
  isAuthenticated,
  validateApiConfiguration,
  callEdgeFunction
};

export default BedrockClient; 