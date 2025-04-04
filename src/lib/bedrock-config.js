/**
 * Bedrock API Configuration Module
 * Handles environment variables and provides configuration defaults
 */

// Local development feature detection
const isLocalDevelopment = import.meta.env.MODE === 'development';

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
  
  // Production default - should be '/api/bedrock'
  // This will route through your application's API proxy
  return '/api/bedrock';
};

/**
 * Get API key from environment variables
 */
const getApiKey = () => {
  return import.meta.env.VITE_BEDROCK_API_KEY || '';
};

/**
 * Determine if we're using Supabase Edge Functions
 * By default, we assume we are in production but not in development
 */
const useEdgeFunctions = () => {
  const explicitSetting = import.meta.env.VITE_USE_EDGE_FUNCTIONS;
  
  // If explicitly set, use that value
  if (explicitSetting !== undefined) {
    return explicitSetting === 'true';
  }
  
  // Otherwise, use Edge Functions in production but not in development
  return !isLocalDevelopment;
};

/**
 * Get the Edge Function URL
 */
const getEdgeFunctionUrl = () => {
  const supabaseProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  
  if (!supabaseProjectId) {
    console.warn('No Supabase project ID configured for Edge Functions');
    return null;
  }
  
  return `https://${supabaseProjectId}.supabase.co/functions/v1/bedrock`;
};

// Export configuration object
export const BedrockConfig = {
  apiUrl: getApiUrl(),
  apiKey: getApiKey(),
  useEdgeFunctions: useEdgeFunctions(),
  edgeFunctionUrl: getEdgeFunctionUrl(),
  isLocalDevelopment,
  
  // Debug configuration
  debug: isLocalDevelopment || import.meta.env.VITE_DEBUG === 'true',
  
  // Default model settings
  defaultModel: 'amazon.titan-text-express-v1',
  defaultCommitmentDuration: 'MONTH_1',
  defaultModelUnits: 1
};

export default BedrockConfig; 