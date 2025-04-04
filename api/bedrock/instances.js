// API endpoint for listing AWS Bedrock model instances
// This endpoint handles GET requests to /api/bedrock/instances
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
export default function handler(req, res) {
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
  if (!isValidApiKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  
  // For now, we'll just return mock data
  // In a real implementation, this would call AWS Bedrock API
  const instances = mockInstances;
  
  // Log the request
  logApiRequest('/api/bedrock/instances', 'GET', { count: instances.length });
  
  // Return the instances
  return res.status(200).json({ instances });
} 