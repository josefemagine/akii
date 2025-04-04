// API endpoint for provisioning a new AWS Bedrock model instance
// This endpoint handles POST requests to /api/bedrock/provision-instance
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
 * Vercel serverless function for the /api/bedrock/provision-instance endpoint
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
    console.log('[/provision-instance] Checking API key in request headers');
    const apiKey = req.headers['x-api-key'];
    
    // Log headers for debugging (mask sensitive values)
    const safeHeaders = {...req.headers};
    if (safeHeaders['x-api-key']) safeHeaders['x-api-key'] = '***MASKED***';
    console.log('[/provision-instance] Request headers:', safeHeaders);
    
    // Validate API key
    console.log('[/provision-instance] Starting API key validation');
    const keyValid = isValidApiKey(apiKey);
    console.log(`[/provision-instance] API key validation result: ${keyValid}`);
    
    if (!keyValid) {
      console.log('[/provision-instance] Sending 401 unauthorized response');
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
    
    // Get request body
    const { name, modelId, throughputName } = req.body;
    console.log('[/provision-instance] Request body:', { name, modelId, throughputName });
    
    // Validate request body
    if (!name || !modelId || !throughputName) {
      console.log('[/provision-instance] Invalid request - missing required fields');
      return res.status(400).json({ 
        error: 'Invalid request. Required fields: name, modelId, throughputName' 
      });
    }
    
    // Create a new instance
    // In a real implementation, this would call AWS Bedrock API
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
    console.log('[/provision-instance] Sending successful provision response');
    return res.status(201).json({ 
      success: true, 
      message: 'Instance provisioning started',
      instance: newInstance 
    });
  } catch (error) {
    // Log the error
    console.error('[/provision-instance] Error processing request:', error);
    
    // Return a meaningful error response
    return res.status(500).json({ 
      error: { 
        code: "500", 
        message: "Internal server error processing provision request", 
        details: error.message 
      } 
    });
  }
} 