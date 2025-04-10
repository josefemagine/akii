/**
 * API helper functions for making requests to external services
 */

import { BedrockConfig } from './env-config.ts';

/**
 * Get the appropriate API URL for Bedrock based on environment
 */
export function getBedrockApiUrl(): string {
  // Use the configured URL
  console.log('Using Bedrock API URL:', BedrockConfig.apiUrl);
  return BedrockConfig.apiUrl;
}

/**
 * Make a request to the Bedrock API
 */
export async function makeBedrockApiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  data?: any,
  apiKey?: string
): Promise<T> {
  // Try to get the API key from parameters, then config, then localStorage
  let key = apiKey || BedrockConfig.apiKey;
  
  // As a last resort, try localStorage
  if (!key && typeof window !== 'undefined') {
    const savedKey = localStorage.getItem('bedrock-api-key');
    if (savedKey) {
      console.log('Fallback: Using API key from localStorage');
      key = savedKey;
    }
  }
  
  // In development, use the local proxy to avoid CORS issues
  // In production, use the configured API URL with the API key
  let apiUrl;
  const isDevMode = import.meta.env.DEV;
  
  if (isDevMode) {
    apiUrl = '/api/bedrock'; // Will be handled by the Vite proxy
    console.log(`[DEV] Using development proxy for API requests: ${apiUrl}`);
  } else {
    if (!BedrockConfig.apiUrl) {
      throw new Error('Production API URL not configured. Please set VITE_BEDROCK_API_URL in environment.');
    }
    apiUrl = BedrockConfig.apiUrl;
    console.log(`[PROD] Using production API URL: ${apiUrl}`);
    
    // Validate API key in production
    if (!key) {
      throw new Error('API key is required for production API requests. Please provide an API key in the settings.');
    }
  }
  
  // Ensure endpoint is properly formatted
  const url = `${apiUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  console.log(`Making ${method} request to ${url}`);
  
  try {
    // Direct API request setup
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Add the API key 
    if (key) {
      headers['x-api-key'] = key;
      const maskedKey = key.length > 6 
        ? `${key.substring(0, 3)}${'*'.repeat(key.length - 6)}${key.substring(key.length - 3)}`
        : '***';
      console.log(`Using API key: ${maskedKey}`);
    } else if (isDevMode) {
      console.log('No API key provided for development environment');
    }
    
    const options: RequestInit = {
      method,
      headers,
      mode: 'cors',
      credentials: 'same-origin'
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      options.body = JSON.stringify(data);
    }
    
    console.log(`Fetch options:`, JSON.stringify({
      method: options.method,
      headers: options.headers,
      mode: options.mode,
      hasBody: Boolean(options.body)
    }));
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      
      // Create a more descriptive error message based on the endpoint and status
      let errorMessage = `API Error: ${response.status}`;
      
      try {
        // Try to parse the error text as JSON for more details
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          if (typeof errorJson.error === 'object') {
            errorMessage = `API Error: ${errorJson.error.message || errorJson.error.code || 'Unknown error'}`;
          } else {
            errorMessage = `API Error: ${errorJson.error}`;
          }
        }
      } catch (parseError) {
        // If parsing fails, use the raw error text
        errorMessage = `API Error: ${errorText || response.statusText}`;
      }
      
      // Add context to error messages based on endpoint
      if (endpoint.includes('provision-instance')) {
        errorMessage = `Failed to provision instance: ${errorMessage.replace('API Error: ', '')}`;
      } else if (endpoint.includes('delete-instance')) {
        errorMessage = `Failed to delete instance: ${errorMessage.replace('API Error: ', '')}`;
      } else if (endpoint.includes('instances')) {
        errorMessage = `Failed to fetch instances: ${errorMessage.replace('API Error: ', '')}`;
      }
      
      // Throw improved error
      throw new Error(errorMessage);
    }
    
    // Get the content type and log it
    const contentType = response.headers.get('content-type');
    console.log(`Response Content-Type: ${contentType}`);
    
    // Try to get the response text first
    const responseText = await response.text();
    console.log(`Response text (first 100 chars): ${responseText.substring(0, 100)}`);
    
    let responseData: T;
    
    try {
      // Try to parse as JSON
      responseData = JSON.parse(responseText) as T;
      console.log('Successfully parsed response as JSON');
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      
      if (isDevMode) {
        console.error('Full response text:', responseText);
        throw new Error(`Invalid JSON response from server. This is likely an issue with the development proxy or local server. First 100 chars: ${responseText.substring(0, 100)}...`);
      } else {
        // Never use mock data in production, always throw an error
        throw new Error('Invalid JSON response from API server. Please contact support.');
      }
    }
    
    if (isDevMode) {
      console.log('API Response:', JSON.stringify(responseData, null, 2));
    }
    
    return responseData;
  } catch (error) {
    console.error(`Error making ${method} request to ${url}:`, error);
    
    if (isDevMode) {
      console.error('This may be due to the development server not running. Make sure to start the local API server with "node server.js"');
    }
    
    // Always throw the error in production, never fall back to mock data
    throw error;
  }
} 