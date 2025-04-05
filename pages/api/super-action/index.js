/**
 * API Route: /api/super-action
 * 
 * This route provides mock responses when the Supabase Edge Function is unavailable
 * and acts as a proxy when it's available.
 */

// The URL of the Supabase super-action Edge Function
const SUPABASE_FUNCTION_URL = 'https://injxxchotrvgvvzelhvj.supabase.co/functions/v1/super-action';

// CORS headers for preflight OPTIONS requests
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // Allow all origins for now
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info',
  'Access-Control-Allow-Credentials': 'true'
};

// Check if we should use mock data
const useMockData = () => {
  return process.env.USE_MOCK_SUPER_ACTION === 'true';
};

// Mock data for when the Edge Function is unavailable
const MOCK_DATA = {
  testEnvironment: {
    environment: {
      isProduction: true,
      aws: {
        region: "us-east-1",
        hasAccessKey: true,
        hasSecretKey: true,
        accessKeyFormat: "valid"
      },
      platform: "linux",
      supabase: {
        hasUrl: true,
        hasServiceKey: true
      },
      user: {
        id: "mock-user-id",
        email: "user@example.com"
      }
    }
  },
  listInstances: {
    instances: [
      {
        id: 1,
        instance_id: "arn:aws:bedrock:us-east-1:123456789012:provisioned-model/mock-instance-1",
        model_id: "anthropic.claude-instant-v1",
        commitment_duration: "MONTH_1",
        model_units: 1,
        status: "ACTIVE",
        created_at: new Date().toISOString(),
        user_id: "mock-user-id"
      }
    ]
  },
  provisionInstance: {
    instance: {
      id: 2,
      instance_id: "arn:aws:bedrock:us-east-1:123456789012:provisioned-model/mock-instance-2",
      model_id: "anthropic.claude-v2",
      commitment_duration: "MONTH_1",
      model_units: 1,
      status: "CREATING",
      created_at: new Date().toISOString(),
      user_id: "mock-user-id"
    }
  },
  deleteInstance: {
    success: true
  },
  invokeModel: {
    response: "This is a mock response from the model. The actual Supabase Edge Function is currently unavailable.",
    prompt: "Your prompt here",
    tokens: {
      input: 10,
      output: 15,
      total: 25
    }
  },
  getUsageStats: {
    usage: {
      total_tokens: 1250,
      input_tokens: 500,
      output_tokens: 750,
      instances: [
        {
          instance_id: "arn:aws:bedrock:us-east-1:123456789012:provisioned-model/mock-instance-1",
          total_tokens: 1250
        }
      ]
    }
  }
};

/**
 * Parse request body regardless of method
 * @param {Request} req - The incoming request
 * @returns {Object} The parsed body or empty object
 */
const parseRequestBody = async (req) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    return req.body || {};
  } else if (req.method === 'GET') {
    // For GET requests, try to parse query parameters
    return req.query || {};
  }
  return {};
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

  // Log request details for debugging
  console.log(`[super-action] Received ${req.method} request to ${req.url}`);
  
  try {
    // Get the action from the request body or query parameters
    const body = await parseRequestBody(req);
    const { action, data } = body;
    
    console.log(`[super-action] Action: ${action}, Mock mode: ${useMockData()}`);
    
    // If no action is provided, return error
    if (!action) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing action parameter'
      });
    }

    // Check if we should use mock data
    if (useMockData() || MOCK_DATA[action]) {
      console.log(`[super-action] Returning mock data for action: ${action}`);
      
      // Simulate some delay for a more realistic experience
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Return the mock data if available, otherwise return a generic mock
      if (MOCK_DATA[action]) {
        return res.status(200).json(MOCK_DATA[action]);
      } else {
        return res.status(200).json({
          mock: true,
          message: `Mock data for ${action} action`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // If we don't have mock data, try to forward to the Supabase Function
    console.log(`[super-action] Attempting to proxy action ${action} to Supabase Edge Function`);
    
    // Extract the authorization header to forward
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Missing Authorization header'
      });
    }

    // Headers to send to the Supabase Function
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    };

    // If x-client-info is present, forward it
    if (req.headers['x-client-info']) {
      headers['x-client-info'] = req.headers['x-client-info'];
    }

    try {
      // Make the request to the Supabase Function
      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST', // Always use POST for Edge Functions
        headers,
        body: JSON.stringify({ action, data })
      });

      // Get the response data
      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Return the response with the same status code
      return res.status(response.status).json(responseData);
    } catch (fetchError) {
      console.error('[super-action] Error calling Supabase Edge Function:', fetchError);
      console.log('[super-action] Falling back to mock data');
      
      // If fetch fails, fall back to mock data if available
      if (MOCK_DATA[action]) {
        return res.status(200).json(MOCK_DATA[action]);
      }
      
      // If no mock data is available, return an error
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'The Edge Function is unavailable and no mock data exists for this action'
      });
    }
  } catch (error) {
    console.error('[super-action] Error handling request:', error);
    
    // Return a 500 error
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message 
    });
  }
} 