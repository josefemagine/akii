import React from "react";
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
    // Get API key from environment, empty string in development is acceptable
    apiKey: import.meta.env.VITE_BEDROCK_AWS_KEY || '',
    // API URL with a meaningful default for production
    // This is the correct URL structure that works with our rewrites
    apiUrl: import.meta.env.VITE_BEDROCK_API_URL || 'https://www.akii.com/api/bedrock',
    // Helper to quickly check if in development mode
    isDev: import.meta.env.DEV,
    /**
     * Validate and get the API key
     * In production, throws an error if no key is available
     */
    getApiKey() {
        if (!this.isDev && !this.apiKey) {
            console.error('No API key configured in production environment');
            throw new Error('Bedrock API key is required in production. Set VITE_BEDROCK_AWS_KEY in your environment.');
        }
        return this.apiKey;
    },
    /**
     * Get the appropriate API URL for the current environment
     */
    getApiUrl() {
        if (!this.apiUrl && !this.isDev) {
            console.warn('No API URL configured, using default production URL');
        }
        return this.apiUrl;
    },
    /**
     * Check if the Bedrock API configuration is valid for the current environment
     */
    isConfigured() {
        const hasKey = Boolean(this.apiKey);
        // Log the current state
        console.log(`Bedrock API key ${hasKey ? 'is' : 'is not'} configured in environment`);
        console.log(`Using API URL: ${this.apiUrl}`);
        // In development, no key is required
        if (this.isDev) {
            return true;
        }
        // In production, an API key is required
        return hasKey;
    },
    /**
     * Log the current configuration
     */
    logConfig() {
        console.log('Bedrock Configuration:');
        console.log('- API Key present:', Boolean(this.apiKey));
        console.log('- API Key length:', this.apiKey ? this.apiKey.length : 0);
        console.log('- API URL:', this.apiUrl);
        console.log('- Environment:', this.isDev ? 'Development' : 'Production');
        console.log('- API key required:', !this.isDev);
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
    isConfigured() {
        return Boolean(this.url && this.anonKey);
    },
};
/**
 * Application environment information
 */
export const EnvConfig = {
    isDevelopment: import.meta.env.MODE === 'development' || import.meta.env.DEV,
    isProduction: import.meta.env.MODE === 'production' && !import.meta.env.DEV,
    mode: import.meta.env.MODE || 'production',
};
interface BedrockConfigProps {}

/**
 * Default configuration object
 */
export default {
    bedrock: BedrockConfig,
    supabase: SupabaseConfig,
    env: EnvConfig,
};
