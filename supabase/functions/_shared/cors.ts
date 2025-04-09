/**
 * CORS configuration for Supabase Edge Functions
 */

// Define default CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.akii.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, X-Client-Info',
  'Access-Control-Allow-Credentials': 'true',
  'Vary': 'Origin'
};

export function createPreflightResponse() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export function addCorsHeaders(response: Response): Response {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
} 