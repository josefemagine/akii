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

// Legacy Vercel serverless function
export default async function handler(req, res) {
  try {
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
    
    // Log the request
    logApiRequest('instances', 'GET');
    
    // Get instances from Supabase
    const { instances, error } = await getBedrockInstances();
    
    if (error) {
      console.error('Error fetching instances from Supabase:', error);
      console.log('Falling back to mock instances');
      return res.status(200).json({ instances: mockInstances });
    }
    
    // If no instances found, use mock instances as fallback
    if (!instances || instances.length === 0) {
      console.log('No instances found in Supabase, using mock instances');
      return res.status(200).json({ instances: mockInstances });
    }
    
    // Return the instances from the database
    return res.status(200).json({ instances });
  } catch (error) {
    console.error('Error in instances API:', error);
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