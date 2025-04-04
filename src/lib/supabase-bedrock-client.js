/**
 * Client library for interacting with AWS Bedrock via Supabase Edge Functions
 */
import { BedrockConfig } from './env-config';

// Base URL for Edge Functions
const getBaseUrl = () => {
  // Use the new Edge Function URL
  return "https://api.akii.com/functions/v1/super-action";
};

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
 * Get headers for Bedrock API requests
 */
const getHeaders = () => {
  const apiKey = getApiKey();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': apiKey,
    'Authorization': `Bearer ${apiKey}`
  };
};

/**
 * Get all Bedrock instances
 */
export async function getBedrockInstances() {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      throw new Error('Supabase URL not configured');
    }
    
    const response = await fetch(`${baseUrl}/instances`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get instances: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data.instances || [];
  } catch (error) {
    console.error('Error fetching Bedrock instances:', error);
    return [];
  }
}

/**
 * Create a new Bedrock instance
 */
export async function createBedrockInstance(instanceData) {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      throw new Error('Supabase URL not configured');
    }
    
    const response = await fetch(`${baseUrl}/provision-instance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(instanceData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create instance: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data.instance;
  } catch (error) {
    console.error('Error creating Bedrock instance:', error);
    throw error;
  }
}

/**
 * Delete a Bedrock instance
 */
export async function deleteBedrockInstance(instanceId) {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      throw new Error('Supabase URL not configured');
    }
    
    const response = await fetch(`${baseUrl}/delete-instance`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ instanceId })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete instance: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deleting Bedrock instance:', error);
    throw error;
  }
}

/**
 * Test the environment configuration
 */
export async function testEnvironment() {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      throw new Error('Supabase URL not configured');
    }
    
    const response = await fetch(`${baseUrl}/test-env`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to test environment: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error testing environment:', error);
    throw error;
  }
} 