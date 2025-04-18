/**
 * API Route: /api/super-action
 * 
 * This route forwards requests to the Supabase Edge Function
 * for AWS Bedrock operations.
 */

// The URL of the Supabase Edge Function
const SUPABASE_FUNCTION_URL = 'https://injxxchotrvgvvzelhvj.supabase.co/functions/v1/super-action';

// CORS headers for all responses
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, X-Client-Info',
  'Access-Control-Allow-Credentials': 'true'
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
 * Main handler function for the API route
 */
export default async function handler(req, res) {
  // Set CORS headers for all responses
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // For GET requests, return a simple success message to confirm the route is working
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'API route is working',
      info: 'This endpoint accepts POST requests for Bedrock API operations'
    });
  }

  // Handle POST requests
  if (req.method === 'POST') {
    try {
      // Get action and data from request body
      const { action, data } = req.body || {};
      
      console.log(`[API] Processing action: ${action}`);
      
      // Validate required parameters
      if (!action) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Missing required action parameter'
        });
      }

      // Get authorization header and format it correctly
      const rawAuthHeader = req.headers.authorization;
      
      // For certain actions that don't require authentication, proceed without auth
      const noAuthActions = ['testEnvironment', 'test'];
      const requiresAuth = !noAuthActions.includes(action);
      
      if (requiresAuth && !rawAuthHeader) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Missing Authorization header'
        });
      }
      
      // Format the auth header to ensure it has 'Bearer ' prefix
      const authHeader = formatAuthHeader(rawAuthHeader);
      
      console.log(`[API] Auth header formatted: ${authHeader ? 'Yes' : 'No'}`);

      // Headers to forward to Supabase Function
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Only add Authorization header if it exists
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }

      // Forward x-client-info header if present
      if (req.headers['x-client-info']) {
        headers['x-client-info'] = req.headers['x-client-info'];
      }

      // Forward apikey header if present
      if (req.headers['apikey']) {
        headers['apikey'] = req.headers['apikey'];
      }
      
      // Debug log for troubleshooting
      console.log(`[API] Forwarding request to ${SUPABASE_FUNCTION_URL} with action: ${action}`);
      console.log(`[API] Headers: ${JSON.stringify(headers, null, 2)}`);

      // Forward the request to Supabase Edge Function
      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, data })
      });

      // Get response data based on content type
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      // Debug log the response status
      console.log(`[API] Received response status: ${response.status}`);

      // Forward the response status and data
      return res.status(response.status).json(responseData);
    } catch (error) {
      console.error('[API] Error processing request:', error);
      
      return res.status(500).json({ 
        error: 'Internal Server Error', 
        message: error.message || 'An unexpected error occurred'
      });
    }
  }

  // For all other HTTP methods, return Method Not Allowed
  return res.status(405).json({ 
    error: 'Method Not Allowed',
    message: 'This endpoint only accepts GET and POST requests'
  });
}