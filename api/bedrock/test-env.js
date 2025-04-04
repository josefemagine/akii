/**
 * Diagnostic endpoint for testing AWS environment variable resolution
 * This endpoint is useful for debugging environment variable issues in Vercel
 */

import { logEnvironment, getAwsRegion, getAwsAccessKeyId, getAwsSecretAccessKey } from './env-utils.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Log all environment variables
    logEnvironment();
    
    // Test AWS environment variables
    const awsRegion = getAwsRegion();
    const hasAwsCredentials = Boolean(getAwsAccessKeyId()) && Boolean(getAwsSecretAccessKey());
    
    // Test AWS endpoint construction
    let regionResolution = 'OK';
    try {
      // Simulate the AWS SDK endpoint resolution
      const url = new URL(`https://bedrock.${awsRegion}.amazonaws.com`);
      console.log(`[TEST] Successfully constructed AWS endpoint URL: ${url.href}`);
    } catch (urlError) {
      regionResolution = `ERROR: ${urlError.message}`;
      console.error(`[TEST] Failed to construct AWS endpoint URL:`, urlError);
    }
    
    // Construct diagnostic information
    const diagnostics = {
      environment: process.env.NODE_ENV || 'unknown',
      vercelEnv: process.env.VERCEL_ENV || 'unknown',
      aws: {
        region: awsRegion,
        hasCredentials: hasAwsCredentials,
        regionResolution,
        endpoint: `bedrock.${awsRegion}.amazonaws.com`
      },
      processDetails: {
        platform: process.platform,
        nodeVersion: process.version,
        memory: process.memoryUsage()
      },
      timestamp: new Date().toISOString()
    };
    
    // Return diagnostic information
    return res.status(200).json({
      message: 'Environment diagnostic complete',
      diagnostics,
      // Only return a limited set of environment variable names for security
      availableEnvVars: Object.keys(process.env)
        .filter(key => !key.includes('SECRET') && !key.includes('KEY') && !key.includes('TOKEN'))
    });
  } catch (error) {
    console.error('[TEST] Error in test-env endpoint:', error);
    return res.status(500).json({ 
      error: 'Error testing environment variables',
      message: error.message
    });
  }
} 