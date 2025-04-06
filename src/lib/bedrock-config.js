/**
 * Bedrock API Configuration Module
 * Handles environment variables and provides configuration defaults
 * for working with AWS Bedrock via Supabase Edge Functions.
 */

// Environment detection
const isLocalDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

// Get Supabase URL from environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';

/**
 * Authentication configuration
 * JWT is required for accessing the Bedrock Edge Function
 */
const authConfig = {
  // JWT refresh settings - refresh token when it's within 5 minutes of expiry
  refreshTokenThreshold: 5 * 60 * 1000, // 5 minutes in milliseconds
  // Require authentication for all Bedrock operations
  requireAuth: true,
  // JWT expiry time in seconds (defaults to 1 hour = 3600 seconds)
  tokenExpirySeconds: 3600,
};

/**
 * API base URL - prioritizes environment variables with fallbacks
 * In production, this should be set to your deployed API endpoint
 */
const getApiUrl = () => {
  // First try environment variable
  const envApiUrl = import.meta.env.VITE_BEDROCK_API_URL;
  
  if (envApiUrl) {
    // Ensure URL has no trailing slash
    return envApiUrl.endsWith('/') ? envApiUrl.slice(0, -1) : envApiUrl;
  }
  
  // Production default - using the edge function URL
  return 'https://injxxchotrvgvvzelhvj.supabase.co/functions/v1/super-action';
};

/**
 * Get the appropriate Edge Function name
 * @returns {string} Edge Function name
 */
const getEdgeFunctionName = () => {
  // Get from environment or use the default
  return import.meta.env.VITE_BEDROCK_FUNCTION_NAME || 'super-action';
};

/**
 * Get the Edge Function URL
 * @returns {string} Edge Function URL
 */
const getEdgeFunctionUrl = () => {
  const functionName = getEdgeFunctionName();
  
  if (!supabaseUrl) {
    console.error('Supabase URL is required for edge functions');
    return '';
  }
  
  return `${supabaseUrl}/functions/v1/${functionName}`;
};

/**
 * Determine if we should use Edge Functions
 * Always true in production, configurable in development
 */
const useEdgeFunctions = () => {
  // Always use edge functions in production
  if (isProduction) {
    return true;
  }
  
  // In development, check environment variable or default to true
  return import.meta.env.VITE_USE_EDGE_FUNCTIONS !== 'false';
};

/**
 * Check if debug mode is enabled
 */
const isDebugMode = () => {
  return import.meta.env.VITE_BEDROCK_DEBUG === 'true';
};

/**
 * Determine if mock data should be used in development
 */
const shouldUseMockData = () => {
  // Never use mock data
  return false;
};

// Export configuration object
export const BedrockConfig = {
  apiUrl: getApiUrl(),
  useEdgeFunctions: true, // Always use edge functions
  edgeFunctionUrl: getEdgeFunctionUrl(),
  edgeFunctionName: getEdgeFunctionName(),
  isLocalDevelopment,
  isProduction: true, // Always treat as production mode
  isDev: false, // Never treat as development mode
  
  // Authentication configuration
  auth: authConfig,
  
  // Debug configuration
  debug: isDebugMode(),
  
  // Development mock data settings
  useMockData: false, // Never use mock data
  
  // Default model settings
  defaultModel: 'amazon.titan-text-express-v1',
  defaultCommitmentDuration: 'MONTH_1',
  defaultModelUnits: 1
};

export default BedrockConfig; 