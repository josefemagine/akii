// API endpoint for the base /api/bedrock path
// This serves as a health check and documentation endpoint
import { setCorsHeaders, handleOptionsRequest } from './config';

/**
 * Vercel serverless function for the /api/bedrock endpoint
 */
export default function handler(req, res) {
  try {
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
    console.log('[/bedrock] Sending API information');
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
          },
          body: {
            name: 'Required. Name for the instance',
            modelId: 'Required. Model ID (e.g., amazon.titan-text-express-v1)',
            throughputName: 'Required. Throughput configuration name'
          }
        },
        {
          path: '/api/bedrock/delete-instance',
          method: 'POST',
          description: 'Delete a Bedrock instance',
          headers: {
            'x-api-key': 'Required. Valid API key for authentication'
          },
          body: {
            instanceId: 'Required. ID of the instance to delete',
            throughputName: 'Required. Throughput configuration name'
          }
        }
      ]
    });
  } catch (error) {
    // Log the error
    console.error('[/bedrock] Error processing request:', error);
    
    // Return a meaningful error response
    return res.status(500).json({ 
      error: { 
        code: "500", 
        message: "Internal server error processing API info request", 
        details: error.message 
      } 
    });
  }
} 