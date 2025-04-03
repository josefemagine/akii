/**
 * Supabase Auth Recovery Middleware
 * 
 * This module provides utilities to detect and repair authentication issues
 * that may occur due to token conflicts or multiple client instances.
 */

import { supabase } from './supabase';
import { detectDuplicateClients } from './detect-client-duplicates';

interface AuthStatus {
  hasSession: boolean;
  hasUser: boolean;
  hasTokens: boolean;
  hasAuthData: boolean;
  isAuthenticated: boolean;
}

/**
 * Check if the user is authenticated by all available methods
 */
export async function checkAuthStatus(): Promise<AuthStatus> {
  try {
    // Check Supabase session
    const { data: session } = await supabase.auth.getSession();
    
    // Check if we have a current user
    const { data: userData } = await supabase.auth.getUser();
    
    // Check localStorage for tokens
    const hasTokens = checkLocalStorageForTokens();
    
    // Check if we have auth data in localStorage
    const hasAuthData = checkLocalStorageForAuthData();
    
    return {
      hasSession: !!session?.session,
      hasUser: !!userData?.user,
      hasTokens,
      hasAuthData,
      isAuthenticated: !!session?.session || !!userData?.user || hasTokens
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    return {
      hasSession: false,
      hasUser: false,
      hasTokens: checkLocalStorageForTokens(),
      hasAuthData: checkLocalStorageForAuthData(),
      isAuthenticated: false
    };
  }
}

/**
 * Check localStorage for auth tokens
 */
function checkLocalStorageForTokens(): boolean {
  try {
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase.auth.token') || 
      key.includes('sb-') ||
      key.includes('akii-auth-token')
    );
    
    return authKeys.length > 0;
  } catch (e) {
    console.error('Error checking localStorage for tokens:', e);
    return false;
  }
}

/**
 * Check localStorage for any auth-related data
 */
function checkLocalStorageForAuthData(): boolean {
  try {
    const authDataKeys = Object.keys(localStorage).filter(key => 
      key.includes('user') || 
      key.includes('profile') || 
      key.includes('akii-auth')
    );
    
    return authDataKeys.length > 0;
  } catch (e) {
    console.error('Error checking localStorage for auth data:', e);
    return false;
  }
}

/**
 * Try to repair authentication issues
 */
export async function tryRepairAuthIssues(): Promise<boolean> {
  try {
    console.log('🔧 Attempting to repair authentication issues...');
    
    // Check for duplicate client instances
    const duplicateCheck = detectDuplicateClients();
    if (duplicateCheck.hasDuplicates) {
      console.warn('⚠️ Found duplicate Supabase clients - this may cause auth issues');
      // We can't fix duplicates here, but we can log them
    }
    
    // Check current auth status
    const authStatus = await checkAuthStatus();
    
    if (authStatus.isAuthenticated) {
      console.log('✅ User is authenticated - no repair needed');
      return true;
    }
    
    // If we have tokens but no session, try to refresh the session
    if (authStatus.hasTokens && !authStatus.hasSession) {
      console.log('🔄 Found tokens but no session - attempting to refresh');
      
      try {
        // Try to force refresh the session
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Error refreshing session:', error);
        } else if (data.session) {
          console.log('✅ Successfully refreshed session');
          return true;
        }
      } catch (refreshError) {
        console.error('Exception during session refresh:', refreshError);
      }
    }
    
    // If we still don't have a session but have auth data, try to recreate tokens
    if (!authStatus.hasSession && authStatus.hasAuthData) {
      console.log('🔄 Attempting to restore from auth data');
      
      // Look for stored user data
      try {
        const profileStr = localStorage.getItem('akii-user-profile');
        if (profileStr) {
          const profile = JSON.parse(profileStr);
          console.log('Found user profile in localStorage:', profile);
          
          // We can't fully restore the session, but we can set a flag to stay on protected pages
          localStorage.setItem('akii-auth-emergency', 'true');
          localStorage.setItem('akii-auth-emergency-time', Date.now().toString());
          
          console.log('✅ Set emergency auth flag - user can continue using the app');
          return true;
        }
      } catch (parseError) {
        console.error('Error parsing stored profile:', parseError);
      }
    }
    
    console.log('❌ Could not repair authentication issues');
    return false;
  } catch (error) {
    console.error('Error in auth repair:', error);
    return false;
  }
}

/**
 * Auth recovery middleware
 * Call this at key navigation points to ensure authentication is working
 */
export async function authRecoveryMiddleware(): Promise<void> {
  try {
    // Check if repair has been attempted recently to avoid infinite loops
    const lastRepairTime = parseInt(localStorage.getItem('akii-auth-repair-time') || '0');
    const now = Date.now();
    
    // Only try to repair once every 5 minutes
    if (now - lastRepairTime < 5 * 60 * 1000) {
      return;
    }
    
    // Check auth status
    const authStatus = await checkAuthStatus();
    
    // If we detect a potential issue, try to repair
    if (authStatus.hasTokens && !authStatus.hasSession) {
      console.warn('⚠️ Potential auth issue detected - tokens exist but no session');
      await tryRepairAuthIssues();
      localStorage.setItem('akii-auth-repair-time', now.toString());
    }
  } catch (error) {
    console.error('Error in auth recovery middleware:', error);
  }
} 