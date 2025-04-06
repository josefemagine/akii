// /api/super-action-test API route for diagnostic purposes
// This provides a simplified test endpoint to diagnose API connectivity issues

// CORS headers for all responses
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, X-Client-Info',
  'Access-Control-Allow-Credentials': 'true'
};

/**
 * Main handler function for the diagnostic API route
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

  // For GET requests, return a simple success message
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Diagnostic API route is working',
      info: 'This endpoint is for testing API connectivity'
    });
  }

  // Handle POST requests
  if (req.method === 'POST') {
    try {
      // Ensure we have a valid body
      if (!req.body) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Missing request body'
        });
      }
      
      // Log what we received
      console.log('[DIAGNOSTIC] Request body type:', typeof req.body);
      
      // Get action and data from request body
      let action, data, clientVersion, timestamp;
      
      // Handle different body formats
      if (typeof req.body === 'string') {
        try {
          const parsedBody = JSON.parse(req.body);
          action = parsedBody.action;
          data = parsedBody.data;
          clientVersion = parsedBody.clientVersion;
          timestamp = parsedBody.timestamp;
        } catch (e) {
          console.error('[DIAGNOSTIC] Failed to parse string body:', e);
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid JSON string in request body'
          });
        }
      } else {
        // Assume it's already an object
        action = req.body.action;
        data = req.body.data;
        clientVersion = req.body.clientVersion;
        timestamp = req.body.timestamp;
      }
      
      console.log(`[DIAGNOSTIC] Processing action: ${action}`);
      
      // Get authorization header for diagnostics
      const authHeader = req.headers.authorization;
      const hasAuth = Boolean(authHeader);

      // For testEnvironment action, return diagnostic data
      if (action === 'testEnvironment') {
        return res.status(200).json({
          status: 'completed',
          diagnostics: {
            statusCode: 200,
            apiVersion: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            serverInfo: {
              nodeVersion: process.version,
              platform: process.platform
            },
            auth: {
              hasAuthHeader: hasAuth,
              headerLength: authHeader ? authHeader.length : 0
            },
            request: {
              action,
              clientVersion,
              timestamp,
              received: new Date().toISOString()
            },
            message: 'Diagnostic test completed successfully'
          }
        });
      }

      // For any other action, return a generic success response
      return res.status(200).json({
        status: 'completed',
        message: `Action '${action}' acknowledged`,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('[DIAGNOSTIC] Error processing request:', error);
      
      return res.status(500).json({ 
        error: 'Internal Server Error', 
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // For all other HTTP methods, return Method Not Allowed
  return res.status(405).json({ 
    error: 'Method Not Allowed',
    message: 'This endpoint only accepts GET and POST requests'
  });
} 