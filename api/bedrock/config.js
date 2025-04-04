// This file redirects from the old Vercel API function to the new Next.js API route
// TEMPORARY FIX: This file should be removed once deployment is complete

/**
 * Valid API keys - simplified implementation 
 * that accepts any reasonable length key for compatibility
 */
export const isValidApiKey = (apiKey) => {
  console.log('[LEGACY API] API key validation requested - using temporary compatibility layer');
  // Accept any non-empty API key of reasonable length
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
  console.log(`[LEGACY API] [${new Date().toISOString()}] ${method} ${endpoint}`, data);
}; 