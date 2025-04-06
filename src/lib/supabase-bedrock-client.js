/**
 * Supabase Bedrock API Client
 * This client handles communication with Bedrock API endpoints 
 * through Supabase Edge Functions, using JWT authentication only.
 */

import { BedrockConfig } from './bedrock-config';
// Import the singleton Supabase client
import supabase from './supabase';
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
 * Format the Authorization header to ensure it's in the format 'Bearer {token}'
 * @param {string} authHeader - The original authorization header
 * @returns {string} Properly formatted authorization header
 */
function formatAuthHeader(authHeader) {
  if (!authHeader) return '';
  
  // If the header already starts with Bearer, return it as is
  if (authHeader.trim().startsWith('Bearer ')) {
    return authHeader.trim();
  }
  
  // Remove any existing prefix like 'bearer', 'jwt', 'token'
  const cleanToken = authHeader.trim().replace(/^(bearer|jwt|token)\s+/i, '');
  
  // Return with proper Bearer prefix
  return `Bearer ${cleanToken}`;
}

/**
 * Call the Supabase Edge Function directly with timeout and error handling
 * @param {Object} payload - The payload to send to the edge function
 * @param {Object} options - Options for the request
 * @param {boolean} options.skipAuth - Skip sending authentication token
 * @param {number} options.timeout - Timeout in milliseconds (default: 30000)
 * @returns {Promise<any>} The response from the edge function
 */
async function callEdgeFunctionDirect(payload, options = {}) {
  // Default options
  const { 
    skipAuth = false, 
    timeout = 30000,
    retryCount = 0
  } = options;
  
  // Get settings from config
  // Use fallbacks for variables that might be undefined
  const supabaseUrl = typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : (supabase?.supabaseUrl || 'https://unknown.supabase.co');
  const clientVersion = typeof CLIENT_VERSION !== 'undefined' ? CLIENT_VERSION : '1.0.0';
  
  // Use the direct Supabase Edge Function URL
  const functionUrl = `${supabaseUrl}/functions/v1/super-action`;
  
  // Always use the direct function URL to avoid 404 errors with the proxy
  const url = functionUrl;
  
  console.log(`[API] Using direct function URL: ${url} for action: ${payload.action}`);
  
  // Add client version to payload
  const finalPayload = {
    ...payload,
    clientVersion: clientVersion,
    timestamp: new Date().toISOString()
  };
  
  // Setup headers with correctly formatted authorization if needed
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Connection': 'keep-alive'
  };
  
  // Get auth token if we need it and it's not already provided
  let authToken = null;
  if (!skipAuth) {
    try {
      // Get the auth token using the proper function
      authToken = typeof getAuthToken === 'function' ? await getAuthToken() : null;
    } catch (tokenError) {
      console.warn('[API] Error getting auth token:', tokenError);
    }
  }
  
  // Add authorization header if we have a token and auth is required
  if (!skipAuth && authToken && typeof authToken === 'string') {
    headers['Authorization'] = formatAuthHeader(authToken);
  }
  
  try {
    console.log(`[API] Calling edge function with action: ${payload.action}`);
    
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`[API] Request timeout (${timeout}ms) for action: ${payload.action}`);
      controller.abort();
    }, timeout);
    
    // Make the request with proper error handling
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(finalPayload),
      signal: controller.signal,
      // Add additional fetch options to improve reliability
      credentials: 'omit',    // Don't send cookies
      cache: 'no-store',      // Don't use cache
      mode: 'cors',           // Allow CORS
      redirect: 'follow',     // Follow redirects
      keepalive: true,        // Keep connection alive
      referrerPolicy: 'no-referrer'
    }).catch(fetchError => {
      // Clear the timeout if fetch itself throws
      clearTimeout(timeoutId);
      
      // Handle network errors specifically
      if (fetchError.name === 'AbortError') {
        console.error('[API] Request aborted:', fetchError.message);
        const timeoutError = new Error(`Request aborted after ${timeout}ms`);
        timeoutError.code = 'REQUEST_TIMEOUT';
        timeoutError.originalError = fetchError;
        throw timeoutError;
      }
      
      // Handle other network errors
      console.error('[API] Network error:', fetchError.message);
      const networkError = new Error(`Network error: ${fetchError.message}`);
      networkError.code = 'NETWORK_ERROR';
      networkError.originalError = fetchError;
      throw networkError;
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const errorText = await response.text();
      let errorObject;
      
      try {
        // Try to parse error as JSON
        errorObject = JSON.parse(errorText);
      } catch (e) {
        // If not JSON, create a basic error object
        errorObject = { 
          message: errorText || `HTTP Error ${response.status}`,
          status: response.status
        };
      }
      
      // Enhance error with HTTP status information
      const error = new Error(errorObject.message || `HTTP Error ${response.status}`);
      error.status = response.status;
      error.details = errorObject;
      
      // Special error handling for specific status codes
      if (response.status === 401) {
        error.code = 'UNAUTHORIZED';
        error.message = 'Authentication failed. Check your authentication token.';
      } else if (response.status === 404) {
        error.code = 'NOT_FOUND';
        error.message = 'The requested resource or action was not found.';
      } else if (response.status === 503) {
        error.code = 'SERVICE_UNAVAILABLE';
        error.message = 'The Edge Function service is temporarily unavailable.';
      } else if (response.status === 504) {
        error.code = 'FUNCTION_INVOCATION_TIMEOUT';
        error.message = 'The Edge Function timed out during invocation.';
      }
      
      throw error;
    }
    
    // Parse the response body based on content type
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    } else {
      return await response.text();
    }
  } catch (error) {
    // Handle abort/timeout errors
    if (error.name === 'AbortError' || error.code === 'REQUEST_TIMEOUT') {
      const timeoutError = new Error(`Request timed out after ${timeout}ms`);
      timeoutError.code = 'REQUEST_TIMEOUT';
      timeoutError.originalError = error;
      
      // Retry logic for network errors and timeouts
      if (retryCount < 2) {
        console.log(`[API] Retrying after timeout (attempt ${retryCount + 1}/3)...`);
        // Wait for increasing amounts of time before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return callEdgeFunctionDirect(payload, {
          ...options, 
          retryCount: retryCount + 1,
          timeout: timeout * 1.5 // Increase timeout for retries
        });
      }
      
      throw timeoutError;
    }
    
    // Handle network errors with retry
    if (error.code === 'NETWORK_ERROR' && retryCount < 2) {
      console.log(`[API] Retrying after network error (attempt ${retryCount + 1}/3)...`);
      // Wait for increasing amounts of time before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return callEdgeFunctionDirect(payload, {
        ...options, 
        retryCount: retryCount + 1
      });
    }
    
    // If we have a special error code already, just re-throw
    if (error.code) {
      throw error;
    }
    
    // Handle other fetch errors
    console.error(`[API] Error calling edge function:`, error);
    
    // Create a descriptive error
    const fetchError = new Error(`API request failed: ${error.message}`);
    fetchError.code = 'API_REQUEST_FAILED';
    fetchError.originalError = error;
    throw fetchError;
  }
}

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
  
  // Handle function timeout errors
  if (lowerError.includes('function_invocation_timeout') || 
      lowerError.includes('gateway timeout') ||
      lowerError.includes('504')) {
    return {
      code: "EDGE_FUNCTION_TIMEOUT",
      message: "The Edge Function timed out during execution.",
      details: {
        original: errorText,
        resolution: "This may be caused by the boot error. Fix the module import issue first, then check for long-running operations in the function.",
        suggestion: "If the function continues to time out after fixing the import error, optimize the function's execution time or increase the timeout limit."
      }
    };
  }
  
  // Handle authentication formatting errors
  if (lowerError.includes('auth header is not') || 
      lowerError.includes('bearer')) {
    return {
      code: "EDGE_FUNCTION_AUTH_FORMAT",
      message: "Authentication token format error.",
      details: {
        original: errorText,
        resolution: "The function is expecting the Authorization header in the format 'Bearer {token}'.",
        suggestion: "Check the token formatting in both the client and server code."
      }
    };
  }
  
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
            { action, data },
            { skipAuth: false }
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
              if (action === 'ListFoundationModels' || action === 'listFoundationModels' || 
                  (action === 'aws-credential-test' && data.listModels)) {
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
                errorLower.includes('auth header') || 
                errorLower.includes('bearer')) {
              console.warn('[Bedrock] Authorization error detected, not retrying');
              
              // For model listings, provide fallback data
              if (action === 'ListFoundationModels' || action === 'listFoundationModels' || 
                  (action === 'aws-credential-test' && data.listModels)) {
                return {
                  data: getFallbackModels(data),
                  error: 'Authentication error, using fallback data'
                };
              }
              
              return { data: null, error };
            }
            
            // For boot errors, timeouts, and service unavailable errors, try again
            if (errorLower.includes('boot_error') || 
                errorLower.includes('503') ||
                errorLower.includes('504') ||
                errorLower.includes('timeout') ||
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
        { action, data },
        { skipAuth: true }
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
 * Test the environment (PRODUCTION MODE - DISABLED)
 * This function is disabled in production mode
 *
 * @param {Object} options - Test options
 * @returns {Promise<Object>} Environment information for production
 */
const testEnvironment = async (options = {}) => {
  console.log('[ENV TEST] testEnvironment is disabled in production mode');
  
  // Return a simplified production-only response
  return {
    success: true,
    message: 'Production mode - environment tests disabled',
    data: {
      apiVersion: 'production',
      timestamp: new Date().toISOString(),
      environment: 'production',
      note: 'Production mode - detailed diagnostics disabled',
      serverStatus: 'PRODUCTION'
    },
    source: 'production'
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