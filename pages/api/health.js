/**
 * Simple health check API route
 */
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'ok',
    message: 'API is working'
  });
} 