// Simple Express server with minimal dependencies
import express from 'express';

// Create Express app
const app = express();
const PORT = 3000;

// Add JSON body parser middleware
app.use(express.json());

// Simple route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Base endpoint
app.get('/api/bedrock', (req, res) => {
  res.json({
    api: 'Bedrock API',
    version: '1.0.0',
    status: 'operational'
  });
});

// Instances endpoint
app.get('/api/bedrock/instances', (req, res) => {
  const mockInstances = [
    {
      id: "instance-1",
      name: "Production Titan Express",
      status: "InService",
    },
    {
      id: "instance-2",
      name: "Production Claude",
      status: "InService",
    }
  ];
  
  res.json({ instances: mockInstances });
});

// Provision instance endpoint
app.post('/api/bedrock/provision-instance', (req, res) => {
  const { name, modelId, throughputName } = req.body || {};
  
  if (!name || !modelId || !throughputName) {
    return res.status(400).json({ 
      error: 'Missing required fields', 
      required: ['name', 'modelId', 'throughputName'],
      received: req.body
    });
  }
  
  // Create a mock instance
  const newInstance = {
    id: `instance-${Date.now()}`,
    name,
    modelId,
    throughputName,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  
  // Return success
  res.json({ 
    success: true, 
    message: 'Instance provisioning started',
    instance: newInstance
  });
});

// Delete instance endpoint
app.post('/api/bedrock/delete-instance', (req, res) => {
  const { instanceId, throughputName } = req.body || {};
  
  if (!instanceId || !throughputName) {
    return res.status(400).json({ 
      error: 'Missing required fields', 
      required: ['instanceId', 'throughputName'],
      received: req.body
    });
  }
  
  // Return success
  res.json({ 
    success: true, 
    message: 'Instance deletion initiated',
    instanceId
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 