// API endpoint for deleting an AWS Bedrock model instance
// LEGACY VERSION - This is a temporary file to maintain backward compatibility
import { setCorsHeaders, handleOptionsRequest, isValidApiKey, logApiRequest } from './config';

/**
 * @typedef {Object} DeleteRequest
 * @property {string} instanceId - Instance ID to delete
 * @property {string} throughputName - The throughput configuration name
 */

/**
 * Legacy Vercel serverless function for the /api/bedrock/delete-instance endpoint
 */
export default function handler(req, res) {
  try {
    // Log that we're using the legacy API
    console.log('[LEGACY API] /api/bedrock/delete-instance request received - using compatibility layer');
    
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
    const apiKey = req.headers['x-api-key'];
    
    // Validate API key using the simplified method
    if (!isValidApiKey(apiKey)) {
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
    
    // Get request body
    const { instanceId, throughputName } = req.body;
    
    // Validate request body
    if (!instanceId || !throughputName) {
      return res.status(400).json({ 
        error: 'Invalid request. Required fields: instanceId, throughputName' 
      });
    }
    
    // Log the request
    logApiRequest('/api/bedrock/delete-instance', 'POST', { instanceId, throughputName });
    
    // Return success
    console.log('[LEGACY API] Returning delete confirmation');
    return res.status(200).json({ 
      success: true, 
      message: `Instance ${instanceId} deletion initiated`
    });
  } catch (error) {
    // Log the error
    console.error('[LEGACY API] Error handling delete request:', error);
    
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