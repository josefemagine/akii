// Simplified index.js for legacy compatibility
// Handles module resolution issues in Vercel deployment

// Import the local config module using relative path
import { setCorsHeaders, handleOptionsRequest } from './config.js';

// Legacy Vercel serverless function
export default function handler(req, res) {
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
    
    // Return API information
    return res.status(200).json({
      api: 'Bedrock API',
      version: '1.0.0',
      status: 'operational',
      message: 'This is a legacy endpoint. Please use /api/bedrock-next instead.'
    });
  } catch (error) {
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