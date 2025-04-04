import { logEnvironment, getSupabaseUrl, getSupabaseKey, getBedrockApiKey } from '../../../api/bedrock/env-utils.js';
import { isValidApiKey } from '../../../api/bedrock/config.js';

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
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
    nextEnvInfo: {
      nodeEnv: process.env.NODE_ENV || 'not set',
      vercelEnv: process.env.VERCEL_ENV || 'not set',
      isNextJs: true
    }
  });
} 