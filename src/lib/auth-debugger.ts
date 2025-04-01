/**
 * Auth Debugging and Repair Tools
 * 
 * This file contains utilities for diagnosing and fixing common
 * authentication issues in the application.
 */

import { supabase, auth } from './supabase-singleton';
import { ensureUserProfile } from './auth-helpers';

/**
 * Debug authentication state
 * Returns diagnostic information about the current auth state
 */
export async function debugAuth() {
  console.log('🔍 Starting auth diagnostics...');
  
  const results = {
    timestamp: new Date().toISOString(),
    localStorage: {} as Record<string, string | null>,
    session: null as any,
    user: null as any,
    errors: [] as string[],
  };
  
  // Check localStorage for auth keys
  try {
    const authKeys = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase.auth.token',
      'supabase_auth_token',
      'akii-auth-user-email',
      'akii-auth-user-id',
      'akii-auth-timestamp',
      'akii-auth-success',
      'auth-in-progress',
    ];
    
    authKeys.forEach(key => {
      try {
        results.localStorage[key] = localStorage.getItem(key);
      } catch (e) {
        results.errors.push(`Error reading ${key} from localStorage: ${e}`);
      }
    });
  } catch (e) {
    results.errors.push(`Error accessing localStorage: ${e}`);
  }
  
  // Check session
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      results.errors.push(`Session error: ${error.message}`);
    } else {
      results.session = {
        exists: !!data?.session,
        expiresAt: data?.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null,
        isExpired: data?.session?.expires_at ? Date.now() > data.session.expires_at * 1000 : null,
      };
    }
  } catch (e) {
    const error = e as Error;
    results.errors.push(`Session check exception: ${error.message}`);
  }
  
  // Check user
  try {
    const { data, error } = await auth.getUser();
    
    if (error) {
      results.errors.push(`User error: ${error.message}`);
    } else {
      results.user = data?.user ? {
        id: data.user.id,
        email: data.user.email,
        emailConfirmed: data.user.email_confirmed_at ? true : false,
        lastSignIn: data.user.last_sign_in_at,
        metadata: data.user.user_metadata,
      } : null;
    }
  } catch (e) {
    const error = e as Error;
    results.errors.push(`User check exception: ${error.message}`);
  }
  
  console.log('🔍 Auth diagnostics completed:', results);
  return results;
}

/**
 * Attempt to repair authentication state
 * This function tries to fix common auth issues
 */
export async function repairAuth() {
  console.log('🔧 Starting auth repair...');
  
  const results = {
    timestamp: new Date().toISOString(),
    sessionRepaired: false,
    userFetched: false,
    profileEnsured: false,
    errors: [] as string[],
  };
  
  // Step 1: Try to repair session from tokens
  try {
    const accessToken = localStorage.getItem('sb-access-token');
    const refreshToken = localStorage.getItem('sb-refresh-token');
    
    if (accessToken && refreshToken) {
      console.log('🔧 Found tokens, attempting to restore session...');
      
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (error) {
        results.errors.push(`Session repair error: ${error.message}`);
      } else {
        results.sessionRepaired = true;
        console.log('🔧 Session restored successfully');
      }
    } else {
      console.log('🔧 No tokens found to restore session');
      results.errors.push('No access or refresh tokens found');
    }
    
    // Step 2: Check if we got a user
    try {
      const { data: userData, error: userError } = await auth.getUser();
      
      if (userError) {
        results.errors.push(`User fetch error: ${userError.message}`);
      } else if (userData) {
        // Step 3: Ensure profile exists
        try {
          // Check if userData contains a user property or is the user itself
          const userObject = 'user' in userData ? userData.user : userData;
          // Pass the user object
          const profileResult = await ensureUserProfile(userObject);
          results.profileEnsured = !!profileResult.data; // Check if data exists
          
          if (!profileResult.data) {
            results.errors.push(`Profile creation failed: ${profileResult.error?.message}`);
          }
        } catch (e) {
          const error = e as Error;
          results.errors.push(`Profile creation exception: ${error.message}`);
        }
      } else {
        results.errors.push('No user found after session repair');
      }
    } catch (e) {
      const error = e as Error;
      results.errors.push(`User fetch exception: ${error.message}`);
    }
  } catch (e) {
    const error = e as Error;
    results.errors.push(`Session repair exception: ${error.message}`);
  }
  
  console.log('🔧 AUTH REPAIR COMPLETED:', results);
  return results;
} 