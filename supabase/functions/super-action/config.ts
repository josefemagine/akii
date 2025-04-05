// Configuration file for AWS Bedrock Integration

// Helper for environment variables
const getEnv = (name: string, defaultValue: string = ""): string => {
  // @ts-ignore - Deno.env access
  return Deno?.env?.get?.(name) || defaultValue;
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
  USE_REAL_AWS: getEnv("USE_REAL_AWS") === "true",
  MOCK_AWS_CALLS: getEnv("MOCK_AWS_CALLS") === "true",
  
  // CORS Headers
  CORS_HEADERS: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, X-Client-Info",
    "Access-Control-Allow-Credentials": "true"
  }
};

// Validate required configuration
export function validateConfig() {
  const missingVars = [];
  
  if (!CONFIG.AWS_REGION) missingVars.push("AWS_REGION");
  if (!CONFIG.AWS_ACCESS_KEY_ID) missingVars.push("AWS_ACCESS_KEY_ID");
  if (!CONFIG.AWS_SECRET_ACCESS_KEY) missingVars.push("AWS_SECRET_ACCESS_KEY");
  if (!CONFIG.SUPABASE_URL) missingVars.push("SUPABASE_URL");
  if (!CONFIG.SUPABASE_SERVICE_ROLE_KEY) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");
  
  return {
    isValid: missingVars.length === 0,
    missingVars
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