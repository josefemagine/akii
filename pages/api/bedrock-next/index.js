/**
 * AWS Bedrock API - Documentation and health check endpoint
 * This endpoint provides a health check and documentation for the Bedrock API
 */

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only respond to GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Respond with documentation
  return res.status(200).json({
    service: 'AWS Bedrock API',
    version: '1.0.0',
    migration: 'Next.js API Routes - Recommended Format',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: [
      {
        path: '/api/bedrock-next',
        method: 'GET',
        description: 'Documentation and health check endpoint',
        requiresAuth: false
      },
      {
        path: '/api/bedrock-next/instances',
        method: 'GET',
        description: 'List all Bedrock instances',
        requiresAuth: true
      },
      {
        path: '/api/bedrock-next/provision-instance',
        method: 'POST',
        description: 'Provision a new Bedrock instance',
        requiresAuth: true
      },
      {
        path: '/api/bedrock-next/delete-instance',
        method: 'POST',
        description: 'Delete a Bedrock instance',
        requiresAuth: true
      },
      {
        path: '/api/bedrock-next/test-env',
        method: 'GET',
        description: 'Test environment variables',
        requiresAuth: true
      }
    ],
    note: 'All authenticated endpoints require an API key to be passed in the x-api-key header'
  });
} 