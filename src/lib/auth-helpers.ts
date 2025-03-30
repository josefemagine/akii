/**
 * Auth helper functions for handling Supabase authentication
 */

// Store the return path for after authentication
export function storeReturnPath(path: string) {
  localStorage.setItem('auth-return-path', path);
}

/**
 * Get the stored return path and optionally remove it from storage
 */
export function getReturnPath(clear = true) {
  const path = localStorage.getItem('auth-return-path');
  if (clear) {
    localStorage.removeItem('auth-return-path');
  }
  return path;
}

/**
 * Clear all stored authentication data
 */
export function clearStoredAuth() {
  // Clear any stored tokens
  localStorage.removeItem('sb-access-token');
  localStorage.removeItem('sb-refresh-token');
  localStorage.removeItem('supabase.auth.token');
  
  // Clear any authentication state flags
  localStorage.removeItem('auth-in-progress');
  localStorage.removeItem('auth-in-progress-time');
  
  // Clear any debug tokens
  localStorage.removeItem('debug-access-token');
  localStorage.removeItem('debug-refresh-token');
}

/**
 * Securely store access and refresh tokens
 */
export function securelyStoreTokens(tokens: { 
  access_token?: string; 
  refresh_token?: string;
}) {
  if (tokens.access_token) {
    localStorage.setItem('sb-access-token', tokens.access_token);
  }
  
  if (tokens.refresh_token) {
    localStorage.setItem('sb-refresh-token', tokens.refresh_token);
  }
}

/**
 * Retrieve stored tokens
 */
export function getStoredTokens() {
  return {
    access_token: localStorage.getItem('sb-access-token') || '',
    refresh_token: localStorage.getItem('sb-refresh-token') || ''
  };
}

/**
 * Generate a secure random state for CSRF protection
 */
export function generateSecureState() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Extract tokens from URL hash fragment
 */
export function extractTokensFromHash(): { access_token: string; refresh_token: string; provider_token?: string } | null {
  try {
    // Check if we have a hash
    if (!window.location.hash || !window.location.hash.includes('access_token')) {
      return null;
    }
    
    // Parse the hash
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const providerToken = params.get('provider_token');
    
    if (!accessToken || !refreshToken) {
      console.error('Missing required tokens in hash');
      return null;
    }
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      ...(providerToken && { provider_token: providerToken })
    };
  } catch (error) {
    console.error('Error extracting tokens from hash:', error);
    return null;
  }
}

/**
 * Refresh the access token using a refresh token
 * @returns boolean indicating success
 */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem('sb-refresh-token');
    if (!refreshToken) return false;
    
    // Import dynamically to avoid circular dependencies
    const { supabase } = await import('./supabase');
    
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    
    if (error || !data.session) {
      console.error("Failed to refresh access token:", error);
      return false;
    }
    
    // Store the new tokens
    securelyStoreTokens({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    });
    
    return true;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return false;
  }
}
