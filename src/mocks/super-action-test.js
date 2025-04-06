/**
 * Mock API endpoint for /api/super-action-test
 * 
 * This file provides a local mock implementation for the Supabase Bedrock diagnostic endpoint
 * used by the SupabaseBedrock.tsx component.
 */

export function handleSuperActionTest(req) {
  console.log('[MOCK] Received super-action-test request:', req.method, req.url);
  
  // For GET requests, return a simple success message
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({
        message: 'Mock diagnostic API route is working',
        info: 'This endpoint is for testing API connectivity'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  // Handle POST requests
  if (req.method === 'POST') {
    return req.json().then(body => {
      console.log('[MOCK] POST body:', body);
      
      // Get action and data from request body
      const { action, data, clientVersion, timestamp } = body || {};
      
      // For testEnvironment action, return diagnostic data
      if (action === 'testEnvironment') {
        return new Response(
          JSON.stringify({
            status: 'completed',
            diagnostics: {
              statusCode: 200,
              apiVersion: '1.0.0',
              environment: 'development',
              serverInfo: {
                type: 'mock',
                version: '1.0.0',
                platform: 'browser'
              },
              auth: {
                hasAuthHeader: req.headers.has('Authorization'),
                headerLength: req.headers.get('Authorization')?.length || 0
              },
              request: {
                action,
                clientVersion,
                timestamp,
                received: new Date().toISOString()
              },
              message: 'Mock diagnostic test completed successfully'
            }
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // For any other action, return a generic success response
      return new Response(
        JSON.stringify({
          status: 'completed',
          message: `Action '${action}' acknowledged`,
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    });
  }
  
  // For all other HTTP methods, return Method Not Allowed
  return new Response(
    JSON.stringify({ 
      error: 'Method Not Allowed',
      message: 'This endpoint only accepts GET and POST requests'
    }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
} 