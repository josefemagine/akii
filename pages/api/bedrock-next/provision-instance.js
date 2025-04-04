// API endpoint for provisioning a new AWS Bedrock model instance
// This endpoint handles POST requests to /api/bedrock/provision-instance
import { createBedrockInstance } from '../../../api/bedrock/db-utils.js';
import { isValidApiKey } from '../../../api/bedrock/config.js';

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
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Check API key
    const apiKey = req.headers['x-api-key'];
    console.log(`[NEXT] Request headers: ${Object.keys(req.headers).join(', ')}`);
    console.log(`[NEXT] API key provided: ${Boolean(apiKey)}, length: ${apiKey ? apiKey.length : 0}`);
    
    if (!isValidApiKey(apiKey)) {
      console.warn('[NEXT] Invalid or missing API key');
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
    
    // Log the API request
    console.log(`[NEXT] POST /provision-instance`, { body: req.body });
    
    // Validate request body
    const { name, modelId, throughputName } = req.body;
    
    if (!name || !modelId || !throughputName) {
      console.warn('[NEXT] Missing required fields:', { name, modelId, throughputName });
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
    console.log('[NEXT] Creating new Bedrock instance...');
    const { instance, error } = await createBedrockInstance(req.body);
    
    if (error) {
      console.error('[NEXT] Error creating instance:', error);
      return res.status(500).json({ error: 'Failed to create instance', details: error.message });
    }
    
    console.log(`[NEXT] Successfully created instance: ${instance.id}`);
    return res.status(200).json({ instance });
  } catch (error) {
    console.error('[NEXT] Unexpected error in provision-instance endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 