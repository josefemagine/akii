// API endpoint for deleting an AWS Bedrock model instance
// This endpoint handles POST requests to /api/bedrock/delete-instance
import { setCorsHeaders, handleOptionsRequest, isValidApiKey, logApiRequest } from './config';

/**
 * @typedef {Object} DeleteRequest
 * @property {string} instanceId - Instance ID to delete
 * @property {string} throughputName - The throughput configuration name
 */

/**
 * Vercel serverless function for the /api/bedrock/delete-instance endpoint
 */
export default function handler(req, res) {
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
  if (!isValidApiKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  
  // Get request body
  const { instanceId, throughputName } = req.body;
  
  // Validate request body
  if (!instanceId || !throughputName) {
    return res.status(400).json({ 
      error: 'Invalid request. Required fields: instanceId, throughputName' 
    });
  }
  
  // Delete the instance
  // In a real implementation, this would call AWS Bedrock API
  
  // Log the request
  logApiRequest('/api/bedrock/delete-instance', 'POST', { instanceId, throughputName });
  
  // Return success
  return res.status(200).json({ 
    success: true, 
    message: `Instance ${instanceId} deletion initiated`
  });
} 