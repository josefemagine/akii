// Simple Express server to handle API endpoints locally
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Add error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  console.error('Server will continue running');
});

// Add logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.url}`);
  
  // Track response
  const originalJson = res.json;
  res.json = function(body) {
    console.log(`${timestamp} - Response:`, JSON.stringify(body, null, 2));
    return originalJson.call(this, body);
  };
  
  next();
});

// Define API key for testing
const validApiKeys = ['test-key-1234'];

// CORS and utility functions
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
};

const isValidApiKey = (apiKey) => {
  if (!apiKey) return false;
  return validApiKeys.includes(apiKey);
};

const logApiRequest = (endpoint, method, data = {}) => {
  console.log(`[${new Date().toISOString()}] ${method} ${endpoint}`, data);
};

// Mock data for development - ensure it has all the fields the client expects
const mockInstances = [
  {
    id: "instance-1",
    name: "Production Titan Express",
    modelId: "amazon.titan-text-express-v1",
    throughputName: "pro-throughput",
    status: "InService",
    createdAt: new Date().toISOString(),
    plan: "pro"
  },
  {
    id: "instance-2",
    name: "Production Claude",
    modelId: "anthropic.claude-instant-v1",
    throughputName: "business-throughput",
    status: "InService",
    createdAt: new Date().toISOString(),
    plan: "business"
  }
];

// Handle OPTIONS requests
app.options('*', (req, res) => {
  setCorsHeaders(res);
  res.status(200).end();
});

// Base endpoint
app.get('/api/bedrock', (req, res) => {
  try {
    // Set CORS headers
    setCorsHeaders(res);
    
    // Log the request
    logApiRequest('/api/bedrock', 'GET');
    
    // Return API information
    return res.status(200).json({
      api: 'Bedrock API',
      version: '1.0.0',
      status: 'operational',
      documentation: 'This API provides endpoints for managing AWS Bedrock models',
      endpoints: [
        {
          path: '/api/bedrock',
          method: 'GET',
          description: 'This health check endpoint'
        },
        {
          path: '/api/bedrock/instances',
          method: 'GET',
          description: 'List all Bedrock instances',
          headers: {
            'x-api-key': 'Required. Valid API key for authentication'
          }
        },
        {
          path: '/api/bedrock/provision-instance',
          method: 'POST',
          description: 'Provision a new Bedrock instance',
          headers: {
            'x-api-key': 'Required. Valid API key for authentication'
          },
          body: {
            name: 'Required. Name for the instance',
            modelId: 'Required. Model ID (e.g., amazon.titan-text-express-v1)',
            throughputName: 'Required. Throughput configuration name'
          }
        },
        {
          path: '/api/bedrock/delete-instance',
          method: 'POST',
          description: 'Delete a Bedrock instance',
          headers: {
            'x-api-key': 'Required. Valid API key for authentication'
          },
          body: {
            instanceId: 'Required. ID of the instance to delete',
            throughputName: 'Required. Throughput configuration name'
          }
        }
      ],
      testing: {
        message: 'For testing, use one of these API keys:',
        apiKey: validApiKeys[0] || 'No test key available'
      }
    });
  } catch (error) {
    console.error('Error handling /api/bedrock request:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get instances endpoint
app.get('/api/bedrock/instances', (req, res) => {
  try {
    // Set CORS headers
    setCorsHeaders(res);
    
    // In development mode, we don't require an API key
    if (process.env.NODE_ENV !== 'production') {
      // Log the request
      logApiRequest('/api/bedrock/instances', 'GET', { count: mockInstances.length });
      
      // Return the instances
      return res.status(200).json({ instances: mockInstances });
    }
    
    // Check for API key in production
    const apiKey = req.headers['x-api-key'];
    if (!isValidApiKey(apiKey)) {
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
    
    // Log the request
    logApiRequest('/api/bedrock/instances', 'GET', { count: mockInstances.length });
    
    // Return the instances
    return res.status(200).json({ instances: mockInstances });
  } catch (error) {
    console.error('Error handling /api/bedrock/instances request:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Provision instance endpoint
app.post('/api/bedrock/provision-instance', (req, res) => {
  try {
    // Set CORS headers
    setCorsHeaders(res);
    
    // In development mode, we don't require an API key
    if (process.env.NODE_ENV !== 'production') {
      // Validate request body
      const { name, modelId, throughputName } = req.body || {};
      
      if (!name || !modelId || !throughputName) {
        return res.status(400).json({ 
          error: 'Missing required fields', 
          required: ['name', 'modelId', 'throughputName'],
          received: req.body
        });
      }
      
      // Log the request
      logApiRequest('/api/bedrock/provision-instance', 'POST', { name, modelId, throughputName });
      
      // Create a mock instance
      const newInstance = {
        id: `instance-${Date.now()}`,
        name,
        modelId,
        throughputName,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        plan: throughputName.includes('pro') ? 'pro' : 'business'
      };
      
      // Return the new instance
      return res.status(200).json({ 
        success: true, 
        message: 'Instance provisioning started',
        instance: newInstance
      });
    }
    
    // Check for API key in production
    const apiKey = req.headers['x-api-key'];
    if (!isValidApiKey(apiKey)) {
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
    
    // Validate request body
    const { name, modelId, throughputName } = req.body || {};
    
    if (!name || !modelId || !throughputName) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['name', 'modelId', 'throughputName'],
        received: req.body
      });
    }
    
    // Log the request
    logApiRequest('/api/bedrock/provision-instance', 'POST', { name, modelId, throughputName });
    
    // Create a mock instance
    const newInstance = {
      id: `instance-${Date.now()}`,
      name,
      modelId,
      throughputName,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      plan: throughputName.includes('pro') ? 'pro' : 'business'
    };
    
    // Return the new instance
    return res.status(200).json({ 
      success: true, 
      message: 'Instance provisioning started',
      instance: newInstance
    });
  } catch (error) {
    console.error('Error handling /api/bedrock/provision-instance request:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Delete instance endpoint
app.post('/api/bedrock/delete-instance', (req, res) => {
  try {
    // Set CORS headers
    setCorsHeaders(res);
    
    // In development mode, we don't require an API key
    if (process.env.NODE_ENV !== 'production') {
      // Validate request body
      const { instanceId, throughputName } = req.body || {};
      
      if (!instanceId || !throughputName) {
        return res.status(400).json({ 
          error: 'Missing required fields', 
          required: ['instanceId', 'throughputName'],
          received: req.body
        });
      }
      
      // Log the request
      logApiRequest('/api/bedrock/delete-instance', 'POST', { instanceId, throughputName });
      
      // Return success
      return res.status(200).json({ 
        success: true, 
        message: 'Instance deletion initiated',
        instanceId
      });
    }
    
    // Check for API key in production
    const apiKey = req.headers['x-api-key'];
    if (!isValidApiKey(apiKey)) {
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
    
    // Validate request body
    const { instanceId, throughputName } = req.body || {};
    
    if (!instanceId || !throughputName) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['instanceId', 'throughputName'],
        received: req.body
      });
    }
    
    // Log the request
    logApiRequest('/api/bedrock/delete-instance', 'POST', { instanceId, throughputName });
    
    // Return success
    return res.status(200).json({ 
      success: true, 
      message: 'Instance deletion initiated',
      instanceId
    });
  } catch (error) {
    console.error('Error handling /api/bedrock/delete-instance request:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Serve static files from the build directory
app.use(express.static(join(__dirname, 'dist')));

// For any other route, serve the index.html file
app.get('*', (req, res) => {
  try {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Error serving index.html: ' + error.message);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({
    error: 'Server error',
    message: err.message || 'Unknown error'
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/bedrock`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 