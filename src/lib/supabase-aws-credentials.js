/**
 * Supabase AWS Credentials Helper
 * Fetches AWS credentials from Supabase database and initializes AWS clients
 */
import { createClient } from '@supabase/supabase-js';
import { createBedrockClient } from './aws-bedrock-client';

// Import from client singleton if available
import supabase from './supabase-singleton';

/**
 * Fetch AWS Bedrock credentials from Supabase
 * @param {Object} options - Options
 * @param {string} options.userId - User ID to fetch credentials for
 * @param {Object} options.client - Optional Supabase client
 * @returns {Promise<Object>} Credentials result
 */
export async function fetchBedrockCredentials(options = {}) {
  const { userId, client = null } = options;
  
  if (!userId) {
    console.error('[Supabase AWS] No user ID provided');
    return {
      error: 'User ID is required',
      credentials: null
    };
  }
  
  try {
    // Use the provided client, the singleton instance, or create a temporary one as last resort
    const supabaseClient = client || supabase || createTemporaryClient();
    
    if (!supabaseClient) {
      console.error('[Supabase AWS] Could not create Supabase client');
      return {
        error: 'Could not create Supabase client',
        credentials: null
      };
    }
    
    // Production-ready approach - directly try to query the table
    // This avoids needing any custom RPC functions
    try {
      console.log(`[Supabase AWS] Attempting to fetch credentials for user ${userId}`);
      
      const { data, error } = await supabaseClient
        .from('bedrock_credentials')
        .select('aws_access_key_id, aws_secret_access_key, aws_region')
        .eq('user_id', userId)
        .single();
      
      // Handle specific error cases
      if (error) {
        // Check for table not existing errors
        if (error.code === '42P01' || 
            error.message?.includes('relation "bedrock_credentials" does not exist') ||
            error.status === 400 || 
            error.status === 404) {
          
          console.warn('[Supabase AWS] The bedrock_credentials table does not exist, using fallback credentials');
          return {
            error: 'Credentials table not available in this environment',
            credentials: null
          };
        }
        
        // Other query error
        console.error('[Supabase AWS] Error fetching credentials:', error);
        return {
          error: `Failed to fetch credentials: ${error.message}`,
          credentials: null
        };
      }
      
      if (!data || !data.aws_access_key_id || !data.aws_secret_access_key) {
        console.warn(`[Supabase AWS] No credentials found for user ${userId}`);
        return {
          error: 'No credentials found',
          credentials: null
        };
      }
      
      // Convert to standard format and log success (with masked keys)
      const credentials = {
        accessKeyId: data.aws_access_key_id,
        secretAccessKey: data.aws_secret_access_key,
        region: data.aws_region || 'us-east-1'
      };
      
      console.log(`[Supabase AWS] Successfully retrieved credentials for user ${userId} (Key ID: ${maskKey(credentials.accessKeyId)})`);
      
      return {
        error: null,
        credentials
      };
    } catch (dbError) {
      // Catch any other unexpected errors
      console.error('[Supabase AWS] Unexpected error fetching credentials:', dbError);
      return {
        error: 'Failed to fetch credentials due to unexpected error',
        credentials: null
      };
    }
  } catch (error) {
    console.error('[Supabase AWS] Error fetching credentials:', error);
    return {
      error: error.message || 'Failed to fetch credentials',
      credentials: null
    };
  }
}

/**
 * Mask sensitive keys for logging
 * @param {string} key - The key to mask
 * @returns {string} The masked key
 */
function maskKey(key) {
  if (!key) return 'undefined';
  if (key.length <= 8) return '***';
  
  // Only show first 4 and last 4 characters
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}

/**
 * Create a temporary Supabase client for one-time operations
 * Only used as a fallback if the singleton isn't available
 * @returns {Object|null} A Supabase client or null if environment variables not available
 */
function createTemporaryClient() {
  // Always try to use the singleton first
  if (supabase) {
    console.log('[Supabase AWS] Using singleton client');
    return supabase;
  }
  
  console.warn('[Supabase AWS] Using temporary client as fallback. This is not recommended.');
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