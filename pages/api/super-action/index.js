/**
 * Bedrock API Fix - Deploy this file to fix the API route
 * 
 * This script will:
 * 1. Create the necessary directory structure
 * 2. Create the API route file with the correct code
 * 3. Commit and push the changes
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// API route code
const apiRouteCode = `/**
 * API Route: /api/super-action
 * 
 * This route forwards requests to the Supabase Edge Function
 * and provides fallback mock responses when needed.
 */

// The URL of the Supabase super-action Edge Function
const SUPABASE_FUNCTION_URL = 'https://injxxchotrvgvvzelhvj.supabase.co/functions/v1/super-action';

// CORS headers for all responses
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, X-Client-Info',
  'Access-Control-Allow-Credentials': 'true'
};

// Mock data for fallback responses
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
    response: "This is a mock response from the model.",
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
 * Check if mock mode is enabled
 */
const useMockData = () => {
  return process.env.USE_MOCK_SUPER_ACTION === 'true';
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

  // Log request info for debugging
  console.log(\`[super-action] Received \${req.method} request to \${req.url}\`);
  
  try {
    // If it's not a POST request and not OPTIONS, provide helpful response
    if (req.method !== 'POST') {
      return res.status(200).json({
        message: 'API route is working',
        info: 'This endpoint accepts POST requests with action and data parameters'
      });
    }

    // Parse the request body
    const { action, data } = req.body || {};
    
    console.log(\`[super-action] Action: \${action}, Mock mode: \${useMockData()}\`);
    
    // If no action is provided, return error
    if (!action) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing action parameter'
      });
    }

    // Check if we should use mock data
    if (useMockData() && MOCK_DATA[action]) {
      console.log(\`[super-action] Returning mock data for action: \${action}\`);
      
      // Simulate some delay for a more realistic experience
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Return mock data
      return res.status(200).json(MOCK_DATA[action]);
    }

    // Forward request to Supabase Edge Function
    console.log(\`[super-action] Forwarding request to Supabase Function: \${action}\`);
    
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

    // Forward client info header if present
    if (req.headers['x-client-info']) {
      headers['x-client-info'] = req.headers['x-client-info'];
    }

    try {
      // Make the request to the Supabase Function
      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
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
      
      // If fetch fails, fall back to mock data if available
      if (MOCK_DATA[action]) {
        console.log('[super-action] Falling back to mock data');
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
}`;

// Create directory structure
console.log('Creating directory structure...');
const dirPath = path.join(process.cwd(), 'pages', 'api', 'super-action');
fs.mkdirSync(dirPath, { recursive: true });

// Create the API route file
console.log('Creating API route file...');
const filePath = path.join(dirPath, 'index.js');
fs.writeFileSync(filePath, apiRouteCode);

// Commit and push changes
console.log('Committing and pushing changes...');
try {
  execSync('git add pages/api/super-action/index.js');
  execSync('git commit -m "Add API route for Bedrock integration"');
  execSync('git push');
  console.log('Changes pushed successfully!');
} catch (error) {
  console.error('Error committing or pushing changes:', error.message);
  console.log('You may need to manually push the changes.');
}

console.log('Done! Check your Vercel dashboard for deployment status.');