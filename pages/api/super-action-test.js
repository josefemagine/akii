/**
 * Test API Route for super-action
 */
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  // Handle GET requests
  return res.status(200).json({
    message: 'Test API route is working',
    info: 'This is a simplified test endpoint for the super-action API',
    method: req.method
  });
} 