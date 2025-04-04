/**
 * Special build entry point for Bedrock API-related code
 * This file allows us to build just the Bedrock parts of the application
 * without requiring other parts that might have type errors.
 */

// Export Bedrock configuration
export { BedrockConfig } from './lib/env-config';

// Export API helpers
export { 
  makeBedrockApiRequest,
  getBedrockApiUrl 
} from './lib/api-helpers';

// Log that this entry point is being used
console.log('[Bedrock API] Loading Bedrock API module...');
console.log('[Bedrock API] Current environment:', import.meta.env.MODE);
console.log('[Bedrock API] Development mode:', import.meta.env.DEV);
console.log('[Bedrock API] Production mode:', import.meta.env.PROD);

// Initialize and validate configuration
import { BedrockConfig } from './lib/env-config';
BedrockConfig.logConfig();

// Export a simple test function
export function testBedrockApi() {
  return {
    environment: import.meta.env.MODE,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    apiConfigured: BedrockConfig.isConfigured(),
    apiUrl: BedrockConfig.apiUrl,
    hasApiKey: Boolean(BedrockConfig.apiKey)
  };
} 