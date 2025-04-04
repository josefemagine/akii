import { logEnvironment, getSupabaseUrl, getSupabaseKey, getBedrockApiKey } from './env-utils.js';
import { setCorsHeaders, handleOptionsRequest, isValidApiKey } from './config.js';

export default function handler(req, res) {
  if (handleOptionsRequest(req, res)) return;
  
  setCorsHeaders(res);
  
  // Get API key from header
  const apiKey = req.headers['x-api-key'];
  
  // Log all environment variables for debugging
  logEnvironment();
  
  // Check API key validity
  const isApiKeyValid = isValidApiKey(apiKey);
  
  // Return information about the environment variables (redacted for security)
  res.status(200).json({
    supabaseUrl: getSupabaseUrl() ? 'Found (redacted)' : 'Not found',
    supabaseKey: getSupabaseKey() ? 'Found (redacted)' : 'Not found',
    bedrockApiKey: getBedrockApiKey() ? 'Found (redacted)' : 'Not found',
    apiKeyValidation: {
      providedKey: apiKey ? 'Present (redacted)' : 'Not provided',
      keyLength: apiKey ? apiKey.length : 0,
      isValid: isApiKeyValid
    },
    envVarNames: Object.keys(process.env).filter(key => 
      !key.includes('KEY') && 
      !key.includes('SECRET') && 
      !key.includes('TOKEN')
    ),
    nodeEnv: process.env.NODE_ENV || 'not set',
    vercelEnv: process.env.VERCEL_ENV || 'not set'
  });
} 