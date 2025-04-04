// API endpoint for deleting an AWS Bedrock model instance
// This endpoint handles POST requests to /api/bedrock/delete-instance
import { deleteBedrockInstance } from '../../../api/bedrock/db-utils.js';
import { isValidApiKey, logApiRequest } from './config.js';

/**
 * @typedef {Object} DeleteRequest
 * @property {string} instanceId - Instance ID to delete
 * @property {string} throughputName - The throughput configuration name
 */

/**
 * Vercel serverless function for the /api/bedrock/delete-instance endpoint
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
    
    // Log the API request
    logApiRequest('/delete-instance', 'POST', { body: req.body });
    
    if (!isValidApiKey(apiKey)) {
      console.warn('[NEXT] Invalid or missing API key');
      return res.status(401).json({ 
        error: 'Invalid or missing API key',
        message: 'Please provide a valid API key in the x-api-key header or configure one in the admin settings'
      });
    }
    
    // Validate request body
    const { instanceId } = req.body;
    
    if (!instanceId) {
      console.warn('[NEXT] Missing required field: instanceId');
      return res.status(400).json({ error: 'Missing required field: instanceId' });
    }
    
    // Delete instance
    console.log(`[NEXT] Deleting Bedrock instance: ${instanceId}`);
    const { success, error } = await deleteBedrockInstance(instanceId);
    
    if (error) {
      console.error('[NEXT] Error deleting instance:', error);
      return res.status(500).json({ error: 'Failed to delete instance', details: error.message });
    }
    
    if (!success) {
      console.warn(`[NEXT] Failed to delete instance: ${instanceId}`);
      return res.status(404).json({ error: 'Instance not found or could not be deleted' });
    }
    
    console.log(`[NEXT] Successfully deleted instance: ${instanceId}`);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[NEXT] Unexpected error in delete-instance endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 