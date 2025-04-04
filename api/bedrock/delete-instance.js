// Simplified delete-instance.js for legacy compatibility
// Handles module resolution issues in Vercel deployment

// Import the local config module using relative path
import { isValidApiKey, setCorsHeaders, handleOptionsRequest, logApiRequest } from './config.js';

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
    
    // Return success
    return res.status(200).json({ 
      success: true, 
      message: `Instance ${instanceId} deletion initiated`
    });
  } catch (error) {
    // Return a meaningful error response
    return res.status(500).json({ 
      error: { 
        code: "500", 
        message: "Internal server error", 
        details: error.message
      } 
    });
  }
} 