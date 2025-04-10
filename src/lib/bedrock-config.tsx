import React from "react";
/**
 * Bedrock API Configuration Module
 * Handles environment variables and provides configuration defaults
 * for working with AWS Bedrock via Supabase Edge Functions.
 */

// Always use production mode
const isProduction = true;
const isDev = false;
const isLocalDevelopment = false;

/**
 * Get the API URL for Bedrock
 * @returns {string} API URL
 */
const getApiUrl = (): void => {
  return '/api';
};

/**
 * Build the auth configuration
 */
const authConfig = {
  requireLogin: true,
  requireAdmin: true
};

/**
 * Check if debug mode is enabled
 * @returns {boolean} Whether debug mode is enabled
 */
const isDebugMode = (): void => {
  return false;
};

/**
 * Get the appropriate Edge Function name
 * @returns {string} Edge Function name
 */
const getEdgeFunctionName = (): void => {
  // Get from environment or use the default
  return import.meta.env.VITE_BEDROCK_FUNCTION_NAME || 'super-action';
};

/**
 * Get the Edge Function URL
 * @returns {string} Edge Function URL
 */
const getEdgeFunctionUrl = (): void => {
  const functionName = getEdgeFunctionName();
  
  // Always use production URL
  const supabaseUrl = 'https://injxxchotrvgvvzelhvj.supabase.co';
  
  return `${supabaseUrl}/functions/v1/${functionName}`;
};

/**
 * Determine if we should use Edge Functions
 * Always true in production, configurable in development
 */
const useEdgeFunctions = (): void => {
  // Always use edge functions in production
  if (isProduction) {
    return true;
  }
  
  // In development, check environment variable or default to true
  return import.meta.env.VITE_USE_EDGE_FUNCTIONS !== 'false';
interface BedrockConfigProps {}

};

/**
 * Determine if mock data should be used in development
 */
const shouldUseMockData = (): void => {
  // Never use mock data
  return false;
};

// Export configuration object
export const BedrockConfig = {
  apiUrl: getApiUrl(),
  useEdgeFunctions: true, // Always use edge functions
  edgeFunctionUrl: getEdgeFunctionUrl(),
  edgeFunctionName: getEdgeFunctionName(),
  isLocalDevelopment: false,
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