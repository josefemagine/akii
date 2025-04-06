/**
 * API Route: /api/super-action-test
 * 
 * Simple diagnostic endpoint to check the status of the Supabase Edge Function
 * and help diagnose boot errors.
 */

// The URL of the Supabase Edge Function
const SUPABASE_FUNCTION_URL = 'https://injxxchotrvgvvzelhvj.supabase.co/functions/v1/super-action';

// CORS headers for all responses
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, X-Client-Info',
  'Access-Control-Allow-Credentials': 'true'
};

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

  // For GET or POST requests, perform a basic test
  if (req.method === 'GET' || req.method === 'POST') {
    try {
      // Minimal request to test the function existence without triggering full boot
      const testBody = {
        action: 'testEnvironment',
        data: {
          minimal: true
        }
      };

      // Basic headers required for the call
      const headers = {
        'Content-Type': 'application/json'
      };

      // Get Authorization header if present
      if (req.headers.authorization) {
        // Make sure it's properly formatted
        const auth = req.headers.authorization;
        headers['Authorization'] = auth.trim().startsWith('Bearer ') 
          ? auth 
          : `Bearer ${auth.trim().replace(/^(bearer|jwt|token)\s+/i, '')}`;
      }

      console.log(`[Test API] Sending diagnostic request to Supabase Function`);
      console.log(`[Test API] Headers: ${JSON.stringify(headers, null, 2)}`);

      // Make a simple request to check if the function endpoint is accessible
      const functionResponse = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(testBody)
      });

      // Get response data based on content type
      let responseData;
      const contentType = functionResponse.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await functionResponse.json();
        } catch (e) {
          responseData = { error: 'Failed to parse JSON response', rawText: await functionResponse.text() };
        }
      } else {
        responseData = await functionResponse.text();
      }

      // Return diagnostic information
      return res.status(200).json({
        status: 'success',
        functionStatus: functionResponse.status,
        functionResponse: responseData,
        diagnostics: {
          url: SUPABASE_FUNCTION_URL,
          requestedAt: new Date().toISOString(),
          responseStatus: functionResponse.status,
          responseHeaders: Object.fromEntries([...functionResponse.headers.entries()]),
          responseSize: JSON.stringify(responseData).length
        },
        message: 'Diagnostic test completed. Check the results for Supabase function status.'
      });
    } catch (error) {
      console.error('[Test API] Error during diagnostic test:', error);
      
      return res.status(500).json({ 
        status: 'error',
        error: 'Diagnostic Test Failed',
        details: {
          message: error.message || 'An unexpected error occurred',
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          url: SUPABASE_FUNCTION_URL
        },
        troubleshooting: {
          checkSupabaseStatus: "Verify Supabase is up at https://status.supabase.com",
          checkProjectStatus: "Login to your Supabase dashboard and check Edge Function status",
          checkFunctionLogs: "Check the logs in Supabase dashboard for the 'super-action' function"
        }
      });
    }
  }

  // For all other HTTP methods, return Method Not Allowed
  return res.status(405).json({ 
    error: 'Method Not Allowed',
    message: 'This endpoint only accepts GET and POST requests'
  });
} 