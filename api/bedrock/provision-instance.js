// Simplified provision-instance.js for legacy compatibility
// Handles module resolution issues in Vercel deployment

// Import the local config module using relative path
import { isValidApiKey, setCorsHeaders, handleOptionsRequest, logApiRequest } from './config.js';
import { createBedrockInstance, modelToPlan } from './db-utils.js';

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
  // Handle OPTIONS request for CORS
  if (handleOptionsRequest(req, res)) return;
  
  // Set CORS headers
  setCorsHeaders(res);
  
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Check API key
    const apiKey = req.headers['x-api-key'];
    console.log(`[API] Request headers: ${Object.keys(req.headers).join(', ')}`);
    console.log(`[API] API key provided: ${Boolean(apiKey)}, length: ${apiKey ? apiKey.length : 0}`);
    
    if (!isValidApiKey(apiKey)) {
      console.warn('[API] Invalid or missing API key');
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
    
    // Log the API request
    logApiRequest('/provision-instance', 'POST', { body: req.body });
    
    // Validate request body
    const { name, modelId, throughputName } = req.body;
    
    if (!name || !modelId || !throughputName) {
      console.warn('[API] Missing required fields:', { name, modelId, throughputName });
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          name: !name ? 'Missing' : 'OK',
          modelId: !modelId ? 'Missing' : 'OK',
          throughputName: !throughputName ? 'Missing' : 'OK'
        }
      });
    }
    
    // Provision instance
    console.log('[API] Creating new Bedrock instance...');
    const { instance, error } = await createBedrockInstance(req.body);
    
    if (error) {
      console.error('[API] Error creating instance:', error);
      return res.status(500).json({ error: 'Failed to create instance', details: error.message });
    }
    
    console.log(`[API] Successfully created instance: ${instance.id}`);
    return res.status(200).json({ instance });
  } catch (error) {
    console.error('[API] Unexpected error in provision-instance endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 