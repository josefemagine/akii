/**
 * Auth Utilities - Compatibility Layer
 * 
 * NOTE: This file exists only for backward compatibility with code that might
 * still import from it. All real authentication is now handled by supabase-auth.ts.
 */

import { supabase } from './supabase-singleton';

/**
 * Check if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
    return !!data.session;
  } catch (error) {
    console.error('Exception checking auth status:', error);
    return false;
  }
}

/**
 * Check if the current user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session.session) {
      return false;
    }
    
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      return false;
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.user.id)
      .single();
      
    if (profileError || !profile) {
      return false;
    }
    
    return profile.role === 'admin';
  } catch (error) {
    console.error('Exception checking admin status:', error);
    return false;
  }
}

/**
 * Clear all authentication data and sign out
 */
export async function clearAuth(): Promise<void> {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear any local storage items related to auth
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') || 
      key.includes('sb-') || 
      key.includes('auth') || 
      key.includes('token')
    );
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('Authentication cleared successfully');
  } catch (error) {
    console.error('Error clearing authentication:', error);
  }
}

// Backward compatibility exports for code that might import these functions
export const installAuthLockdown = () => console.log('Auth lockdown removed - using standard Supabase authentication');
export const activateAuthLockdown = () => console.log('Auth lockdown removed - using standard Supabase authentication');
export const isLockdownActive = () => false;
export const markJwtError = () => console.log('JWT error detection removed - using standard Supabase authentication');
export const patchTokenRefresh = () => console.log('Token refresh patching removed - using standard Supabase authentication');