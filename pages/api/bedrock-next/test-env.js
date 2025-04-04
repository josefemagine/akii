import { logEnvironment, getSupabaseUrl, getSupabaseKey, getBedrockApiKey } from '../../../api/bedrock/env-utils.js';

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Log all environment variables for debugging
  logEnvironment();
  
  // Return information about the environment variables (redacted for security)
  res.status(200).json({
    supabaseUrl: getSupabaseUrl() ? 'Found (redacted)' : 'Not found',
    supabaseKey: getSupabaseKey() ? 'Found (redacted)' : 'Not found',
    bedrockApiKey: getBedrockApiKey() ? 'Found (redacted)' : 'Not found',
    envVarNames: Object.keys(process.env).filter(key => 
      !key.includes('KEY') && 
      !key.includes('SECRET') && 
      !key.includes('TOKEN')
    ),
    nextEnvInfo: {
      nodeEnv: process.env.NODE_ENV || 'not set',
      vercelEnv: process.env.VERCEL_ENV || 'not set',
      isNextJs: true
    }
  });
} 