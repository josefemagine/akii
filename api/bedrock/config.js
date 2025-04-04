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
 * Normalize an API key by trimming whitespace and removing any special formatting
 * @param {string} key - The API key to normalize
 * @returns {string} The normalized API key
 */
function normalizeApiKey(key) {
  if (!key) return '';
  
  // Trim whitespace, remove quotes if present
  return key.trim().replace(/^["']|["']$/g, '');
}

/**
 * Validate an API key against the stored value
 * @param {string} apiKey - The API key to validate
 * @returns {boolean} True if the key is valid
 */
export function isValidApiKey(apiKey) {
  // Get the API key from the environment using our utility
  const storedApiKey = getBedrockApiKey();
  
  // Normalize the keys for comparison to handle potential encoding differences
  const normalizedInput = normalizeApiKey(apiKey);
  const normalizedStored = normalizeApiKey(storedApiKey);
  
  // Log info about the API key validation request
  console.log(`[AUTH] API Key validation request - Provided key length: ${normalizedInput ? normalizedInput.length : 0}`);
  console.log(`[AUTH] Stored API key present: ${Boolean(normalizedStored)}, Length: ${normalizedStored ? normalizedStored.length : 0}`);
  
  // If there's no API key provided, it's invalid
  if (!normalizedInput) {
    console.warn('[AUTH] No API key provided in request');
    return false;
  }
  
  // Check if there's a stored API key
  if (!normalizedStored) {
    // If there's no stored key in development, we'll accept any key (for testing)
    const isDev = process.env.NODE_ENV !== 'production';
    console.log(`[AUTH] No stored API key found. Running in ${isDev ? 'development' : 'production'} mode.`);
    
    if (isDev) {
      console.log('[AUTH] Development mode: Accepting any non-empty API key');
      return Boolean(normalizedInput);
    } else {
      console.warn('[AUTH] Production mode: Rejecting request due to missing stored API key');
      return false;
    }
  }
  
  // In production, strictly validate the API key
  const isValid = normalizedInput === normalizedStored;
  
  // Log the validation result (without exposing the actual keys)
  if (isValid) {
    console.log('[AUTH] API key validation successful');
  } else {
    console.warn('[AUTH] API key validation failed - keys do not match');
    // Additional debugging for key mismatches
    if (normalizedInput && normalizedStored) {
      console.log(`[AUTH] Key comparison: lengths ${normalizedInput.length} vs ${normalizedStored.length}, first char match: ${normalizedInput[0] === normalizedStored[0]}, last char match: ${normalizedInput.slice(-1) === normalizedStored.slice(-1)}`);
    }
  }
  
  return isValid;
}

/**
 * Log an API request (for debugging)
 */
export const logApiRequest = (endpoint, method, data = {}) => {
  console.log(`[API] ${method} ${endpoint}`, data);
}; 