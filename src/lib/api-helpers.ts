/**
 * API helper functions for making requests to external services
 */

import { BedrockConfig } from './env-config';

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
  const key = apiKey || BedrockConfig.apiKey;
  
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
      throw new Error('API key is required for production API requests');
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
      console.log(`Using API key: ${key.substring(0, 3)}${'*'.repeat(key.length - 6)}${key.substring(key.length - 3)}`);
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
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      throw new Error(`API Error: ${response.status} - ${errorText || response.statusText}`);
    }
    
    // Get the content type to ensure it's JSON
    const contentType = response.headers.get('content-type');
    
    let responseData: T;
    
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`Response is not JSON! Content-Type: ${contentType}`);
      const text = await response.text();
      
      // Log a brief summary of the response
      console.log('Response text (first 100 chars):', text.substring(0, 100));
      
      // Try to parse as JSON anyway
      try {
        responseData = JSON.parse(text) as T;
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        
        if (isDevMode) {
          console.error('Full response:', text);
          throw new Error(`Invalid JSON response from server. This is likely an issue with the development proxy. First 100 chars: ${text.substring(0, 100)}...`);
        } else {
          throw new Error('Invalid JSON response from API server. Please contact support.');
        }
      }
    } else {
      responseData = await response.json() as T;
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
    
    throw error;
  }
} 