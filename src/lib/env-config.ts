/**
 * Environment configuration for the application
 * 
 * This file centralizes access to environment variables and provides
 * type-safe access with fallbacks where appropriate
 */

/**
 * AWS Bedrock API configuration
 */
export const BedrockConfig = {
  apiKey: import.meta.env.VITE_BEDROCK_AWS_KEY || '',
  apiUrl: import.meta.env.VITE_BEDROCK_API_URL || 'https://www.akii.com/api/bedrock',
  
  /**
   * Check if the Bedrock API key is configured
   */
  isConfigured(): boolean {
    const hasKey = Boolean(this.apiKey);
    console.log(`Bedrock API key ${hasKey ? 'is' : 'is not'} configured`);
    console.log(`Using API URL: ${this.apiUrl}`);
    return hasKey;
  },
  
  /**
   * Log the current configuration
   */
  logConfig(): void {
    console.log('Bedrock Configuration:');
    console.log('- API Key present:', Boolean(this.apiKey));
    console.log('- API URL:', this.apiUrl);
  }
};

/**
 * Supabase configuration
 */
export const SupabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  serviceKey: import.meta.env.VITE_SUPABASE_SERVICE_KEY || '',
  
  /**
   * Check if the Supabase configuration is valid
   */
  isConfigured(): boolean {
    return Boolean(this.url && this.anonKey);
  },
};

/**
 * Application environment information
 */
export const EnvConfig = {
  isDevelopment: import.meta.env.DEV === true,
  isProduction: import.meta.env.PROD === true,
  mode: import.meta.env.MODE || 'development',
};

/**
 * Default configuration object
 */
export default {
  bedrock: BedrockConfig,
  supabase: SupabaseConfig,
  env: EnvConfig,
}; 