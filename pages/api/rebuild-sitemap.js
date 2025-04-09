// This endpoint is called by the Vercel cron job every 12 hours
// to trigger a rebuild of the site and refresh the sitemap

export default async function handler(req, res) {
  try {
    // Ensure this is a GET request from the cron job
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Add a basic security check
    // Vercel cron jobs include this header
    const isVercelCron = req.headers['x-vercel-cron'] === 'true';
    
    // You can also check for a secret token
    const hasValidToken = 
      process.env.REBUILD_SECRET && 
      req.headers['x-rebuild-token'] === process.env.REBUILD_SECRET;
    
    // Only proceed if this is a Vercel cron or has a valid token
    if (!isVercelCron && !hasValidToken) {
      console.log('Unauthorized rebuild attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the deploy hook from environment variable
    const deployHook = process.env.VERCEL_DEPLOY_HOOK;
    
    if (!deployHook) {
      console.error('VERCEL_DEPLOY_HOOK environment variable is not set');
      return res.status(500).json({ error: 'Deploy hook not configured' });
    }

    // Trigger a new Vercel deployment using the deploy hook
    const response = await fetch(deployHook, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to trigger deployment:', error);
      return res.status(500).json({ error: `Failed to trigger deployment: ${error}` });
    }

    const result = await response.json();
    console.log('Successfully triggered rebuild for sitemap update:', result);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Rebuild triggered successfully',
      jobId: result.job?.id || 'unknown'
    });
  } catch (error) {
    console.error('Error triggering rebuild:', error);
    return res.status(500).json({ error: error.message });
  }
} 