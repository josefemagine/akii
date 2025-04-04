/**
 * API helper functions for making requests to external services
 */

import { BedrockConfig } from './env-config';

/**
 * Get the appropriate API URL for Bedrock based on environment
 */
export function getBedrockApiUrl(useMockData = false): string {
  // In development mode, use the Vite proxy to avoid CORS issues
  if (import.meta.env.DEV && !useMockData) {
    // Get the current port from the window location
    const port = window.location.port;
    console.log(`Using development proxy for Bedrock API on port ${port}`);
    return `${window.location.protocol}//${window.location.hostname}:${port}/api/bedrock`;
  }
  
  // Otherwise use the configured URL
  console.log('Using direct Bedrock API URL:', BedrockConfig.apiUrl);
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
  const apiUrl = getBedrockApiUrl();
  const url = `${apiUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  console.log(`Making ${method} request to ${url}`);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  // Only add the API key if it's present
  if (key) {
    headers['x-api-key'] = key;
    console.log('Using API key:', key.substring(0, 3) + '...' + key.substring(key.length - 3));
  } else {
    console.log('No API key provided');
  }
  
  try {
    const options: RequestInit = {
      method,
      headers,
      // Only use 'cors' mode when not using the proxy
      mode: import.meta.env.DEV ? 'same-origin' : 'cors',
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
    
    const responseData = await response.json();
    console.log('API Response data:', responseData);
    return responseData as T;
  } catch (error) {
    console.error(`Error making ${method} request to ${url}:`, error);
    throw error;
  }
} 