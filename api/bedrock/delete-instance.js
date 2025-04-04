// API endpoint for deleting an AWS Bedrock model instance
// This endpoint handles POST requests to /api/bedrock/delete-instance
import { setCorsHeaders, handleOptionsRequest, isValidApiKey, logApiRequest } from './config';

/**
 * @typedef {Object} DeleteRequest
 * @property {string} instanceId - Instance ID to delete
 * @property {string} throughputName - The throughput configuration name
 */

/**
 * Vercel serverless function for the /api/bedrock/delete-instance endpoint
 */
export default function handler(req, res) {
  try {
    // Set CORS headers
    setCorsHeaders(res);
    
    // Handle preflight OPTIONS request
    if (handleOptionsRequest(req, res)) {
      return;
    }
    
    // Only allow POST method
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Check for API key
    console.log('[/delete-instance] Checking API key in request headers');
    const apiKey = req.headers['x-api-key'];
    
    // Log headers for debugging (mask sensitive values)
    const safeHeaders = {...req.headers};
    if (safeHeaders['x-api-key']) safeHeaders['x-api-key'] = '***MASKED***';
    console.log('[/delete-instance] Request headers:', safeHeaders);
    
    // Validate API key
    console.log('[/delete-instance] Starting API key validation');
    const keyValid = isValidApiKey(apiKey);
    console.log(`[/delete-instance] API key validation result: ${keyValid}`);
    
    if (!keyValid) {
      console.log('[/delete-instance] Sending 401 unauthorized response');
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
    
    // Get request body
    const { instanceId, throughputName } = req.body;
    console.log('[/delete-instance] Request body:', { instanceId, throughputName });
    
    // Validate request body
    if (!instanceId || !throughputName) {
      console.log('[/delete-instance] Invalid request - missing required fields');
      return res.status(400).json({ 
        error: 'Invalid request. Required fields: instanceId, throughputName' 
      });
    }
    
    // Delete the instance
    // In a real implementation, this would call AWS Bedrock API
    
    // Log the request
    logApiRequest('/api/bedrock/delete-instance', 'POST', { instanceId, throughputName });
    
    // Return success
    console.log('[/delete-instance] Sending successful delete response');
    return res.status(200).json({ 
      success: true, 
      message: `Instance ${instanceId} deletion initiated`
    });
  } catch (error) {
    // Log the error
    console.error('[/delete-instance] Error processing request:', error);
    
    // Return a meaningful error response
    return res.status(500).json({ 
      error: { 
        code: "500", 
        message: "Internal server error processing delete request", 
        details: error.message 
      } 
    });
  }
} 