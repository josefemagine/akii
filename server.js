import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'x-api-key']
}));
app.use(express.json());

// Set JSON Content-Type for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Track response
  const originalJson = res.json;
  res.json = function(body) {
    console.log('Response JSON:', JSON.stringify(body, null, 2));
    return originalJson.call(this, body);
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

// Route handler to generate JSON response
function jsonResponse(res, data) {
  res.setHeader('Content-Type', 'application/json');
  return res.json(data);
}

// Base endpoint
app.get('/api/bedrock', (req, res) => {
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
  try {
    jsonResponse(res, { instances: mockInstances });
  } catch (err) {
    console.error('Error handling /api/bedrock/instances:', err);
    jsonResponse(res.status(500), { error: 'Server error', message: err.message });
  }
});

// Provision instance endpoint
app.post('/api/bedrock/provision-instance', (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { name, modelId, throughputName } = req.body;
    
    if (!name || !modelId || !throughputName) {
      return jsonResponse(res.status(400), { 
        error: 'Bad request', 
        message: 'Missing required fields: name, modelId, or throughputName'
      });
    }
    
    const newInstance = {
      id: `instance-${Date.now()}`,
      name,
      modelId,
      throughputName,
      status: "Pending",
      createdAt: new Date().toISOString(),
      plan: throughputName?.includes('starter') ? 'starter' : 
            throughputName?.includes('pro') ? 'pro' : 'business'
    };
    
    mockInstances.push(newInstance);
    jsonResponse(res, { 
      success: true, 
      message: 'Instance provisioning started',
      instance: newInstance 
    });
  } catch (err) {
    console.error('Error handling /api/bedrock/provision-instance:', err);
    jsonResponse(res.status(500), { error: 'Server error', message: err.message });
  }
});

// Delete instance endpoint
app.post('/api/bedrock/delete-instance', (req, res) => {
  try {
    console.log('Request body:', req.body);
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

// Start server
const server = app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  - GET  /api/bedrock');
  console.log('  - GET  /api/bedrock/instances');
  console.log('  - POST /api/bedrock/provision-instance');
  console.log('  - POST /api/bedrock/delete-instance');
}); 