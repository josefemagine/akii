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
 * @param {boolean} options.useCredentialsOmit - Use credentials: 'omit' instead of 'include'
 * @returns {Promise<any>} The response from the edge function
 */
async function callEdgeFunctionDirect(payload, options = {}) {
  // Default options
  const { 
    skipAuth = false, 
    timeout = 30000,
    retryCount = 0,
    useCredentialsOmit = false
  } = options;
  
  // Get the direct Supabase Edge Function URL from Bedrock config
  const functionUrl = 'https://injxxchotrvgvvzelhvj.supabase.co/functions/v1/super-action';
  
  // Always use the direct function URL
  const url = functionUrl;
  
  console.log(`[API] Using direct function URL: ${url} for action: ${payload.action}`);
  
  // Add client version to payload
  const finalPayload = {
    ...payload,
    clientVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    clientInfo: {
      userAgent: navigator.userAgent,
      origin: window.location.origin,
      connectionType: (navigator.connection?.effectiveType) || 'unknown',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  };
  
  // Setup headers with correctly formatted authorization if needed
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Connection': 'keep-alive',
    'X-Client-Info': navigator.userAgent || 'Unknown Client',
    'Origin': window.location.origin,
    'Referer': window.location.origin
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
  
  // Setup fetch controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);
  
  try {
    console.log(`[API] Sending request to ${url} with action "${payload.action}"`);
    console.log('[API] Request headers:', headers);
    
    // Make the request with fetch - ALWAYS use credentials: 'include' for production
    console.log('[API] Using credentials mode: include (required for CORS with authentication)');
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(finalPayload),
      signal: controller.signal,
      credentials: 'include', // Always use 'include' for consistency
      mode: 'cors' // Explicitly request CORS mode
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    // Check if response is ok
    if (!response.ok) {
      console.error('[API] HTTP response error:', response.status, response.statusText);
      
      // Try to get more details from the response if possible
      try {
        const errorData = await response.json();
        console.error('[API] Error response data:', errorData);
        return { 
          error: `HTTP Error ${response.status}: ${response.statusText}`,
          errorDetails: errorData,
          status: response.status
        };
      } catch (parseError) {
        // If we can't parse the response as JSON, return the raw text
        const errorText = await response.text();
        return { 
          error: `HTTP Error ${response.status}: ${response.statusText}`,
          errorText,
          status: response.status
        };
      }
    }
    
    // Parse the response as JSON
    const data = await response.json();
    
    // Check if the response contains an error
    if (data.error) {
      console.error('[API] Error in response:', data.error);
      return { error: data.error };
    }
    
    // Return the data
    return { data };
  } catch (error) {
    // Clear the timeout
    clearTimeout(timeoutId);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      console.error(`[API] Request timed out after ${timeout}ms:`, error);
      return { error: `Request timed out after ${timeout}ms` };
    }
    
    // Handle CORS errors specifically and add detailed diagnostics
    if (error instanceof TypeError && 
        (error.message.includes('Failed to fetch') || 
         error.message.includes('NetworkError') ||
         error.message.includes('Network request failed'))) {
      
      // Log as much detail as possible to help with debugging
      console.error('[API] CORS error or network failure:', error);
      
      // Add detailed debugging information
      const corsInfo = {
        origin: window.location.origin,
        targetUrl: url,
        hasCredentials: !!authToken,
        browserInfo: navigator.userAgent,
        timeStamp: new Date().toISOString(),
        errorMessage: error.message,
        errorType: error.name,
        possibleCauses: [
          "The server's Access-Control-Allow-Origin header might not include this origin",
          "The server's Access-Control-Allow-Credentials header might not be set to 'true'",
          "The server might not be accepting the HTTP method",
          "The server might be down or unreachable",
          "Network connectivity issues"
        ],
        troubleshootingSuggestions: [
          "Check server logs for CORS configuration",
          "Ensure the server has this origin in its allowed origins list",
          "Verify CORS preflight (OPTIONS) requests are being handled correctly",
          "Check if the server is accessible from this location"
        ]
      };
      
      console.log('[API] CORS debug info:', corsInfo);
      
      // More focused error message for production
      return { 
        error: `Network or CORS error: Cannot connect to API from ${window.location.origin}. The server's CORS configuration may need to be updated.`,
        corsInfo,
        originalError: error.message
      };
    }
    
    // Generic error handling
    console.error('[API] Error in callEdgeFunctionDirect:', error);
    return { error: error.message || 'Unknown error in API call' };
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
 * @param {boolean} options.requireAuth - Whether authentication is required (defaults to auto-detection)
 * @returns {Promise<{data: any, error: string|null}>} Function response
 */
const callEdgeFunction = async ({ action, data = {}, requireAuth }) => {
  console.log(`[DEBUG] callEdgeFunction called with action: ${action}, data:`, data, `requireAuth: ${requireAuth}`);
  
  try {
    // For non-testing/debugging actions, require authentication by default
    // This can be overridden with the requireAuth parameter
    const noAuthActions = ['testEnvironment', 'test'];
    const needsAuth = requireAuth !== undefined ? requireAuth : !noAuthActions.includes(action);
    
    // Number of retries for network issues
    const maxAttempts = 3;
    let attempt = 1;
    let lastError = null;
    
    // Remove any useMock parameters from the data
    if (data && typeof data === 'object' && 'useMock' in data) {
      delete data.useMock;
    }
    
    // Try multiple times if we get network errors
    while (attempt <= maxAttempts) {
      try {
        console.log(`[Bedrock] Sending request to /api/super-action (attempt ${attempt}/${maxAttempts})`);
        
        if (needsAuth) {
          // Get auth token
          const token = await getAuthToken();
          
          if (!token) {
            console.error('[Bedrock] No valid auth token available');
            return { data: null, error: 'Authentication required' };
          }
          
          console.log('[Bedrock] Found access_token in session');
          
          // Call the edge function with auth
          const { data: responseData, error } = await callEdgeFunctionDirect(
            { action, data },
            { skipAuth: false }
          );
          
          if (error) {
            console.error(`[Bedrock] API error for ${action}:`, error);
            
            // Check if this is a special error that needs enhanced handling
            const specialError = handleSpecialErrors(error);
            if (specialError) {
              console.log('[Bedrock] Special error detected:', specialError.code);
              return { data: null, error: specialError };
            }
            
            return { data: null, error };
          }
          
          console.log(`[Bedrock] Request to ${action} successful`);
          return { data: responseData, error: null };
        } else {
          // For test/environment check endpoints, proceed without auth
          try {
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
      } catch (error) {
        lastError = error;
        
        // Only retry on network errors
        if (error.name === 'TypeError' || error.name === 'NetworkError' || error.name === 'AbortError') {
          console.error(`[Bedrock] Network error on attempt ${attempt}/${maxAttempts}:`, error);
          attempt++;
          
          if (attempt <= maxAttempts) {
            // Wait before retrying (simple exponential backoff)
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
            console.log(`[Bedrock] Retrying after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        } else {
          // Not a network error, don't retry
          break;
        }
      }
    }
    
    // If we get here, all attempts failed
    console.error(`[Bedrock] All ${maxAttempts} attempts failed for ${action}`);
    return { 
      data: null, 
      error: lastError instanceof Error ? lastError.message : String(lastError || 'Unknown error') 
    };
  } catch (error) {
    console.error(`[DEBUG] Error in callEdgeFunction for action ${action}:`, error);
    throw error;
  }
};

/**
 * Get all Bedrock instances for the authenticated user
 * Aligns with AWS Bedrock API operation: ListProvisionedModelThroughputs
 * @returns {Promise<Array<Object>|null>} Array of Bedrock instances or null on error
 */
export async function listInstances() {
  console.log("[Bedrock] Fetching AWS Bedrock instances");
  try {
    const { data, error } = await callEdgeFunction({
      action: "ListProvisionedModelThroughputs",
      data: {},
      requireAuth: true
    });
    
    if (error) {
      console.error("[Bedrock] Error fetching instances:", error);
      throw new Error(error.message || "Error fetching Bedrock instances");
    }
    
    // Extract and normalize the instances data
    const instances = data?.models || [];
    console.log(`[Bedrock] Retrieved ${instances.length} instances`);
    
    return instances;
  } catch (error) {
    console.error("[Bedrock] Exception fetching instances:", error);
    return [];
  }
}

/**
 * Create a new Bedrock instance (provisioned model throughput)
 * Aligns with AWS Bedrock API operation: CreateProvisionedModelThroughput
 * 
 * @param {Object} modelInfo - Instance configuration
 * @param {string} modelInfo.modelId - The model ID
 * @param {string} modelInfo.commitmentDuration - Commitment duration
 * @param {number} modelInfo.modelUnits - Number of model units
 * @param {string} [modelInfo.provisionedModelName] - Optional custom name for the instance
 * @param {Object} [modelInfo.tags] - Optional tags to apply to the instance
 * @returns {Promise<{data: Object, error: string|null}>} New instance or error
 */
export async function createInstance(modelInfo) {
  console.log('[Bedrock] Creating instance with parameters:', JSON.stringify(modelInfo));
  
  // Validate required fields
  if (!modelInfo.modelId) {
    console.error('[Bedrock] Missing required modelId parameter');
    return { data: null, error: 'modelId is required' };
  }

  // Track retries
  let attempts = 0;
  const maxAttempts = 3;
  let lastError = null;
  
  // Convert 1m/6m commitment duration format to match what the API expects
  const modelData = {
    ...modelInfo,
    // Ensure modelId is explicitly set (with debugging output)
    modelId: modelInfo.modelId,
    // Convert from "1m" or "6m" to the format the API expects
    commitmentDuration: modelInfo.commitmentDuration || "1m",
    // Pass through the custom name if provided
    provisionedModelName: modelInfo.provisionedModelName || undefined,
    // Pass through tags if provided
    tags: modelInfo.tags && typeof modelInfo.tags === 'object' ? modelInfo.tags : undefined
  };
  
  console.log('[Bedrock] Structured model data for API call:', JSON.stringify(modelData));
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`[Bedrock] Create instance attempt ${attempts}/${maxAttempts}`);
    
    try {
      // Try with the AWS Bedrock API naming convention
      const result = await callEdgeFunction({
        action: 'CreateProvisionedModelThroughput',
        data: modelData,
        requireAuth: true
      });
      
      // If successful, return the result
      if (!result.error) {
        console.log('[Bedrock] Successfully created instance with standard API name');
        return result;
      }
      
      // Log the error but continue to try legacy endpoint
      console.warn(`[Bedrock] Standard API name failed (attempt ${attempts}): ${result.error}`);
      lastError = result.error;
      
      // Try the legacy name for backward compatibility
      console.log('[Bedrock] Trying legacy endpoint');
      const legacyResult = await callEdgeFunction({
        action: 'createInstance',
        data: modelData,
        requireAuth: true
      });
      
      // If legacy endpoint is successful, return the result
      if (!legacyResult.error) {
        console.log('[Bedrock] Successfully created instance with legacy endpoint');
        return legacyResult;
      }
      
      // Log the error from the legacy endpoint
      console.warn(`[Bedrock] Legacy endpoint failed (attempt ${attempts}): ${legacyResult.error}`);
      lastError = legacyResult.error;
      
      // If we're on the last attempt, return the error
      if (attempts >= maxAttempts) {
        console.error(`[Bedrock] All ${maxAttempts} attempts failed. Last error: ${lastError}`);
        return { data: null, error: lastError || 'Failed to create instance after multiple attempts' };
      }
      
      // Wait before retrying (exponential backoff)
      const delayMs = Math.min(1000 * Math.pow(2, attempts - 1), 8000);
      console.log(`[Bedrock] Waiting ${delayMs}ms before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
    } catch (error) {
      console.error(`[Bedrock] Exception on attempt ${attempts}:`, error);
      lastError = error instanceof Error ? error.message : String(error);
      
      // If we're on the last attempt, return the error
      if (attempts >= maxAttempts) {
        console.error(`[Bedrock] All ${maxAttempts} attempts failed due to exceptions. Last error: ${lastError}`);
        return { data: null, error: lastError };
      }
      
      // Wait before retrying (exponential backoff)
      const delayMs = Math.min(1000 * Math.pow(2, attempts - 1), 8000);
      console.log(`[Bedrock] Waiting ${delayMs}ms before next attempt after exception...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  // Fallback if all attempts fail (though this should be unreachable)
  console.error(`[Bedrock] Failed to create instance after ${maxAttempts} attempts`);
  return { 
    data: null, 
    error: lastError || 'Failed to create instance after multiple attempts' 
  };
}

/**
 * Delete a Bedrock instance (provisioned model throughput)
 * Aligns with AWS Bedrock API operation: DeleteProvisionedModelThroughput
 * 
 * @param {string} instanceId - ID of the instance to delete
 * @returns {Promise<{data: Object, error: string|null}>} Success status or error
 */
export async function deleteInstance(instanceId) {
  // Try first with the AWS Bedrock API naming convention
  const result = await callEdgeFunction({
    action: 'DeleteProvisionedModelThroughput',
    data: { provisionedModelId: instanceId },
    requireAuth: true
  });
  
  // If the standard name fails, try the legacy name for backward compatibility
  if (result.error) {
    console.log('[Bedrock] Standard API name failed, trying legacy endpoint');
    return callEdgeFunction({
      action: 'deleteInstance',
      data: { instanceId },
      requireAuth: true
    });
  }
  
  return result;
}

/**
 * Test the environment (PRODUCTION MODE - DISABLED)
 * This function is disabled in production mode
 *
 * @param {Object} options - Test options
 * @returns {Promise<Object>} Environment information for production
 */
export async function testEnvironment(options = {}) {
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
}

/**
 * Send a message to a Bedrock AI model
 * 
 * @param {Object} options - Invoke options
 * @param {number} options.instance_id - Instance ID
 * @param {string} options.prompt - The message to send
 * @param {number} options.max_tokens - Maximum tokens to generate
 * @returns {Promise<{data: Object, error: string|null}>} AI response or error
 */
export async function invokeModel({ instance_id, prompt, max_tokens = 500 }) {
  return callEdgeFunction({
    action: 'invokeModel',
    data: { 
      instance_id, 
      prompt, 
      max_tokens 
    },
    requireAuth: true
  });
}

/**
 * Get usage statistics for Bedrock instances
 * 
 * @param {Object} options - Optional parameters
 * @param {number} options.instance_id - Optional instance ID to filter stats
 * @param {string} options.timeframe - Optional timeframe (day, week, month, year)
 * @returns {Promise<{data: Object, error: string|null}>} Usage statistics or error
 */
export async function getUsageStats(options = {}) {
  return callEdgeFunction({
    action: 'getUsageStats',
    data: options,
    requireAuth: true
  });
}

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
        requireAuth: true // Explicitly require authentication for AWS permission tests
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
 * List all foundation models from AWS Bedrock.
 * @param {Object} filters - Optional filters for modelType, supported modalities, etc.
 * @returns {Promise<{models: Array<Object>}>} - List of foundation models
 */
export async function listFoundationModels(filters = {}) {
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
  
  try {
    // Call the API with the standard name
    const result = await callEdgeFunction({
      action: 'ListFoundationModels',
      data: validatedFilters,
      requireAuth: true
    });
    
    if (!result.error) {
      return result;
    }
    
    // Try the legacy API name if standard fails
    console.log('[Bedrock] Standard API name failed, trying legacy endpoint');
    const legacyResult = await callEdgeFunction({
      action: 'listModels',
      data: validatedFilters,
      requireAuth: true
    });
    
    if (!legacyResult.error) {
      return legacyResult;
    }
    
    // If all attempts fail, return a clear error
    console.error('[Bedrock] All model listing methods failed:', result.error);
    return {
      data: { models: [] },
      error: 'Failed to fetch foundation models from API'
    };
  } catch (error) {
    console.error('[Bedrock] Exception fetching foundation models:', error);
    return {
      data: { models: [] },
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * List accessible foundation models from AWS Bedrock that support provisioned throughput.
 * This filters for models that the account has access to and can be provisioned.
 * @returns {Promise<{models: Array<Object>}>} - List of accessible models supporting provisioned throughput
 */
export async function listAccessibleModels() {
  console.log("[DEBUG] listAccessibleModels called");
  
  try {
    // Use the proper callEdgeFunction format with action property
    const response = await callEdgeFunction({
      action: "ListAccessibleModels",
      data: {},
      requireAuth: true
    });
    
    const models = response?.models || [];
    console.log(`[DEBUG] listAccessibleModels got ${models.length} models:`, models);
    return response;
  } catch (error) {
    console.error("[DEBUG] Error in listAccessibleModels:", error);
    console.log("[DEBUG] Falling back to listFoundationModels");
    return listFoundationModels({
      inferenceTypesSupported: "PROVISIONED_THROUGHPUT"
    });
  }
}

/**
 * Check the authentication and connection status with AWS Bedrock
 * Makes a test call to AWS Bedrock to verify credentials and permissions
 * @returns {Promise<{connected: boolean, status: string, message: string}>} Auth status
 */
export async function checkAuth() {
  console.log("[Bedrock] Checking AWS auth status");
  try {
    // First, check if user is authenticated with Supabase
    const isAuthValid = await isAuthenticated();
    if (!isAuthValid) {
      console.log("[Bedrock] User is not authenticated with Supabase");
      return { 
        connected: false, 
        status: "unauthenticated", 
        message: "Not authenticated with Supabase" 
      };
    }
    
    // Test AWS connection by calling the TestAuth action
    const { data, error } = await callEdgeFunction({
      action: "TestAuth", 
      data: {},
      requireAuth: true
    });
    
    if (error) {
      console.error("[Bedrock] AWS auth check failed:", error);
      return { 
        connected: false, 
        status: "error", 
        message: error.message || "Failed to connect to AWS Bedrock",
        error
      };
    }
    
    console.log("[Bedrock] AWS auth check success:", data);
    return { 
      connected: true, 
      status: "connected", 
      message: "Successfully connected to AWS Bedrock",
      data
    };
  } catch (error) {
    console.error("[Bedrock] Error in checkAuth:", error);
    return { 
      connected: false, 
      status: "error", 
      message: error.message || "Error checking AWS Bedrock auth status",
      error
    };
  }
}

// Expose client functions
export const BedrockClient = {
  // Authentication
  getAuthSession,
  getAuthToken,
  isAuthenticated,
  validateApiConfiguration,
  checkAuth,
  
  // API operations
  callEdgeFunction,
  listInstances,
  createInstance,
  deleteInstance,
  testEnvironment,
  invokeModel,
  getUsageStats,
  testAwsPermissions,
  listFoundationModels,
  listAccessibleModels
};

export default BedrockClient; 