// API endpoint for the base /api/bedrock path
// LEGACY VERSION - This is a temporary file to maintain backward compatibility
import { setCorsHeaders, handleOptionsRequest } from './config';

/**
 * Legacy Vercel serverless function for the /api/bedrock endpoint
 */
export default function handler(req, res) {
  try {
    // Log that we're using the legacy API
    console.log('[LEGACY API] Base /api/bedrock request received - using compatibility layer');
    
    // Set CORS headers
    setCorsHeaders(res);
    
    // Handle preflight OPTIONS request
    if (handleOptionsRequest(req, res)) {
      return;
    }
    
    // Only allow GET method
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Return API information
    console.log('[LEGACY API] Returning API information');
    return res.status(200).json({
      api: 'Bedrock API',
      version: '1.0.0',
      status: 'operational',
      documentation: 'This API provides endpoints for managing AWS Bedrock models',
      endpoints: [
        {
          path: '/api/bedrock',
          method: 'GET',
          description: 'This health check endpoint'
        },
        {
          path: '/api/bedrock/instances',
          method: 'GET',
          description: 'List all Bedrock instances',
          headers: {
            'x-api-key': 'Required. Valid API key for authentication'
          }
        },
        {
          path: '/api/bedrock/provision-instance',
          method: 'POST',
          description: 'Provision a new Bedrock instance',
          headers: {
            'x-api-key': 'Required. Valid API key for authentication'
          }
        },
        {
          path: '/api/bedrock/delete-instance',
          method: 'POST',
          description: 'Delete a Bedrock instance',
          headers: {
            'x-api-key': 'Required. Valid API key for authentication'
          }
        }
      ],
      note: "This is using the legacy API implementation - the API is now moved to /pages/api/bedrock"
    });
  } catch (error) {
    // Log the error
    console.error('[LEGACY API] Error handling request:', error);
    
    // Return a meaningful error response
    return res.status(500).json({ 
      error: { 
        code: "500", 
        message: "Internal server error in legacy API", 
        details: error.message,
        note: "This endpoint is using the legacy API - please check your configuration" 
      } 
    });
  }
} 