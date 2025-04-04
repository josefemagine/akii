// Simplified config.js for legacy compatibility
// Handles module resolution issues in Vercel deployment

/**
 * Valid API keys - simplified implementation 
 * that accepts any reasonable length key for compatibility
 */
export const isValidApiKey = (apiKey) => {
  // Simple validation - accept any non-empty API key of reasonable length
  return Boolean(apiKey && apiKey.length > 10);
};

/**
 * Set CORS headers for all Bedrock API responses
 */
export const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
};

/**
 * Handle OPTIONS requests for CORS preflight
 */
export const handleOptionsRequest = (req, res) => {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.status(200).end();
    return true;
  }
  return false;
};

/**
 * Log an API request (for debugging)
 */
export const logApiRequest = (endpoint, method, data = {}) => {
  console.log(`[LEGACY API] ${method} ${endpoint}`, data);
}; 