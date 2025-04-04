// Simplified instances.js for legacy compatibility
// Handles module resolution issues in Vercel deployment

// Import the local config module using relative path
import { isValidApiKey, setCorsHeaders, handleOptionsRequest, logApiRequest } from './config.js';
import { getBedrockInstances } from './db-utils.js';

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

// Mock instances for API responses (fallback if database access fails)
const mockInstances = [
  {
    id: "instance-1",
    name: "Production Titan Express",
    modelId: "amazon.titan-text-express-v1",
    status: "InService",
    createdAt: new Date().toISOString(),
    plan: "pro"
  },
  {
    id: "instance-2",
    name: "Production Claude",
    modelId: "anthropic.claude-instant-v1",
    status: "InService",
    createdAt: new Date().toISOString(),
    plan: "business"
  }
];

// API endpoint for getting Bedrock instances
export default async function handler(req, res) {
  // Handle OPTIONS request for CORS
  if (handleOptionsRequest(req, res)) return;
  
  // Set CORS headers
  setCorsHeaders(res);
  
  // Log the API request
  logApiRequest('/instances', 'GET');
  
  try {
    // Check API key
    const apiKey = req.headers['x-api-key'];
    console.log(`[API] Request headers: ${Object.keys(req.headers).join(', ')}`);
    console.log(`[API] API key provided: ${Boolean(apiKey)}, length: ${apiKey ? apiKey.length : 0}`);
    
    if (!isValidApiKey(apiKey)) {
      console.warn('[API] Invalid or missing API key');
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
    
    // Get instances
    console.log('[API] Fetching Bedrock instances...');
    const { instances, error } = await getBedrockInstances();
    
    if (error) {
      console.error('[API] Error fetching instances:', error);
      return res.status(500).json({ error: 'Failed to fetch instances' });
    }
    
    console.log(`[API] Successfully retrieved ${instances.length} instances`);
    return res.status(200).json({ instances });
  } catch (error) {
    console.error('[API] Unexpected error in instances endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 