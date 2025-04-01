/**
 * SUPABASE CLIENT SINGLETON MODULE
 * 
 * This module serves as the single source of truth for Supabase client instances.
 * All other modules should import from here to prevent multiple instances.
 */

import { createClient, SupabaseClient, AuthResponse, Subscription } from "@supabase/supabase-js";
import { isBrowser } from "./browser-check";

// Default mock values for development - only used if variables are completely missing
const DEFAULT_DEV_SUPABASE_URL = 'https://your-project.supabase.co';
const DEFAULT_DEV_ANON_KEY = 'eyJh...dummy-key-for-dev-only'; // This is a dummy key that won't work in production

// Check for existing client in window object (cross-module singleton)
declare global {
  interface Window {
    __SUPABASE_SINGLETON?: {
      client?: SupabaseClient;
      admin?: SupabaseClient;
      auth?: SupabaseClient["auth"];
      initialized?: boolean;
      initializationError?: Error | null;
      apiKeyStatus?: 'valid' | 'missing' | 'fallback-used';
    }
  }
}

// Centralized environment variable access with fallbacks
function getSupabaseConfig() {
  // Try different environment variable names (for compatibility)
  const url = import.meta.env.VITE_SUPABASE_URL || 
              import.meta.env.REACT_APP_SUPABASE_URL ||
              (isBrowser ? localStorage.getItem('AKII_SUPABASE_URL') : null) ||
              'https://api.akii.com';
              
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                 import.meta.env.VITE_SUPABASE_KEY ||
                 import.meta.env.REACT_APP_SUPABASE_ANON_KEY || 
                 (isBrowser ? localStorage.getItem('AKII_SUPABASE_ANON_KEY') : null) ||
                 (import.meta.env.MODE === 'development' ? DEFAULT_DEV_ANON_KEY : '');

  const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 
                    import.meta.env.REACT_APP_SUPABASE_SERVICE_KEY ||
                    (isBrowser ? localStorage.getItem('AKII_SUPABASE_SERVICE_KEY') : null) ||
                    '';

  // Determine API key status
  let apiKeyStatus: 'valid' | 'missing' | 'fallback-used' = 'valid';
  
  if (!anonKey) {
    apiKeyStatus = 'missing';
  } else if (anonKey === DEFAULT_DEV_ANON_KEY) {
    apiKeyStatus = 'fallback-used';
  }

  // Always show warnings for missing keys in development
  if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
    if (!url) {
      console.error(
        "⚠️ Missing VITE_SUPABASE_URL environment variable. Using fallback URL."
      );
    }
    
    if (apiKeyStatus === 'missing') {
      console.error(
        "⚠️ Missing VITE_SUPABASE_ANON_KEY/VITE_SUPABASE_KEY environment variable. Authentication will not work without it."
      );
    } else if (apiKeyStatus === 'fallback-used') {
      console.warn(
        "⚠️ Using development fallback for Supabase key. This will not work in production."
      );
    }
    
    if (!serviceKey) {
      console.warn("ℹ️ Missing VITE_SUPABASE_SERVICE_KEY. Admin client will not be available.");
    }
  }

  return { url, anonKey, serviceKey, apiKeyStatus };
}

// Initialize the global singleton container
if (isBrowser && !window.__SUPABASE_SINGLETON) {
  window.__SUPABASE_SINGLETON = {
    initialized: false,
    initializationError: null,
    apiKeyStatus: 'valid'
  };
}

// Module-level singleton fallback (for SSR or if window is not available)
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;
let _auth: SupabaseClient["auth"] | null = null;

/**
 * Get or create the Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient {
  try {
    // Return existing instance if available
    if (isBrowser && window.__SUPABASE_SINGLETON?.client) {
      return window.__SUPABASE_SINGLETON.client;
    }
    
    // Get configuration with fallbacks
    const { url, anonKey, apiKeyStatus } = getSupabaseConfig();
    
    // Store API key status in singleton
    if (isBrowser && window.__SUPABASE_SINGLETON) {
      window.__SUPABASE_SINGLETON.apiKeyStatus = apiKeyStatus;
    }
    
    // Initialize client if it doesn't exist yet
    if (!_supabase) {
      // Prevent initialization with empty key in production
      if (!anonKey && import.meta.env.PROD) {
        throw new Error(
          "Supabase API key is required but missing. Check your environment variables."
        );
      }
      
      // Add production-specific configuration
      const isProd = url.includes('api.akii.com') || import.meta.env.PROD;
      
      try {
        // Create client with proper error handling
        _supabase = createClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: 'akii-auth-token',
          },
          global: {
            headers: {
              'x-client-info': 'supabase-js-web/2.49.4',
              'Origin': isProd && isBrowser ? 'https://www.akii.com' : (isBrowser ? window.location.origin : 'http://localhost'),
            },
          },
          db: {
            schema: 'public',
          },
        });
        
        console.log(`Supabase client initialized with URL: ${url}`);
        
        // Store in global singleton for browser
        if (isBrowser && window.__SUPABASE_SINGLETON) {
          window.__SUPABASE_SINGLETON.client = _supabase;
          window.__SUPABASE_SINGLETON.initialized = true;
          window.__SUPABASE_SINGLETON.initializationError = null;
        }
      } catch (error) {
        console.error("Failed to initialize Supabase client:", error);
        
        if (isBrowser && window.__SUPABASE_SINGLETON) {
          window.__SUPABASE_SINGLETON.initializationError = error as Error;
        }
        
        // Create a minimal mock client for development to prevent crashes
        if (import.meta.env.DEV) {
          console.warn("Using mock Supabase client to prevent application crash");
          _supabase = createMockSupabaseClient();
          
          if (isBrowser && window.__SUPABASE_SINGLETON) {
            window.__SUPABASE_SINGLETON.client = _supabase;
          }
        } else {
          throw error; // Re-throw in production
        }
      }
    }
    
    return _supabase;
  } catch (error) {
    console.error("Critical error initializing Supabase client:", error);
    
    // In development, return a mock client to prevent application crash
    if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
      console.warn("Using mock Supabase client to prevent application crash");
      return createMockSupabaseClient();
    }
    
    // In production, display an error UI and throw
    if (isBrowser) {
      displaySupabaseErrorUI("Failed to initialize Supabase client. Please check your configuration or try again later.");
    }
    throw error;
  }
}

/**
 * Get or create the Supabase admin client instance
 */
export function getAdminClient(): SupabaseClient | null {
  try {
    // Check for global singleton first (browser)
    if (isBrowser && window.__SUPABASE_SINGLETON?.admin) {
      return window.__SUPABASE_SINGLETON.admin;
    }
    
    const { url, serviceKey } = getSupabaseConfig();
    
    if (serviceKey) {
      if (!_supabaseAdmin) {
        _supabaseAdmin = createClient(url, serviceKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
        
        // Store in global singleton if in browser
        if (isBrowser && window.__SUPABASE_SINGLETON) {
          window.__SUPABASE_SINGLETON.admin = _supabaseAdmin;
        }
        
        console.log("Supabase admin client initialized");
      }
      return _supabaseAdmin;
    } else {
      // Only warn in development
      if (import.meta.env.DEV) {
        console.warn("Supabase service key not available. Admin client features will be limited.");
      }
      return null;
    }
  } catch (error) {
    console.error("Error initializing admin client:", error);
    return null; // Admin client is optional, so return null instead of throwing
  }
}

/**
 * Get the Supabase auth instance
 */
export function getAuth(): SupabaseClient["auth"] {
  try {
    // Check for global singleton first (browser)
    if (isBrowser && window.__SUPABASE_SINGLETON?.auth) {
      return window.__SUPABASE_SINGLETON.auth;
    }
    
    if (!_auth) {
      _auth = getSupabaseClient().auth;
      
      // Store in global singleton if in browser
      if (isBrowser && window.__SUPABASE_SINGLETON) {
        window.__SUPABASE_SINGLETON.auth = _auth;
      }
    }
    return _auth;
  } catch (error) {
    console.error("Error getting auth instance:", error);
    
    // In development, return a mock auth to prevent crashes
    if (import.meta.env.DEV) {
      return createMockAuthInstance();
    }
    throw error;
  }
}

// For backwards compatibility, initialize the clients immediately
// But with try/catch to prevent critical failures
let supabase: SupabaseClient;
let supabaseAdmin: SupabaseClient | null;
let auth: SupabaseClient["auth"];

try {
  supabase = getSupabaseClient();
  supabaseAdmin = getAdminClient();
  auth = getAuth();
} catch (error) {
  console.error("Error during initial Supabase client setup:", error);
  // Provide fallbacks for direct imports
  supabase = null as unknown as SupabaseClient;
  supabaseAdmin = null;
  auth = null as unknown as SupabaseClient["auth"];
}

// Export the instances
export { supabase, supabaseAdmin, auth };

/**
 * Debug function to verify Supabase instances
 */
export function debugSupabaseInstances(): {
  supabaseExists: boolean;
  adminExists: boolean;
  authExists: boolean;
  globalSingleton: boolean;
  apiKeyStatus: string;
  environmentInfo: Record<string, string | boolean>;
  initializationError: string | null;
} {
  return {
    supabaseExists: !!_supabase,
    adminExists: !!_supabaseAdmin,
    authExists: !!_auth,
    globalSingleton: isBrowser && !!window.__SUPABASE_SINGLETON?.client,
    apiKeyStatus: isBrowser ? window.__SUPABASE_SINGLETON?.apiKeyStatus || 'unknown' : 'unknown',
    environmentInfo: {
      isDev: import.meta.env.DEV === true,
      mode: import.meta.env.MODE || 'unknown',
      hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
      hasAnonKey: !!(import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_KEY),
      hasServiceKey: !!import.meta.env.VITE_SUPABASE_SERVICE_KEY,
    },
    initializationError: isBrowser && window.__SUPABASE_SINGLETON?.initializationError 
      ? window.__SUPABASE_SINGLETON.initializationError.message 
      : null
  };
}

/**
 * Creates a minimal mock Supabase client for development
 * This prevents the application from crashing when Supabase is not available
 */
function createMockSupabaseClient(): SupabaseClient {
  // Simple mock that just logs operations and returns empty results
  // @ts-ignore - This is intentionally not a complete implementation
  return {
    auth: createMockAuthInstance(),
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          limit: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
        limit: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
      }),
      upsert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null }),
        }),
      }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: { path: 'mock-path' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'http://mock-url.com' } }),
      }),
    },
  } as unknown as SupabaseClient;
}

/**
 * Creates a mock auth instance for development
 */
function createMockAuthInstance(): SupabaseClient["auth"] {
  const mockCallback = () => {};
  
  // Create a proper Subscription object that matches the expected interface
  const createMockSubscription = (): Subscription => ({
    id: 'mock-subscription-id',
    callback: mockCallback,
    unsubscribe: () => {}
  });
  
  // @ts-ignore - This is intentionally not a complete implementation
  return {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signUp: async () => ({ data: { user: null, session: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({
      data: { 
        subscription: createMockSubscription()
      },
    }),
  };
}

/**
 * Display an error UI when Supabase initialization fails completely
 */
function displaySupabaseErrorUI(message: string): void {
  if (!isBrowser) return;
  
  // Only show once
  if (document.getElementById('supabase-error-overlay')) return;
  
  const overlay = document.createElement('div');
  overlay.id = 'supabase-error-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  
  const content = document.createElement('div');
  content.style.backgroundColor = '#fff';
  content.style.color = '#333';
  content.style.padding = '2rem';
  content.style.borderRadius = '0.5rem';
  content.style.maxWidth = '600px';
  content.style.textAlign = 'center';
  
  const heading = document.createElement('h2');
  heading.textContent = 'Connection Error';
  heading.style.marginBottom = '1rem';
  
  const text = document.createElement('p');
  text.textContent = message;
  text.style.marginBottom = '1.5rem';
  
  const button = document.createElement('button');
  button.textContent = 'Retry Connection';
  button.style.padding = '0.5rem 1rem';
  button.style.backgroundColor = '#3730a3';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.borderRadius = '0.25rem';
  button.style.cursor = 'pointer';
  button.addEventListener('click', () => {
    window.location.reload();
  });
  
  content.appendChild(heading);
  content.appendChild(text);
  content.appendChild(button);
  overlay.appendChild(content);
  document.body.appendChild(overlay);
}

// Default export for easy importing
export default supabase;
