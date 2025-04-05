// Configuration file for AWS Bedrock Integration

// Helper for environment variables with improved error handling
const getEnv = (name: string, defaultValue: string = ""): string => {
  try {
    // @ts-ignore - Deno.env access
    const value = Deno?.env?.get?.(name);
    if (value === undefined || value === null) {
      console.warn(`[CONFIG] Environment variable ${name} not found, using default: ${defaultValue ? 'provided' : 'empty string'}`);
      return defaultValue;
    }
    
    // Trim the value to remove any whitespace
    const trimmedValue = value.trim();
    
    // Log that we found the environment variable (but don't show the value)
    const valuePreview = name.includes('SECRET') || name.includes('KEY') ? 
      `[redacted, length: ${trimmedValue.length}]` : 
      (trimmedValue.length > 10 ? `${trimmedValue.substring(0, 10)}...` : trimmedValue);
    
    console.log(`[CONFIG] Found environment variable ${name}: ${valuePreview}`);
    return trimmedValue;
  } catch (error) {
    console.error(`[CONFIG] Error accessing environment variable ${name}:`, error);
    return defaultValue;
  }
};

// Define expected environment variables
export const CONFIG = {
  // AWS Configuration
  AWS_REGION: getEnv("AWS_REGION", "us-east-1"),
  AWS_ACCESS_KEY_ID: getEnv("AWS_ACCESS_KEY_ID"),
  AWS_SECRET_ACCESS_KEY: getEnv("AWS_SECRET_ACCESS_KEY"),
  
  // Supabase Configuration
  SUPABASE_URL: getEnv("SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: getEnv("SUPABASE_SERVICE_ROLE_KEY"),
  
  // Feature flags
  USE_REAL_AWS: getEnv("USE_REAL_AWS") === "true" || false,
  
  // CORS Headers
  CORS_HEADERS: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, X-Client-Info",
    "Access-Control-Allow-Credentials": "true"
  }
};

// Validate required configuration with more detailed errors
export function validateConfig() {
  const missingVars: string[] = [];
  const formatErrors: string[] = [];
  
  // Check for missing variables
  if (!CONFIG.AWS_REGION) missingVars.push("AWS_REGION");
  if (!CONFIG.AWS_ACCESS_KEY_ID) missingVars.push("AWS_ACCESS_KEY_ID");
  if (!CONFIG.AWS_SECRET_ACCESS_KEY) missingVars.push("AWS_SECRET_ACCESS_KEY");
  if (!CONFIG.SUPABASE_URL) missingVars.push("SUPABASE_URL");
  if (!CONFIG.SUPABASE_SERVICE_ROLE_KEY) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");
  
  // Check for format errors
  if (CONFIG.AWS_ACCESS_KEY_ID && !CONFIG.AWS_ACCESS_KEY_ID.startsWith('AKIA')) {
    formatErrors.push("AWS_ACCESS_KEY_ID format is invalid (should start with 'AKIA')");
  }
  
  if (CONFIG.AWS_SECRET_ACCESS_KEY && CONFIG.AWS_SECRET_ACCESS_KEY.length < 30) {
    formatErrors.push("AWS_SECRET_ACCESS_KEY appears to be too short");
  }
  
  return {
    isValid: missingVars.length === 0 && formatErrors.length === 0,
    missingVars,
    formatErrors
  };
}

// Get AWS credentials
export function getAwsCredentials() {
  return {
    region: CONFIG.AWS_REGION,
    credentials: {
      accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
      secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY
    }
  };
} 