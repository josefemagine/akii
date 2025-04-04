// Configuration and utilities for the Bedrock API endpoints
import { getBedrockApiKey } from './env-utils.js';

/**
 * Handle CORS for API responses
 */
export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
}

/**
 * Handle OPTIONS requests for CORS
 * @returns {boolean} True if the request was handled
 */
export function handleOptionsRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Validate an API key against the stored value
 * @param {string} apiKey - The API key to validate
 * @returns {boolean} True if the key is valid
 */
export function isValidApiKey(apiKey) {
  // Get the API key from the environment using our utility
  const storedApiKey = getBedrockApiKey();
  
  // Log info about the API key (but not the actual key)
  console.log(`[AUTH] API Key validation - Provided: ${Boolean(apiKey)}, Stored: ${Boolean(storedApiKey)}`);
  
  // Check if there's a stored API key
  if (!storedApiKey) {
    // If there's no stored key in development, we'll accept any key (for testing)
    console.log('[AUTH] No stored API key found, accepting any key in development');
    return process.env.NODE_ENV !== 'production';
  }
  
  // In production, strictly validate the API key
  const isValid = apiKey === storedApiKey;
  
  if (!isValid) {
    console.warn('[AUTH] Invalid API key provided');
  }
  
  return isValid;
}

/**
 * Log an API request (for debugging)
 */
export const logApiRequest = (endpoint, method, data = {}) => {
  console.log(`[API] ${method} ${endpoint}`, data);
}; 