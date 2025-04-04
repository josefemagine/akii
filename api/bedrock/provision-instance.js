// API endpoint for provisioning a new AWS Bedrock model instance
// LEGACY VERSION - This is a temporary file to maintain backward compatibility
import { setCorsHeaders, handleOptionsRequest, isValidApiKey, logApiRequest } from './config';

/**
 * @typedef {Object} ProvisionRequest
 * @property {string} name - Instance name
 * @property {string} modelId - The model identifier (e.g., amazon.titan-text-express-v1)
 * @property {string} throughputName - The throughput configuration name
 */

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
 * Map model IDs to plan types
 */
const modelToPlan = {
  'amazon.titan-text-lite-v1': 'starter',
  'amazon.titan-text-express-v1': 'pro',
  'anthropic.claude-instant-v1': 'business'
};

/**
 * Legacy Vercel serverless function for the /api/bedrock/provision-instance endpoint
 */
export default function handler(req, res) {
  try {
    // Log that we're using the legacy API
    console.log('[LEGACY API] /api/bedrock/provision-instance request received - using compatibility layer');
    
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
    const { name, modelId, throughputName } = req.body;
    
    // Validate request body
    if (!name || !modelId || !throughputName) {
      return res.status(400).json({ 
        error: 'Invalid request. Required fields: name, modelId, throughputName' 
      });
    }
    
    // Create a new instance
    const newInstance = {
      id: `instance-${Date.now()}`,
      name,
      modelId,
      throughputName,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      plan: modelToPlan[modelId] || 'starter'
    };
    
    // Log the request
    logApiRequest('/api/bedrock/provision-instance', 'POST', { 
      name, 
      modelId, 
      instanceId: newInstance.id 
    });
    
    // Return the created instance
    console.log('[LEGACY API] Returning new instance data');
    return res.status(201).json({ 
      success: true, 
      message: 'Instance provisioning started',
      instance: newInstance 
    });
  } catch (error) {
    // Log the error
    console.error('[LEGACY API] Error handling provision request:', error);
    
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