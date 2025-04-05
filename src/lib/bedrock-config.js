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
  return 'https://api.akii.com/functions/v1/super-action';
};

/**
 * Determine if we're using Supabase Edge Functions
 * Default behavior is to use Edge Functions in all environments
 * unless explicitly disabled via environment variable
 */
const useEdgeFunctions = () => {
  const explicitSetting = import.meta.env.VITE_USE_EDGE_FUNCTIONS;
  
  // If explicitly set, use that value
  if (explicitSetting !== undefined) {
    return explicitSetting === 'true';
  }
  
  // By default, use Edge Functions everywhere unless disabled
  return true;
};

/**
 * Get the Edge Function URL for Bedrock
 */
const getEdgeFunctionUrl = () => {
  // In local development, use the Vite proxy to avoid CORS issues
  if (isLocalDevelopment) {
    return '/api/super-action';
  }
  
  // For production, check if there's an environment variable
  if (import.meta.env.VITE_BEDROCK_API_URL) {
    return import.meta.env.VITE_BEDROCK_API_URL;
  }
  
  // Fallback to the Supabase project URL (which we can see from the error logs)
  return 'https://injxxchotrvgvvzelhvj.supabase.co/functions/v1/super-action';
};

/**
 * Get the Edge Function name for Bedrock
 * This is the name used when invoking the function via Supabase client
 */
const getEdgeFunctionName = () => {
  return 'super-action';
};

/**
 * Determine if debug mode is enabled
 */
const isDebugMode = () => {
  const debugSetting = import.meta.env.VITE_DEBUG;
  return debugSetting === 'true' || isLocalDevelopment;
};

/**
 * Determine if mock data should be used in development
 */
const shouldUseMockData = () => {
  const mockSetting = import.meta.env.VITE_USE_MOCK_BEDROCK;
  const mockSuperAction = import.meta.env.VITE_USE_MOCK_SUPER_ACTION;
  
  // Use mock data if either variable is true
  return mockSetting === 'true' || mockSuperAction === 'true' || isLocalDevelopment;
};

// Export configuration object
export const BedrockConfig = {
  apiUrl: getApiUrl(),
  useEdgeFunctions: useEdgeFunctions(),
  edgeFunctionUrl: getEdgeFunctionUrl(),
  edgeFunctionName: getEdgeFunctionName(),
  isLocalDevelopment,
  isProduction,
  isDev: isLocalDevelopment,
  
  // Authentication configuration
  auth: authConfig,
  
  // Debug configuration
  debug: isDebugMode(),
  
  // Development mock data settings
  useMockData: shouldUseMockData(),
  
  // Default model settings
  defaultModel: 'amazon.titan-text-express-v1',
  defaultCommitmentDuration: 'MONTH_1',
  defaultModelUnits: 1
};

export default BedrockConfig; 