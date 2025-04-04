/**
 * Environment utilities for Vercel serverless functions
 * Helps with loading environment variables from multiple sources
 */

/**
 * Environment variable utilities for API endpoints
 */

/**
 * Get an environment variable by name, trying different naming patterns
 * @param {string} name - The base name of the environment variable
 * @returns {string|null} - The value of the environment variable or null if not found
 */
export function getEnvVariable(name) {
  // Try standard environment variable
  let value = process.env[name];
  if (value) return value;
  
  // Try without VITE_ prefix if the name starts with it
  if (name.startsWith('VITE_')) {
    value = process.env[name.substring(5)];
    if (value) return value;
  }
  
  // Try with NEXT_ prefix
  value = process.env[`NEXT_${name}`];
  if (value) return value;
  
  // Try with NEXT_PUBLIC_ prefix
  value = process.env[`NEXT_PUBLIC_${name}`];
  if (value) return value;
  
  return null;
}

/**
 * Get the Supabase URL from environment variables
 */
export function getSupabaseUrl() {
  return getEnvVariable('SUPABASE_URL') || getEnvVariable('VITE_SUPABASE_URL');
}

/**
 * Get the Supabase key from environment variables
 */
export function getSupabaseKey() {
  return getEnvVariable('SUPABASE_ANON_KEY') || getEnvVariable('VITE_SUPABASE_ANON_KEY');
}

/**
 * Get the Bedrock API key from environment variables
 */
export function getBedrockApiKey() {
  const key = getEnvVariable('BEDROCK_API_KEY');
  console.log('[ENV] Found BEDROCK_API_KEY as ' + (key ? 'BEDROCK_API_KEY' : 'not found'));
  return key;
}

/**
 * Get the AWS access key ID from environment variables
 */
export function getAwsAccessKeyId() {
  const key = getEnvVariable('AWS_ACCESS_KEY_ID');
  console.log('[ENV] AWS access key ID: ' + (key ? 'Found' : 'Not found'));
  return key;
}

/**
 * Get the AWS secret access key from environment variables
 */
export function getAwsSecretAccessKey() {
  const key = getEnvVariable('AWS_SECRET_ACCESS_KEY');
  console.log('[ENV] AWS secret access key: ' + (key ? 'Found' : 'Not found'));
  return key;
}

/**
 * Get the AWS region from environment variables
 */
export function getAwsRegion() {
  const region = getEnvVariable('AWS_REGION');
  console.log('[ENV] AWS region: ' + (region || 'Not found, using default us-east-1'));
  return region || 'us-east-1';
}

/**
 * Check if the current environment is production
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Log all environment variables for debugging (masking sensitive values)
 */
export function logEnvironment() {
  const env = { ...process.env };
  
  // Mask sensitive values
  const sensitiveKeys = ['KEY', 'SECRET', 'PASSWORD', 'TOKEN', 'AUTH'];
  Object.keys(env).forEach(key => {
    if (sensitiveKeys.some(sensitive => key.toUpperCase().includes(sensitive))) {
      env[key] = `${env[key].substring(0, 3)}****${env[key].substring(env[key].length - 3)}`;
    }
  });
  
  // Log the environment
  console.log('[ENV] Environment variables available:', Object.keys(env).join(', '));
  
  // Log specific important variables
  console.log('[ENV] NODE_ENV:', env.NODE_ENV);
  console.log('[ENV] VERCEL_ENV:', env.VERCEL_ENV);
  console.log('[ENV] AWS_REGION:', getAwsRegion());
  console.log('[ENV] Has AWS credentials:', Boolean(getAwsAccessKeyId()) && Boolean(getAwsSecretAccessKey()));
} 