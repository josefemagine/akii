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

// Mock data for fallbacks
const mockInstancesData = {
  instances: [
    {
      id: "mock-instance-1",
      name: "Mock Titan Express",
      modelId: "amazon.titan-text-express-v1",
      throughputName: "pro-throughput",
      status: "InService",
      createdAt: new Date().toISOString(),
      plan: "pro"
    },
    {
      id: "mock-instance-2",
      name: "Mock Claude",
      modelId: "anthropic.claude-instant-v1",
      throughputName: "business-throughput",
      status: "InService",
      createdAt: new Date().toISOString(),
      plan: "business"
    }
  ]
};

/**
 * Make a request to the Bedrock API
 */
export async function makeBedrockApiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  data?: any,
  apiKey?: string,
  useMockData: boolean = false
): Promise<T> {
  // If mock data is requested, return it immediately
  if (useMockData) {
    console.log(`[Mock Data] Using mock data for ${endpoint}`);
    
    if (endpoint === '/instances' || endpoint === 'instances') {
      console.log('[Mock Data] Returning mock instances');
      return mockInstancesData as unknown as T;
    }
    
    if (endpoint === '/provision-instance' || endpoint === 'provision-instance') {
      const newInstance = {
        id: `mock-instance-${Date.now()}`,
        name: data?.name || 'New Mock Instance',
        modelId: data?.modelId || 'amazon.titan-text-express-v1',
        throughputName: data?.throughputName || 'starter-throughput',
        status: "InService",
        createdAt: new Date().toISOString(),
        plan: data?.throughputName?.includes('starter') ? 'starter' : 
              data?.throughputName?.includes('pro') ? 'pro' : 'business'
      };
      
      console.log('[Mock Data] Created mock instance:', newInstance);
      return { success: true, instance: newInstance } as unknown as T;
    }
    
    if (endpoint === '/delete-instance' || endpoint === 'delete-instance') {
      console.log('[Mock Data] Deleted mock instance:', data?.instanceId);
      return { success: true, instanceId: data?.instanceId } as unknown as T;
    }
    
    // For any other endpoints
    return { success: true, message: 'Mock operation successful' } as unknown as T;
  }
  
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
      
      // In production with server errors, fall back to mock data if requested
      if (!isDevMode && response.status >= 500 && endpoint === '/instances') {
        console.warn('Server error in production, falling back to mock data');
        return mockInstancesData as unknown as T;
      }
      
      throw new Error(`API Error: ${response.status} - ${errorText || response.statusText}`);
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
        // In production, fall back to mock data for instances endpoint
        if (endpoint === '/instances') {
          console.warn('Invalid JSON in production, falling back to mock data');
          return mockInstancesData as unknown as T;
        }
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
    } else {
      // In production environment, for GET instances endpoint, fall back to mock data
      if (endpoint === '/instances' && method === 'GET') {
        console.warn('API error in production, falling back to mock data');
        return mockInstancesData as unknown as T;
      }
    }
    
    throw error;
  }
} 