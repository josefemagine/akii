/**
 * Supabase AWS Credentials Helper
 * Fetches AWS credentials from Supabase database and initializes AWS clients
 */
import { createClient } from '@supabase/supabase-js';
import { createBedrockClient } from './aws-bedrock-client';

// Import from client singleton if available
import supabase from './supabase';

/**
 * Fetch AWS Bedrock credentials from Supabase
 * @param {Object} options - Options
 * @param {string} options.userId - User ID to fetch credentials for
 * @param {Object} options.client - Optional Supabase client
 * @returns {Promise<Object>} Credentials result
 */
export async function fetchBedrockCredentials(options = {}) {
  const { userId, client = null } = options;
  
  // If no user ID, return error
  if (!userId) {
    console.error('[Supabase AWS] User ID is required');
    return {
      error: 'User ID is required',
      credentials: null
    };
  }
  
  try {
    // Use provided client, global singleton, or create temporary client
    const supabaseClient = client || supabase || createTemporaryClient();
    
    if (!supabaseClient) {
      throw new Error('No Supabase client available');
    }
    
    // Query the bedrock_credentials table
    const { data, error } = await supabaseClient
      .from('bedrock_credentials')
      .select('aws_access_key_id, aws_secret_access_key, aws_region')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      console.warn(`[Supabase AWS] No credentials found for user ${userId}`);
      return {
        error: 'No credentials found',
        credentials: null
      };
    }
    
    // Convert to standard format
    const credentials = {
      accessKeyId: data.aws_access_key_id,
      secretAccessKey: data.aws_secret_access_key,
      region: data.aws_region || 'us-east-1'
    };
    
    return {
      error: null,
      credentials
    };
  } catch (error) {
    console.error('[Supabase AWS] Error fetching credentials:', error);
    return {
      error: error.message || 'Failed to fetch credentials',
      credentials: null
    };
  }
}

/**
 * Create a temporary Supabase client for one-time operations
 * @returns {Object|null} A Supabase client or null if environment variables not available
 */
function createTemporaryClient() {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('[Supabase AWS] Missing Supabase URL or key');
      return null;
    }
    
    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('[Supabase AWS] Error creating temporary client:', error);
    return null;
  }
}

/**
 * Initialize AWS Bedrock client with credentials from Supabase
 * @param {Object} options - Options
 * @param {string} options.userId - User ID to fetch credentials for
 * @param {Object} options.client - Optional Supabase client
 * @param {boolean} options.useFallbackOnError - Whether to use fallback on error
 * @returns {Promise<Object>} The initialized client and result info
 */
export async function initBedrockClientWithSupabaseCredentials(options = {}) {
  const { 
    userId, 
    client = null,
    useFallbackOnError = true
  } = options;
  
  try {
    // Fetch credentials
    const { credentials, error } = await fetchBedrockCredentials({
      userId,
      client
    });
    
    if (error && !useFallbackOnError) {
      throw new Error(error);
    }
    
    // Create the Bedrock client
    const bedrockClient = createBedrockClient({
      region: credentials?.region || 'us-east-1',
      accessKeyId: credentials?.accessKeyId,
      secretAccessKey: credentials?.secretAccessKey,
      useFallbackOnError
    });
    
    return {
      client: bedrockClient,
      success: !error,
      message: error || 'Successfully initialized Bedrock client',
      usingFallback: !!error,
      credentials: credentials ? {
        hasCredentials: !!credentials.accessKeyId && !!credentials.secretAccessKey,
        region: credentials.region
      } : null
    };
  } catch (error) {
    console.error('[Supabase AWS] Error initializing Bedrock client:', error);
    
    if (useFallbackOnError) {
      // Create a fallback client with no credentials
      const fallbackClient = createBedrockClient({
        useFallbackOnError: true
      });
      
      return {
        client: fallbackClient,
        success: false,
        message: error.message || 'Failed to initialize Bedrock client',
        usingFallback: true,
        credentials: null
      };
    }
    
    throw error;
  }
} 