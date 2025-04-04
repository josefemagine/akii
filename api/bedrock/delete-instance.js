// Simplified delete-instance.js for legacy compatibility
// Handles module resolution issues in Vercel deployment

// Import the local config module using relative path
import { isValidApiKey, setCorsHeaders, handleOptionsRequest, logApiRequest } from './config.js';
import { deleteBedrockInstance } from './db-utils.js';

/**
 * @typedef {Object} DeleteRequest
 * @property {string} instanceId - Instance ID to delete
 * @property {string} throughputName - The throughput configuration name
 */

/**
 * Legacy Vercel serverless function for the /api/bedrock/delete-instance endpoint
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
    logApiRequest('/delete-instance', 'POST', { body: req.body });
    
    // Validate request body
    const { instanceId } = req.body;
    
    if (!instanceId) {
      console.warn('[API] Missing required field: instanceId');
      return res.status(400).json({ error: 'Missing required field: instanceId' });
    }
    
    // Delete instance
    console.log(`[API] Deleting Bedrock instance: ${instanceId}`);
    const { success, error } = await deleteBedrockInstance(instanceId);
    
    if (error) {
      console.error('[API] Error deleting instance:', error);
      return res.status(500).json({ error: 'Failed to delete instance', details: error.message });
    }
    
    if (!success) {
      console.warn(`[API] Failed to delete instance: ${instanceId}`);
      return res.status(404).json({ error: 'Instance not found or could not be deleted' });
    }
    
    console.log(`[API] Successfully deleted instance: ${instanceId}`);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[API] Unexpected error in delete-instance endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 