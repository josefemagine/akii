/**
 * API Route: /api/super-action
 * 
 * This route acts as a proxy to the Supabase Edge Function.
 * It forwards requests to the super-action Edge Function with proper headers.
 */

// The URL of the Supabase super-action Edge Function
const SUPABASE_FUNCTION_URL = 'https://injxxchotrvgvvzelhvj.supabase.co/functions/v1/super-action';

// CORS headers for preflight OPTIONS requests
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://www.akii.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info',
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

  try {
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

    // Make the request to the Supabase Function
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: req.method,
      headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });

    // Get the response data
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Return the response with the same status code
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error proxying to Supabase Function:', error);
    
    // Return a 500 error
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message 
    });
  }
} 