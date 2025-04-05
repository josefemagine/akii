/**
 * Simple Express API server to handle /api/super-action requests
 * 
 * Run with: node simple-express-api.js
 */

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// The URL of the Supabase Edge Function
const SUPABASE_FUNCTION_URL = 'https://injxxchotrvgvvzelhvj.supabase.co/functions/v1/super-action';

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-info', 'apikey', 'X-Client-Info']
}));

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'API is working'
  });
});

// Simple test endpoint
app.get('/api/super-action-test', (req, res) => {
  res.status(200).json({
    message: 'Test API route is working',
    info: 'This is a simplified test endpoint for the super-action API',
    method: req.method
  });
});

// Main super-action endpoint
app.all('/api/super-action', async (req, res) => {
  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // For GET requests, return a simple success message
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'API route is working',
      info: 'This endpoint accepts POST requests for Bedrock API operations'
    });
  }

  // Handle POST requests
  if (req.method === 'POST') {
    try {
      // Get action and data from request body
      const { action, data } = req.body || {};
      
      console.log(`[API] Processing action: ${action}`);
      
      // Validate required parameters
      if (!action) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Missing required action parameter'
        });
      }

      // Get authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Missing Authorization header'
        });
      }

      // Headers to forward to Supabase Function
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      };

      // Forward x-client-info header if present
      if (req.headers['x-client-info']) {
        headers['x-client-info'] = req.headers['x-client-info'];
      }

      // Forward apikey header if present
      if (req.headers['apikey']) {
        headers['apikey'] = req.headers['apikey'];
      }

      console.log('[API] Forwarding request to Supabase Edge Function');
      
      // Forward the request to Supabase Edge Function
      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, data })
      });

      // Get response data based on content type
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      console.log(`[API] Received response with status: ${response.status}`);
      
      // Forward the response status and data
      return res.status(response.status).json(responseData);
    } catch (error) {
      console.error('[API] Error processing request:', error);
      
      return res.status(500).json({ 
        error: 'Internal Server Error', 
        message: error.message || 'An unexpected error occurred'
      });
    }
  }

  // For all other HTTP methods, return Method Not Allowed
  return res.status(405).json({ 
    error: 'Method Not Allowed',
    message: 'This endpoint only accepts GET and POST requests'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/super-action-test`);
  console.log(`Main endpoint: http://localhost:${PORT}/api/super-action`);
}); 