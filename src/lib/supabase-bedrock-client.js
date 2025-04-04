/**
 * Supabase Bedrock API Client
 * This client handles communication with Bedrock API endpoints,
 * using proper authentication through Supabase JWT tokens.
 */

import { BedrockConfig } from './bedrock-config';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get the API key for Bedrock requests
 * Prefers localStorage saved key, falls back to environment variable
 */
const getApiKey = () => {
  // Check for saved API key in localStorage first
  const savedKey = localStorage.getItem('bedrock-api-key');
  
  if (savedKey) {
    console.log('Using saved API key from localStorage');
    return savedKey;
  }
  
  // Otherwise use the environment variable
  return BedrockConfig.apiKey || '';
};

/**
 * Get Supabase auth session with JWT token
 * @returns {Promise<string>} JWT token for authentication or null if not authenticated
 */
const getAuthToken = async () => {
  try {
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting auth session:', error.message);
      return null;
    }
    
    if (!session) {
      console.log('No active session found');
      return null;
    }
    
    return session.access_token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

/**
 * Get headers for Bedrock API requests, using JWT token when available
 * Falls back to API key if JWT token is not available
 */
const getHeaders = async () => {
  // Try to get JWT token first
  const token = await getAuthToken();
  const apiKey = getApiKey();
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // Use JWT token if available, otherwise use API key
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Always include x-api-key as fallback
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  
  return headers;
};

/**
 * Base API URL for Bedrock endpoints
 */
const apiBaseUrl = BedrockConfig.apiUrl;

/**
 * Get a list of all Bedrock model throughput instances
 */
const listInstances = async () => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${apiBaseUrl}/instances`, { 
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return { instances: data.instances || [], error: null };
  } catch (error) {
    console.error('Error listing instances:', error);
    return { instances: [], error: error.message };
  }
};

/**
 * Create a new Bedrock model throughput instance
 */
const createInstance = async (modelInfo) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${apiBaseUrl}/provision-instance`, {
      method: 'POST',
      headers,
      body: JSON.stringify(modelInfo)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return { instance: data.instance, error: null };
  } catch (error) {
    console.error('Error creating instance:', error);
    return { instance: null, error: error.message };
  }
};

/**
 * Delete a Bedrock model throughput instance
 */
const deleteInstance = async (instanceId) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${apiBaseUrl}/delete-instance`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ instanceId })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: data.success, error: null };
  } catch (error) {
    console.error('Error deleting instance:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test API environment and connectivity
 */
const testEnvironment = async () => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${apiBaseUrl}/test-env`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return { environment: data, error: null };
  } catch (error) {
    console.error('Error testing environment:', error);
    return { environment: null, error: error.message };
  }
};

// Export all client functions
export const BedrockClient = {
  listInstances,
  createInstance,
  deleteInstance,
  testEnvironment,
  getApiKey,
  getAuthToken,
};

export default BedrockClient; 