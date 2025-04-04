import { logEnvironment, getSupabaseUrl, getSupabaseKey, getBedrockApiKey } from './env-utils.js';
import { setCorsHeaders, handleOptionsRequest } from './config.js';

export default function handler(req, res) {
  if (handleOptionsRequest(req, res)) return;
  
  setCorsHeaders(res);
  
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
    nodeEnv: process.env.NODE_ENV || 'not set',
    vercelEnv: process.env.VERCEL_ENV || 'not set'
  });
} 