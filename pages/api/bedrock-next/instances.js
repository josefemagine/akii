// API endpoint for listing AWS Bedrock model instances
// This endpoint handles GET requests to /api/bedrock/instances
import { getBedrockInstances } from '../../../api/bedrock/db-utils.js';
import { isValidApiKey } from '../../../api/bedrock/config.js';

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
 * @type {Instance[]}
 */
const mockInstances = [
  {
    id: "instance-1",
    name: "Production Titan Express",
    modelId: "amazon.titan-text-express-v1",
    throughputName: "pro-throughput",
    status: "InService",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    plan: "pro"
  },
  {
    id: "instance-2",
    name: "Production Claude",
    modelId: "anthropic.claude-instant-v1",
    throughputName: "business-throughput",
    status: "InService",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    plan: "business"
  }
];

/**
 * Vercel serverless function for the /api/bedrock/instances endpoint
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
  
  // Only allow GET requests
  if (req.method !== 'GET') {
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
    
    // Fetch instances
    console.log('[NEXT] Fetching Bedrock instances...');
    const { instances, error } = await getBedrockInstances();
    
    if (error) {
      console.error('[NEXT] Error fetching instances:', error);
      return res.status(500).json({ error: 'Failed to fetch instances' });
    }
    
    console.log(`[NEXT] Successfully retrieved ${instances.length} instances`);
    return res.status(200).json({ instances });
  } catch (error) {
    console.error('[NEXT] Unexpected error in instances endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 