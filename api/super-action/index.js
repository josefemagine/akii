// /api/super-action API route for Vercel serverless functions
// This provides a direct proxy to the Supabase Edge Function for AWS Bedrock operations

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
 * Main handler function for the API route
 * Compatible with Vercel serverless functions
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
      // Ensure we have a valid body - parse it safely
      if (!req.body) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Missing request body'
        });
      }
      
      // Log what we received
      console.log('[API] Request body type:', typeof req.body);
      
      // Get action and data from request body
      let action, data;
      
      // Handle different body formats
      if (typeof req.body === 'string') {
        try {
          const parsedBody = JSON.parse(req.body);
          action = parsedBody.action;
          data = parsedBody.data;
        } catch (e) {
          console.error('[API] Failed to parse string body:', e);
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid JSON string in request body'
          });
        }
      } else {
        // Assume it's already an object
        action = req.body.action;
        data = req.body.data;
      }
      
      console.log(`[API] Processing action: ${action}`, data);
      
      // Validate required parameters
      if (!action) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Missing required action parameter'
        });
      }

      // Get authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Missing Authorization header'
        });
      }

      // Headers to forward to Supabase Function
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      };

      // Forward x-client-info header if present
      if (req.headers['x-client-info']) {
        headers['x-client-info'] = req.headers['x-client-info'];
      }

      // Forward apikey header if present
      if (req.headers['apikey']) {
        headers['apikey'] = req.headers['apikey'];
      }

      // Create the request body
      const requestBody = JSON.stringify({ action, data });

      // Forward the request to Supabase Edge Function
      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: requestBody
      });

      // Check for error status first
      if (!response.ok) {
        const errorStatus = response.status;
        try {
          const errorText = await response.text();
          console.error(`[API] Error response from Supabase (${errorStatus}):`, errorText);
          
          // Try to parse as JSON if possible
          try {
            const errorJson = JSON.parse(errorText);
            return res.status(errorStatus).json(errorJson);
          } catch (e) {
            // If not JSON, return as text
            return res.status(errorStatus).json({ 
              error: 'Edge Function Error', 
              message: errorText || 'Unknown error'
            });
          }
        } catch (e) {
          return res.status(errorStatus).json({ 
            error: 'Edge Function Error', 
            message: `Status ${errorStatus}`
          });
        }
      }

      // For successful responses, get the response data
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
        
        // Try to parse as JSON if it looks like JSON
        if (responseData.startsWith('{') || responseData.startsWith('[')) {
          try {
            responseData = JSON.parse(responseData);
          } catch (e) {
            // Keep as text if parsing fails
          }
        }
      }

      console.log(`[API] Success response from Supabase: ${response.status}`);
      
      // Forward the response data
      return res.status(200).json(responseData);
    } catch (error) {
      console.error('[API] Error processing request:', error);
      
      return res.status(500).json({ 
        error: 'Internal Server Error', 
        message: error.message || 'An unexpected error occurred',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // For all other HTTP methods, return Method Not Allowed
  return res.status(405).json({ 
    error: 'Method Not Allowed',
    message: 'This endpoint only accepts GET and POST requests'
  });
} 