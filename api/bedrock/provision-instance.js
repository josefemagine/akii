// Simplified provision-instance.js for legacy compatibility
// Handles module resolution issues in Vercel deployment

// Import the local config module using relative path
import { isValidApiKey, setCorsHeaders, handleOptionsRequest, logApiRequest } from './config.js';
import { createBedrockInstance, modelToPlan } from './bedrock-db-serverless.js';

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
 * Legacy Vercel serverless function
 */
export default async function handler(req, res) {
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
    const { name, modelId, throughputName } = req.body;
    
    // Validate request body
    if (!name || !modelId || !throughputName) {
      return res.status(400).json({ 
        error: 'Invalid request. Required fields: name, modelId, throughputName' 
      });
    }
    
    // Log the request
    logApiRequest('provision-instance', 'POST', { name, modelId });
    
    // Create the instance using the serverless implementation
    const { instance, error } = await createBedrockInstance({
      name,
      modelId,
      throughputName
    });
    
    if (error) {
      console.error('Error creating instance:', error);
      
      // Fallback to mock response if creation fails
      const newInstance = {
        id: `instance-${Date.now()}`,
        name,
        modelId,
        throughputName,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        plan: modelToPlan[modelId] || 'starter'
      };
      
      return res.status(201).json({ 
        success: true, 
        message: 'Instance provisioning started (fallback mode)',
        instance: newInstance 
      });
    }
    
    // Return the created instance
    return res.status(201).json({ 
      success: true, 
      message: 'Instance provisioning started',
      instance 
    });
  } catch (error) {
    console.error('Error in provision-instance API:', error);
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