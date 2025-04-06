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
  try {
    const session = await getAuthSession();
    
    if (!session) {
      console.error('[Bedrock] No active session found for authentication');
      return null;
    }
    
    // If there's an access_token in the session, use it
    if (session.access_token) {
      // Add debug logging
      console.log('[Bedrock] Found access_token in session');
      
      // Check if token is about to expire and try to refresh
      if (needsTokenRefresh(session)) {
        console.log('[Bedrock] Token needs refresh, attempting to refresh');
        try {
          const { data, error } = await supabase.auth.refreshSession();
          
          if (error) {
            console.error('[Bedrock] Error refreshing token:', error.message);
            // Return the original token as fallback
            return session.access_token;
          }
          
          // Use the new token if refresh succeeded
          const newToken = data.session?.access_token || session.access_token;
          console.log('[Bedrock] Token refreshed successfully');
          return newToken;
        } catch (refreshError) {
          console.error('[Bedrock] Exception during token refresh:', refreshError);
          // Return the original token as fallback
          return session.access_token;
        }
      }
      
      return session.access_token;
    }
    
    // If there's an access token in localStorage (legacy support), use it
    const localToken = localStorage.getItem('supabase.auth.token');
    if (localToken) {
      try {
        const tokenData = JSON.parse(localToken);
        if (tokenData.access_token) {
          console.log('[Bedrock] Using access token from localStorage');
          return tokenData.access_token;
        }
      } catch (e) {
        console.error('[Bedrock] Error parsing token from localStorage:', e);
      }
    }
    
    console.error('[Bedrock] No access token found in session or localStorage');
    return null;
  } catch (error) {
    console.error('[Bedrock] Error getting auth token:', error);
    return null;
  }
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
 * Check if user is authenticated with a valid token
 * @returns {Promise<boolean>} True if authenticated with valid token
 */
const isAuthenticated = async () => {
  const token = await getAuthToken();
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
    
    console.log(`[Bedrock] Calling direct fetch to: ${url} with action: ${action}`);
    console.log(`[Bedrock] Edge function URL: ${BedrockConfig.edgeFunctionUrl}`);
    console.log(`[Bedrock] Edge function name: ${BedrockConfig.edgeFunctionName}`);
    
    // Ensure the request body is properly formatted with action in the body
    const requestBody = {
      action: action,
      data: data
    };
    
    console.log(`[Bedrock] Request payload:`, JSON.stringify(requestBody));
    
    // Add debugging for auth header
    if (token) {
      console.log(`[Bedrock] Auth token available (length: ${token.length})`);
      // Log the first and last 5 characters of the token for debugging
      console.log(`[Bedrock] Token: ${token.substring(0, 5)}...${token.substring(token.length - 5)}`);
    } else {
      console.warn(`[Bedrock] No auth token available for ${action}`);
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : undefined
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Bedrock] Direct fetch error (${response.status}):`, errorText);
      
      try {
        // Try to parse the error as JSON
        const errorJson = JSON.parse(errorText);
        return { data: null, error: errorJson.error || errorJson.message || `API error: ${response.status}` };
      } catch (_e) { // eslint-disable-line no-unused-vars
        // If not JSON, return the raw error text
        return { data: null, error: `API error: ${response.status} ${errorText}` };
      }
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
 * Add special handling for specific error types to improve the user experience
 * @param {string} errorText - The error text from the API
 * @returns {Object|null} Enhanced error information or null if not a special case
 */
const handleSpecialErrors = (errorText) => {
  if (!errorText) return null;
  
  const lowerError = errorText.toLowerCase();
  
  // Special handling for the specific listAvailableFoundationModels error
  if (lowerError.includes('does not provide an export named \'listavailablefoundationmodels\'') ||
      lowerError.includes('listAvailableFoundationModels')) {
    return {
      code: "EDGE_FUNCTION_MISSING_EXPORT",
      message: "The Edge Function is missing a required export function.",
      details: {
        module: './aws.ts',
        missingExport: 'listAvailableFoundationModels',
        original: errorText,
        resolution: "The AWS module needs to be updated to use the correct AWS Bedrock API method 'ListFoundationModels'.",
        suggestion: "According to AWS Bedrock API Reference, the correct method is 'ListFoundationModels' (with capital letters). Update the AWS module to use this method name instead: https://docs.aws.amazon.com/bedrock/latest/APIReference/API_ListFoundationModels.html"
      }
    };
  }
  
  // Handle module import errors in the Edge Function
  if (lowerError.includes('boot_error') && 
      (lowerError.includes('does not provide an export') || 
       lowerError.includes('the requested module'))) {
    
    // Extract module name and missing export if available
    let moduleInfo = "unknown module";
    let exportInfo = "unknown export";
    
    const moduleMatch = errorText.match(/module ['"](.+?)['"]/) ||
                        errorText.match(/from ['"](.+?)['"]/);
    if (moduleMatch) moduleInfo = moduleMatch[1];
    
    const exportMatch = errorText.match(/export named ['"](.+?)['"]/) || 
                        errorText.match(/named ['"](.+?)['"] /);
    if (exportMatch) exportInfo = exportMatch[1];
    
    return {
      code: "EDGE_FUNCTION_MODULE_ERROR",
      message: `The server-side Edge Function has a module import error. This requires server-side code changes.`,
      details: {
        module: moduleInfo,
        missingExport: exportInfo,
        original: errorText,
        resolution: "The Edge Function needs to be updated by the server administrator. Please report this error."
      }
    };
  }
  
  // Handle general boot errors
  if (lowerError.includes('boot_error')) {
    return {
      code: "EDGE_FUNCTION_BOOT_ERROR",
      message: "The server-side Edge Function failed to start due to an initialization error.",
      details: {
        original: errorText,
        resolution: "The Edge Function needs to be fixed by the server administrator. Please report this error."
      }
    };
  }
  
  return null;
};

/**
 * Call the Supabase Edge Function
 * 
 * @param {Object} options - Call options
 * @param {string} options.action - The action to perform
 * @param {Object} options.data - Data to send with the request
 * @param {boolean} options.useMock - Whether to use mock data
 * @param {boolean} options.requireAuth - Whether authentication is required (defaults to auto-detection)
 * @returns {Promise<{data: any, error: string|null}>} Function response
 */
const callEdgeFunction = async ({ action, data = {}, useMock = BedrockConfig.useMockData, requireAuth }) => {
  console.log(`[Bedrock] Calling edge function with action: ${action}`, { data, useMock });
  
  // For non-testing/debugging actions, require authentication by default
  // This can be overridden with the requireAuth parameter
  const noAuthActions = ['testEnvironment', 'test'];
  const needsAuth = requireAuth !== undefined ? requireAuth : !noAuthActions.includes(action);
  
  // Use mock data if explicitly requested or in development with mocks enabled
  if (useMock && (process.env.NODE_ENV !== 'production' || BedrockConfig.isLocalDevelopment)) {
    console.log('[Bedrock] Using mock data for action:', action);
    // Return mock data if available for this action
    if (devMockData[action]) {
      return { data: devMockData[action], error: null };
    } else {
      console.warn(`[Bedrock] No mock data available for action: ${action}`);
      return { data: null, error: 'No mock data available for this action' };
    }
  }
  
  if (needsAuth) {
    // Verify configuration before proceeding
    if (!validateApiConfiguration()) {
      console.error('[Bedrock] API configuration validation failed');
      return { data: null, error: 'API configuration error' };
    }
    
    // Get auth token before making the request
    const token = await getAuthToken();
    if (!token) {
      console.error('[Bedrock] No valid auth token available');
      
      // Special handling for listFoundationModels - return mock data
      if (action === 'aws-credential-test' && data.listModels) {
        console.log('[Bedrock] Auth failed for model listing, returning fallback data');
        return {
          data: getFallbackModels(data),
          error: 'Authentication required but fallback data provided'
        };
      }
      
      return { data: null, error: 'Authentication required' };
    }
    
    try {
      // Retry mechanism for edge function calls
      const maxRetries = 2;
      let retryCount = 0;
      let lastError = null;
      
      while (retryCount <= maxRetries) {
        try {
          // Try direct call to edge function
          console.log(`[Bedrock] Sending request to ${getApiUrl()} (attempt ${retryCount + 1}/${maxRetries + 1})`);
          
          // If this is a retry, add delay to avoid overwhelming the server
          if (retryCount > 0) {
            console.log(`[Bedrock] Retry attempt ${retryCount}/${maxRetries}, waiting before retry...`);
            await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
          }
          
          const { data: responseData, error } = await callEdgeFunctionDirect(
            BedrockConfig.edgeFunctionName, 
            action, 
            data, 
            token
          );
          
          if (error) {
            // If we get a specific error like BOOT_ERROR, remember it for potential retry
            console.error(`[Bedrock] API error for ${action} (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
            lastError = error;
            
            // Check if this is a special error that needs enhanced handling
            const specialError = handleSpecialErrors(error);
            if (specialError) {
              console.log('[Bedrock] Special error detected:', specialError.code);
              
              // For special errors with known fallbacks, provide fallback data
              if (action === 'listFoundationModels' || (action === 'aws-credential-test' && data.listModels)) {
                return {
                  data: getFallbackModels(data),
                  error: specialError
                };
              }
              
              // For other actions, just return the enhanced error
              return { data: null, error: specialError };
            }
            
            // Check for specific error conditions
            const errorLower = String(error).toLowerCase();
            
            // Don't retry auth errors as they're not likely to resolve with retries
            if (errorLower.includes('401') || 
                errorLower.includes('unauthorized') || 
                errorLower.includes('auth') || 
                errorLower.includes('bearer')) {
              console.warn('[Bedrock] Authorization error detected, not retrying');
              return { data: null, error };
            }
            
            // For boot errors and service unavailable errors, try again
            if (errorLower.includes('boot_error') || 
                errorLower.includes('503') ||
                errorLower.includes('failed to start') || 
                errorLower.includes('function failed')) {
              console.log('[Bedrock] Recoverable error detected, will retry');
              retryCount++;
              continue;
            }
            
            return { data: null, error };
          }
          
          // Successfully received response data
          console.log(`[Bedrock] Request to ${action} successful`);
          return { data: responseData, error: null };
        } catch (err) {
          console.error(`[Bedrock] Exception in edge function call (attempt ${retryCount + 1}/${maxRetries + 1}):`, err);
          lastError = err.message || 'Unknown error';
          retryCount++;
          
          // If we've exhausted retries, throw to exit the loop
          if (retryCount > maxRetries) {
            throw err;
          }
        }
      }
      
      // If we get here, all retries failed
      console.error('[Bedrock] All retry attempts failed');
      return { data: null, error: lastError || 'Edge function call failed after retries' };
    } catch (err) {
      console.error(`[Bedrock] All attempts failed for edge function call ${action}:`, err);
      return { data: null, error: err.message || 'Unknown error' };
    }
  } else {
    // For test/environment check endpoints, proceed without auth
    try {
      // Use mock data if configured for development
      if (useMock && process.env.NODE_ENV !== 'production') {
        console.log('[Bedrock] Using mock data for non-auth action:', action);
        if (devMockData[action]) {
          return { data: devMockData[action], error: null };
        }
      }
      
      // No auth required, call directly
      const { data: responseData, error } = await callEdgeFunctionDirect(
        BedrockConfig.edgeFunctionName, 
        action, 
        data, 
        ''
      );
      
      if (error) {
        console.error(`[Bedrock] API error for ${action}:`, error);
        
        // Check if this is a special error that needs enhanced handling
        const specialError = handleSpecialErrors(error);
        if (specialError) {
          console.log('[Bedrock] Special error detected in no-auth call:', specialError.code);
          return { data: null, error: specialError };
        }
        
        return { data: null, error };
      }
      
      return { data: responseData, error: null };
    } catch (err) {
      console.error(`[Bedrock] Error in test function:`, err);
      return { data: null, error: err.message || 'Unknown error' };
    }
  }
};

/**
 * Get all Bedrock instances for the authenticated user
 * Aligns with AWS Bedrock API operation: ListProvisionedModelThroughputs
 * @returns {Promise<{data: Array, error: string|null}>} Bedrock instances or error
 */
const listInstances = async () => {
  console.log('[Bedrock] Fetching Bedrock instances');
  
  // If we're in development or if mock data is enabled, use the mock data
  if (BedrockConfig.useMockData || BedrockConfig.isLocalDevelopment) {
    console.log('[Bedrock] Using mock data for instances');
    return { 
      data: {
        instances: []
      }, 
      error: null 
    };
  }
  
  try {
    // Try with the AWS Bedrock API naming convention
    const result = await callEdgeFunction({
      action: 'ListProvisionedModelThroughputs',
      useMock: false
    });
    
    if (!result.error) {
      console.log('[Bedrock] Successfully fetched instances with standard API name');
      return result;
    }
    
    console.log('[Bedrock] Standard API name failed, trying legacy endpoint');
    
    // If the standard name fails, try the legacy name for backward compatibility
    const legacyResult = await callEdgeFunction({
      action: 'listInstances',
      useMock: false
    });
    
    if (!legacyResult.error) {
      console.log('[Bedrock] Successfully fetched instances from legacy endpoint');
      return legacyResult;
    }
    
    // If both attempts fail, return empty instances as fallback
    console.error('[Bedrock] Both API calls failed:', result.error, legacyResult?.error);
    return { 
      data: { 
        instances: [],
        note: "Failed to load instances due to API error"
      }, 
      error: result.error 
    };
  } catch (error) {
    console.error('[Bedrock] Exception fetching instances:', error);
    // Return empty instances as fallback with the error
    return { 
      data: { 
        instances: [],
        note: "Failed to load instances due to exception"
      }, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};

/**
 * Create a new Bedrock instance (provisioned model throughput)
 * Aligns with AWS Bedrock API operation: CreateProvisionedModelThroughput
 * 
 * @param {Object} modelInfo - Instance configuration
 * @param {string} modelInfo.modelId - The model ID
 * @param {string} modelInfo.commitmentDuration - Commitment duration
 * @param {number} modelInfo.modelUnits - Number of model units
 * @returns {Promise<{data: Object, error: string|null}>} New instance or error
 */
const createInstance = async (modelInfo) => {
  console.log('[Bedrock] Creating instance with parameters:', JSON.stringify(modelInfo));
  
  // Validate required fields
  if (!modelInfo.modelId) {
    console.error('[Bedrock] Missing required modelId parameter');
    return { data: null, error: 'modelId is required' };
  }
  
  // Convert 1m/6m commitment duration format to match what the API expects
  const modelData = {
    ...modelInfo,
    // Ensure modelId is explicitly set (with debugging output)
    modelId: modelInfo.modelId,
    // Convert from "1m" or "6m" to the format the API expects
    commitmentDuration: modelInfo.commitmentDuration || "1m"
  };
  
  console.log('[Bedrock] Structured model data for API call:', JSON.stringify(modelData));
  
  // Try with the AWS Bedrock API naming convention
  const result = await callEdgeFunction({
    action: 'CreateProvisionedModelThroughput',
    data: modelData
  });
  
  // If the standard name fails, try the legacy name for backward compatibility
  if (result.error) {
    console.log('[Bedrock] Standard API name failed, trying legacy endpoint');
    return callEdgeFunction({
      action: 'createInstance',
      data: modelData
    });
  }
  
  return result;
};

/**
 * Delete a Bedrock instance (provisioned model throughput)
 * Aligns with AWS Bedrock API operation: DeleteProvisionedModelThroughput
 * 
 * @param {string} instanceId - ID of the instance to delete
 * @returns {Promise<{data: Object, error: string|null}>} Success status or error
 */
const deleteInstance = async (instanceId) => {
  // Try first with the AWS Bedrock API naming convention
  const result = await callEdgeFunction({
    action: 'DeleteProvisionedModelThroughput',
    data: { provisionedModelId: instanceId }
  });
  
  // If the standard name fails, try the legacy name for backward compatibility
  if (result.error) {
    console.log('[Bedrock] Standard API name failed, trying legacy endpoint');
    return callEdgeFunction({
      action: 'deleteInstance',
      data: { instanceId }
    });
  }
  
  return result;
};

/**
 * Test the edge function environment
 * This function attempts to diagnose issues with the Supabase Edge Functions environment
 * 
 * @returns {Promise<Object>} Environment test results
 */
const testEnvironment = async () => {
  console.log('[Bedrock] Testing edge function environment...');
  
  let diagnostics = {
    standardEndpoint: { attempted: false, success: false, error: null },
    diagnosticEndpoint: { attempted: false, success: false, error: null },
    apiVersion: BedrockConfig.apiVersion,
    environment: {
      bedrockRegion: BedrockConfig.bedrockRegion,
      hasApiUrl: !!BedrockConfig.apiUrl,
      hasCredentials: !!BedrockConfig.accessKeyId && !!BedrockConfig.secretAccessKey,
      isDevelopment: process.env.NODE_ENV !== 'production',
      isLocalDevelopment: BedrockConfig.isLocalDevelopment,
    },
    clientEnvVars: {
      VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_SUPABASE_FUNCTION_NAME: import.meta.env.VITE_SUPABASE_FUNCTION_NAME || null,
    },
    errorDetails: null
  };
  
  try {
    // First try the standard endpoint without requiring auth
    diagnostics.standardEndpoint.attempted = true;
    const standardResult = await callEdgeFunction({ 
      action: 'testEnvironment', 
      requireAuth: false 
    });
    
    diagnostics.standardEndpoint.success = !standardResult.error;
    diagnostics.standardEndpoint.result = standardResult.data;
    
    if (standardResult.error) {
      diagnostics.standardEndpoint.error = standardResult.error;
      console.warn('[Bedrock] Standard edge function test failed:', standardResult.error);
      
      // Check if we received a detailed error object
      if (typeof standardResult.error === 'object' && standardResult.error.code) {
        diagnostics.errorDetails = standardResult.error;
        
        // For module errors, provide specific guidance
        if (standardResult.error.code === 'EDGE_FUNCTION_MODULE_ERROR') {
          diagnostics.failureReason = 'MODULE_ERROR';
          diagnostics.suggestedAction = `The Supabase Edge Function has a module import error. It's trying to import '${standardResult.error.details.missingExport}' from '${standardResult.error.details.module}' but that export doesn't exist. This requires a server-side fix.`;
        } else if (standardResult.error.code === 'EDGE_FUNCTION_BOOT_ERROR') {
          diagnostics.failureReason = 'BOOT_ERROR';
          diagnostics.suggestedAction = 'The Supabase Edge Function is failing to initialize. Check the server logs for more details.';
        }
      }
    } else {
      console.log('[Bedrock] Edge function test successful', standardResult.data);
      return {
        ...diagnostics,
        success: true,
        message: 'Edge function environment is configured correctly'
      };
    }
  } catch (error) {
    diagnostics.standardEndpoint.error = error.message;
    console.error('[Bedrock] Error testing standard edge function:', error);
  }
  
  // If standard endpoint fails, try the diagnostic endpoint
  try {
    diagnostics.diagnosticEndpoint.attempted = true;
    const response = await fetch('/api/super-action-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'testEnvironment',
        data: { minimal: true }
      })
    });
    
    if (!response.ok) {
      diagnostics.diagnosticEndpoint.error = `HTTP error ${response.status}`;
      console.error(`[Bedrock] Diagnostic endpoint HTTP error: ${response.status}`);
    } else {
      const result = await response.json();
      
      diagnostics.diagnosticEndpoint.success = true;
      diagnostics.diagnosticEndpoint.result = result;
      
      // Check if the diagnostic endpoint found a specific error
      if (result.functionResponse && result.functionResponse.error) {
        const errorText = result.functionResponse.error;
        const specialError = handleSpecialErrors(errorText);
        
        if (specialError) {
          diagnostics.errorDetails = specialError;
          
          if (specialError.code === 'EDGE_FUNCTION_MODULE_ERROR') {
            diagnostics.failureReason = 'MODULE_ERROR';
            diagnostics.suggestedAction = `The Supabase Edge Function has a module import error. It's trying to import '${specialError.details.missingExport}' from '${specialError.details.module}' but that export doesn't exist. This requires a server-side fix.`;
          }
        }
      }
      
      console.log('[Bedrock] Diagnostic endpoint test result:', result);
    }
  } catch (error) {
    diagnostics.diagnosticEndpoint.error = error.message;
    console.error('[Bedrock] Error testing diagnostic endpoint:', error);
  }
  
  // Set overall success/failure message
  let message = 'Edge function environment test failed. See diagnostics for details.';
  
  // Add specific guidance based on the detected issue
  if (diagnostics.failureReason === 'MODULE_ERROR') {
    message = `Edge function has a module import error. The server-side code requires updating.`;
  } else if (diagnostics.failureReason === 'BOOT_ERROR') {
    message = `Edge function is failing to initialize. Check server logs for details.`;
  }
  
  return {
    ...diagnostics,
    success: false,
    message
  };
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
    const _useMock = false;
    
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
 * List available foundation models with optional filters
 * Aligns with AWS Bedrock API operation: ListFoundationModels
 * @param {Object} filters - Optional filters for the models list
 * @param {string} filters.byProvider - Filter by provider (e.g. 'amazon', 'anthropic')
 * @param {string} filters.byOutputModality - Filter by output type (e.g. 'TEXT', 'IMAGE')
 * @param {string} filters.byInferenceType - Filter by inference type (e.g. 'ON_DEMAND', 'PROVISIONED')
 * @returns {Promise<{data: Array, error: string|null}>} Available models or error
 */
const listFoundationModels = async (filters = {}) => {
  console.log('[Bedrock] Fetching available foundation models', Object.keys(filters).length > 0 ? `with filters: ${JSON.stringify(filters)}` : 'with no filters');
  
  // Validate filters to ensure they're properly formatted
  const validatedFilters = {};
  
  // Only include defined filter values - these match the AWS ListFoundationModels API parameters
  // See: https://docs.aws.amazon.com/bedrock/latest/APIReference/API_ListFoundationModels.html
  if (filters.byProvider) validatedFilters.byProvider = filters.byProvider;
  if (filters.byOutputModality) validatedFilters.byOutputModality = filters.byOutputModality;
  if (filters.byInputModality) validatedFilters.byInputModality = filters.byInputModality;
  if (filters.byInferenceType) validatedFilters.byInferenceType = filters.byInferenceType;
  if (filters.byCustomizationType) validatedFilters.byCustomizationType = filters.byCustomizationType;
  
  // If we're in development or if mock data is enabled, use the mock data
  if (BedrockConfig.useMockData || BedrockConfig.isLocalDevelopment) {
    console.log('[Bedrock] Using mock data for foundation models');
    
    // Return mock foundation models
    return { 
      data: getFallbackModels(validatedFilters),
      error: null 
    };
  }
  
  // Try multiple approaches to get the models
  try {
    // First, try using the standard AWS Bedrock API naming convention
    const result = await callEdgeFunction({
      action: 'ListFoundationModels',
      data: validatedFilters,
      useMock: false
    });
    
    if (!result.error && result.data && result.data.models) {
      console.log('[Bedrock] Successfully fetched foundation models with standard API name');
      return result;
    }
    
    console.log('[Bedrock] Standard API name failed, trying legacy endpoint');
    
    // If that fails, try the legacy endpoint name for backward compatibility
    const legacyResult = await callEdgeFunction({
      action: 'aws-credential-test',
      data: {
        listModels: true,
        ...validatedFilters
      },
      useMock: false // Explicitly disable mocks for this call
    });
    
    if (!legacyResult.error && legacyResult.data && legacyResult.data.models) {
      console.log('[Bedrock] Successfully fetched foundation models from legacy endpoint');
      return legacyResult;
    }
    
    // If all else fails, return a limited set of default models
    console.log('[Bedrock] All methods failed, returning default models');
    return {
      data: getFallbackModels(validatedFilters),
      error: null
    };
  } catch (error) {
    console.error('[Bedrock] All foundation model listing methods failed:', error);
    // Return a minimal set of models as a fallback with an error message
    return {
      data: getFallbackModels(validatedFilters),
      error: `Failed to fetch foundation models from API: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Returns a fallback set of models that's always available
 * Used when the API is unavailable or there's an authentication issue
 * @param {Object} filters - Optional filters for the models list
 * @returns {Object} Filtered models object with metadata
 */
const getFallbackModels = (filters = {}) => {
  console.log('[Bedrock] Generating fallback models with filters:', filters);
  
  // Define the fallback model set that's always available
  const allFallbackModels = [
    {
      modelId: "amazon.titan-text-lite-v1",
      modelName: "Titan Text Lite",
      providerName: "Amazon",
      inputModalities: ["TEXT"],
      outputModalities: ["TEXT"],
      inferenceTypesSupported: ["ON_DEMAND", "PROVISIONED"],
      customizationsSupported: [],
      responseStreamingSupported: true
    },
    {
      modelId: "amazon.titan-text-express-v1",
      modelName: "Titan Text Express",
      providerName: "Amazon",
      inputModalities: ["TEXT"],
      outputModalities: ["TEXT"],
      inferenceTypesSupported: ["ON_DEMAND", "PROVISIONED"],
      customizationsSupported: [],
      responseStreamingSupported: true
    },
    {
      modelId: "anthropic.claude-instant-v1",
      modelName: "Claude Instant v1",
      providerName: "Anthropic",
      inputModalities: ["TEXT"],
      outputModalities: ["TEXT"],
      inferenceTypesSupported: ["ON_DEMAND"],
      customizationsSupported: [],
      responseStreamingSupported: true
    },
    {
      modelId: "anthropic.claude-v2",
      modelName: "Claude v2",
      providerName: "Anthropic",
      inputModalities: ["TEXT"],
      outputModalities: ["TEXT"],
      inferenceTypesSupported: ["ON_DEMAND"],
      customizationsSupported: [],
      responseStreamingSupported: true
    },
    {
      modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
      modelName: "Claude 3 Sonnet",
      providerName: "Anthropic",
      inputModalities: ["TEXT"],
      outputModalities: ["TEXT"],
      inferenceTypesSupported: ["ON_DEMAND"],
      customizationsSupported: [],
      responseStreamingSupported: true
    },
    {
      modelId: "meta.llama2-13b-chat-v1",
      modelName: "Llama 2 Chat (13B)",
      providerName: "Meta",
      inputModalities: ["TEXT"],
      outputModalities: ["TEXT"],
      inferenceTypesSupported: ["ON_DEMAND"],
      customizationsSupported: [],
      responseStreamingSupported: false
    },
    {
      modelId: "meta.llama2-70b-chat-v1",
      modelName: "Llama 2 Chat (70B)",
      providerName: "Meta",
      inputModalities: ["TEXT"],
      outputModalities: ["TEXT"],
      inferenceTypesSupported: ["ON_DEMAND"],
      customizationsSupported: [],
      responseStreamingSupported: false
    },
    {
      modelId: "stability.stable-diffusion-xl-v1",
      modelName: "Stable Diffusion XL",
      providerName: "Stability AI",
      inputModalities: ["TEXT"],
      outputModalities: ["IMAGE"],
      inferenceTypesSupported: ["ON_DEMAND"],
      customizationsSupported: [],
      responseStreamingSupported: false
    },
    {
      modelId: "cohere.command-text-v14",
      modelName: "Command Text",
      providerName: "Cohere",
      inputModalities: ["TEXT"],
      outputModalities: ["TEXT"],
      inferenceTypesSupported: ["ON_DEMAND"],
      customizationsSupported: [],
      responseStreamingSupported: true
    },
    {
      modelId: "ai21.j2-mid-v1",
      modelName: "Jurassic-2 Mid",
      providerName: "AI21 Labs",
      inputModalities: ["TEXT"],
      outputModalities: ["TEXT"],
      inferenceTypesSupported: ["ON_DEMAND"],
      customizationsSupported: [],
      responseStreamingSupported: false
    }
  ];
  
  // Start with all models
  let filteredModels = [...allFallbackModels];
  
  // Apply filters if specified
  if (Object.keys(filters).length > 0) {
    // Filter by provider
    if (filters.byProvider) {
      const providerFilter = filters.byProvider.toLowerCase();
      filteredModels = filteredModels.filter(model => 
        model.providerName.toLowerCase().includes(providerFilter)
      );
    }
    
    // Filter by output modality
    if (filters.byOutputModality) {
      filteredModels = filteredModels.filter(model => 
        model.outputModalities.includes(filters.byOutputModality)
      );
    }
    
    // Filter by input modality
    if (filters.byInputModality) {
      filteredModels = filteredModels.filter(model => 
        model.inputModalities.includes(filters.byInputModality)
      );
    }
    
    // Filter by inference type
    if (filters.byInferenceType) {
      filteredModels = filteredModels.filter(model => 
        model.inferenceTypesSupported.includes(filters.byInferenceType)
      );
    }
    
    // Filter by customization type if specified
    if (filters.byCustomizationType) {
      filteredModels = filteredModels.filter(model => 
        model.customizationsSupported && 
        model.customizationsSupported.includes(filters.byCustomizationType)
      );
    }
    
    // Filter by streaming support if specified
    if (filters.byStreamingSupport) {
      const streamingRequired = filters.byStreamingSupport.toLowerCase() === 'true';
      filteredModels = filteredModels.filter(model => 
        model.responseStreamingSupported === streamingRequired
      );
    }
  }
  
  // Return the filtered models with metadata
  return {
    models: filteredModels,
    appliedFilters: filters,
    totalCount: filteredModels.length,
    note: "Using fallback models while server issues are being fixed",
    serverStatus: "BOOT_ERROR_FALLBACK",
    filtering: {
      appliedFilters: Object.keys(filters).length,
      originalCount: allFallbackModels.length,
      filteredCount: filteredModels.length
    }
  };
};

// Expose client functions
export const BedrockClient = {
  // Authentication
  getAuthSession,
  getAuthToken,
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