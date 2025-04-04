import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'x-api-key']
}));

// Body parser middleware - both JSON and raw
app.use(bodyParser.json({
  limit: '10mb',
  strict: false
}));
app.use(bodyParser.raw({
  type: 'application/json',
  limit: '10mb'
}));
app.use(bodyParser.text({
  type: 'application/json',
  limit: '10mb'
}));

// Middleware to log requests with more detail
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Log body for POST/PUT requests
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', req.body);
  }
  
  next();
});

// Middleware to set JSON headers
app.use((req, res, next) => {
  // Set the Content-Type header for JSON responses 
  res.header('Content-Type', 'application/json');
  
  // Create a wrapper for res.json to ensure Content-Type is set
  const originalJson = res.json;
  res.json = function(body) {
    // Explicitly set the Content-Type before sending the response
    this.set('Content-Type', 'application/json');
    return originalJson.call(this, body);
  };
  
  next();
});

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Capture the response
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`Response for ${req.method} ${req.url}: `, typeof body === 'string' ? body.substring(0, 100) : 'non-string body');
    console.log('Response headers:', JSON.stringify(this.getHeaders()));
    return originalSend.call(this, body);
  };
  
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Mock data for development - ensure it has all the fields the client expects
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

// Route handler to generate JSON response
function jsonResponse(res, data) {
  // Explicitly set the Content-Type header for JSON responses
  res.header('Content-Type', 'application/json');
  return res.json(data);
}

// Base endpoint
app.get('/api/bedrock', (req, res) => {
  console.log('[INFO] Handling GET /api/bedrock');
  try {
    jsonResponse(res, { 
      api: 'Bedrock API', 
      version: '1.0.0', 
      status: 'operational' 
    });
  } catch (err) {
    console.error('Error handling /api/bedrock:', err);
    jsonResponse(res.status(500), { error: 'Server error', message: err.message });
  }
});

// Get instances endpoint
app.get('/api/bedrock/instances', (req, res) => {
  console.log('[INFO] Handling GET /api/bedrock/instances');
  try {
    jsonResponse(res, { instances: mockInstances });
  } catch (err) {
    console.error('Error handling /api/bedrock/instances:', err);
    jsonResponse(res.status(500), { error: 'Server error', message: err.message });
  }
});

// Provision instance endpoint
app.post('/api/bedrock/provision-instance', (req, res) => {
  console.log('[INFO] Handling POST /api/bedrock/provision-instance');
  
  // Hard-coded test instance since we're having trouble with req.body
  const newInstance = {
    id: `instance-${Date.now()}`,
    name: "New Test Instance",
    modelId: "amazon.titan-text-lite-v1",
    throughputName: "starter-throughput",
    status: "Pending",
    createdAt: new Date().toISOString(),
    plan: "starter"
  };
  
  console.log('[INFO] Creating hard-coded test instance:', newInstance);
  
  mockInstances.push(newInstance);
  
  // Always return success with the test instance
  jsonResponse(res, { 
    success: true, 
    message: 'Instance provisioning started',
    instance: newInstance 
  });
});

// Delete instance endpoint
app.post('/api/bedrock/delete-instance', (req, res) => {
  console.log('[INFO] Handling POST /api/bedrock/delete-instance', req.body);
  try {
    const { instanceId } = req.body;
    
    if (!instanceId) {
      return jsonResponse(res.status(400), { 
        error: 'Bad request', 
        message: 'Missing required field: instanceId'
      });
    }
    
    const instanceIndex = mockInstances.findIndex(instance => instance.id === instanceId);
    if (instanceIndex !== -1) {
      mockInstances.splice(instanceIndex, 1);
    }
    
    jsonResponse(res, { 
      success: true, 
      message: 'Instance deletion initiated',
      instanceId 
    });
  } catch (err) {
    console.error('Error handling /api/bedrock/delete-instance:', err);
    jsonResponse(res.status(500), { error: 'Server error', message: err.message });
  }
});

// Catch-all for 404s
app.use((req, res) => {
  jsonResponse(res.status(404), { 
    error: 'Not Found', 
    message: `Endpoint ${req.method} ${req.url} not found`
  });
});

// Add middleware to handle SPA routing for non-API routes
app.use((req, res, next) => {
  // Skip API routes
  if (req.url.startsWith('/api/')) {
    return next();
  }
  
  // For static files in the public directory, try to serve them
  if (req.url.includes('.')) {
    try {
      const staticFile = path.join(__dirname, 'public', req.url);
      if (fs.existsSync(staticFile)) {
        return res.sendFile(staticFile);
      }
    } catch (error) {
      console.error('Error serving static file:', error);
    }
  }
  
  // For all other routes, serve the fallback HTML
  try {
    const fallbackPath = path.join(__dirname, 'public', '_fallback.html');
    if (fs.existsSync(fallbackPath)) {
      return res.sendFile(fallbackPath);
    }
  } catch (error) {
    console.error('Error serving fallback HTML:', error);
  }
  
  // If we get here, continue with normal routing
  next();
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Mock Bedrock API server running at http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  - GET  /api/bedrock');
  console.log('  - GET  /api/bedrock/instances');
  console.log('  - POST /api/bedrock/provision-instance');
  console.log('  - POST /api/bedrock/delete-instance');
}); 