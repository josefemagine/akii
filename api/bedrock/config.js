// Configuration and utilities for the Bedrock API endpoints

/**
 * Valid API keys
 * In a real application, these would be stored in a database
 */
// api/bedrock/config.js
export const isValidApiKey = (key) => key === process.env.BEDROCK_API_KEY;
export const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;
// Add other shared configuration here
];

/**
 * Validate an API key
 * @param {string} apiKey - The API key to validate
 * @returns {boolean} - Whether the key is valid
 */
export const isValidApiKey = (apiKey) => {
  if (!apiKey) return false;
  return validApiKeys.includes(apiKey);
};

/**
 * Set CORS headers for all Bedrock API responses
 * @param {Object} res - Express response object
 */
export const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
};

/**
 * Handle OPTIONS requests for CORS preflight
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {boolean} - Whether the request was handled
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
 * @param {string} endpoint - The API endpoint
 * @param {string} method - The HTTP method
 * @param {Object} data - Additional data to log
 */
export const logApiRequest = (endpoint, method, data = {}) => {
  console.log(`[${new Date().toISOString()}] ${method} ${endpoint}`, data);
}; 