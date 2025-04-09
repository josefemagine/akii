// Test runner for edge functions
import serve from "https://deno.land/std@0.208.0/http/server.ts";

// CORS headers for local development
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Handle CORS preflight requests
function handleCors(req: Request): Response {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return new Response('Method Not Allowed', { 
    status: 405,
    headers: corsHeaders 
  });
}

// Main server
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return handleCors(req);
  }

  try {
    // Log request details
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', Object.fromEntries(req.headers));

    // Run tests and collect results
    const results = {
      timestamp: new Date().toISOString(),
      tests: [] as Array<{name: string; status: string; logs: string[]}>,
    };

    // Run each test in a separate try-catch block
    try {
      const testModule = await import('./tests/local-test.ts');
      
      // Run logging test
      if (typeof testModule.testEdgeFunctionLogging === 'function') {
        await testModule.testEdgeFunctionLogging();
        results.tests.push({
          name: 'Edge Function Logging Test',
          status: 'passed',
          logs: ['Test completed successfully'],
        });
      } else {
        throw new Error('testEdgeFunctionLogging is not a function');
      }

      // Run error logging test
      if (typeof testModule.testEdgeFunctionErrorLogging === 'function') {
        await testModule.testEdgeFunctionErrorLogging();
        results.tests.push({
          name: 'Edge Function Error Logging Test',
          status: 'passed',
          logs: ['Test completed successfully'],
        });
      } else {
        throw new Error('testEdgeFunctionErrorLogging is not a function');
      }
    } catch (error) {
      results.tests.push({
        name: 'Test Suite',
        status: 'failed',
        logs: [`Test failed: ${error.message}`],
      });
    }

    // Return test results with CORS headers
    return new Response(JSON.stringify(results, null, 2), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error running tests:', error);
    
    // Return error with CORS headers
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error.message,
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
}); 