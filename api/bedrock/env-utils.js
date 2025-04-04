/**
 * Environment utilities for Vercel serverless functions
 * Helps with loading environment variables from multiple sources
 */

// Load environment variables from multiple sources
export function getEnvVariable(name) {
  // Try different environment variable patterns
  // Vercel might transform env vars in different ways (with NEXT_, without prefix, etc.)
  const possibleNames = [
    name,                // Standard name (e.g., VITE_SUPABASE_URL)
    name.replace('VITE_', ''),  // Without VITE_ prefix (e.g., SUPABASE_URL)
    `NEXT_${name}`,      // With NEXT_ prefix (e.g., NEXT_VITE_SUPABASE_URL)
    `NEXT_PUBLIC_${name}` // With NEXT_PUBLIC_ prefix (e.g., NEXT_PUBLIC_VITE_SUPABASE_URL)
  ];
  
  // Try each possible name
  for (const envName of possibleNames) {
    const value = process.env[envName];
    if (value) {
      console.log(`[ENV] Found ${name} as ${envName}`);
      return value;
    }
  }
  
  console.warn(`[ENV] Could not find environment variable ${name}`);
  return '';
}

// Get Supabase URL from environment variables
export function getSupabaseUrl() {
  return getEnvVariable('VITE_SUPABASE_URL');
}

// Get Supabase key from environment variables
export function getSupabaseKey() {
  return getEnvVariable('VITE_SUPABASE_ANON_KEY');
}

// Get Bedrock API key from environment variables
export function getBedrockApiKey() {
  return getEnvVariable('BEDROCK_API_KEY');
}

// Check if running in production environment
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

// Log all environment variables for debugging (excluding sensitive ones)
export function logEnvironment() {
  console.log('[ENV] Environment variables:');
  for (const key in process.env) {
    if (key.includes('KEY') || key.includes('SECRET') || key.includes('TOKEN')) {
      // Mask sensitive values
      console.log(`  ${key}: ${process.env[key] ? '********' : '[EMPTY]'}`);
    } else if (!key.startsWith('npm_')) {
      // Skip npm_ variables
      console.log(`  ${key}: ${process.env[key]}`);
    }
  }
} 