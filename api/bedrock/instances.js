// API endpoint for listing AWS Bedrock model instances
// LEGACY VERSION - This is a temporary file to maintain backward compatibility
import { setCorsHeaders, handleOptionsRequest, isValidApiKey, logApiRequest } from './config';

/**
 * @typedef {Object} Instance
 * @property {string} id - Unique instance identifier
 * @property {string} name - Instance name
 * @property {string} modelId - The model identifier (e.g., amazon.titan-text-express-v1)
 * @property {string} throughputName - The throughput configuration name
 * @property {'Pending'|'InService'|'Failed'} status - Current instance status
 * @property {string} createdAt - ISO timestamp of creation
 * @property {'starter'|'pro'|'business'} plan - The plan type
 */

/**
 * Mock instances for the legacy API endpoint
 */
const mockInstances = [
  {
    id: "instance-1",
    name: "Production Titan Express",
    modelId: "amazon.titan-text-express-v1",
    throughputName: "pro-throughput",
    status: "InService",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    plan: "pro"
  },
  {
    id: "instance-2",
    name: "Production Claude",
    modelId: "anthropic.claude-instant-v1",
    throughputName: "business-throughput",
    status: "InService",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    plan: "business"
  }
];

/**
 * Legacy Vercel serverless function for the /api/bedrock/instances endpoint
 */
export default function handler(req, res) {
  try {
    // Log that we're using the legacy API
    console.log('[LEGACY API] /api/bedrock/instances request received - using compatibility layer');
    
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
    
    // Check for API key
    const apiKey = req.headers['x-api-key'];
    
    // Validate API key using the simplified method
    if (!isValidApiKey(apiKey)) {
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
    
    // Log the successful request
    logApiRequest('/api/bedrock/instances', 'GET', { count: mockInstances.length });
    
    // Return the mock instances
    console.log('[LEGACY API] Returning mock instances');
    return res.status(200).json({ instances: mockInstances });
  } catch (error) {
    // Log the error
    console.error('[LEGACY API] Error handling instances request:', error);
    
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