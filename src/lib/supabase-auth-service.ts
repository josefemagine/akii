/**
 * Supabase Authentication Service
 * 
 * This service provides proper auth handling for Supabase using the REST API
 * following Supabase's official recommendations and best practices.
 */

import { supabase } from './supabase-singleton';
import type { User } from '@supabase/supabase-js';
import { getSessionSafely } from '@/lib/auth-lock-fix';

// Standard interface for user profiles
export interface UserProfile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  role?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// Store user and profile in module variables for caching
let _currentUser: User | null = null;
let _currentProfile: UserProfile | null = null;

/**
 * Fetches the current user and profile using the proper Supabase API
 * This function uses the correct Authorization headers and endpoints
 */
export async function getCurrentUserWithProfile(): Promise<{ user: User | null, profile: UserProfile | null }> {
  try {
    // First get the current session - proper way to check auth
    const { data, error: sessionError } = await getSessionSafely();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return { user: null, profile: null };
    }
    
    if (!data.session) {
      console.log('No active session found');
      return { user: null, profile: null };
    }
    
    const user = data.session.user;
    _currentUser = user;
    
    // If we have a user, fetch their profile
    if (user) {
      // Use the correct profile endpoint with proper auth
      const profile = await refreshProfile();
      return { user, profile };
    }
    
    return { user: null, profile: null };
  } catch (error) {
    console.error('Error in getCurrentUserWithProfile:', error);
    return { user: null, profile: null };
  }
}

/**
 * Signs in a user with email and password
 * Uses the proper signInWithPassword method from Supabase
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }
    
    // Cache the user
    _currentUser = data.user;
    
    // Fetch profile after sign in
    if (data.user) {
      await refreshProfile();
    }
    
    return data;
  } catch (err) {
    console.error('Exception in signIn:', err);
    throw err;
  }
}

/**
 * Signs out the current user using the proper endpoint
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    
    // Clear cached user and profile
    _currentUser = null;
    _currentProfile = null;
    
    return true;
  } catch (err) {
    console.error('Exception in signOut:', err);
    throw err;
  }
}

/**
 * Gets the current user properly from the session
 */
export function getCurrentUser(): User | null {
  return _currentUser;
}

/**
 * Gets the current user profile using proper data access
 */
export function getCurrentProfile(): UserProfile | null {
  return _currentProfile;
}

/**
 * Refreshes the user profile
 */
export async function refreshProfile(updates?: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    // Get the current user if not already cached
    if (!_currentUser) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Cannot refresh profile: No authenticated user');
        return null;
      }
      _currentUser = user;
    }
    
    let query = supabase
      .from('profiles')
      .select('*');
    
    if (updates) {
      // If updates provided, update the profile first
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', _currentUser.id)
        .select('*')
        .single();
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        // Continue to try to fetch the profile even if update failed
      } else if (updateData) {
        _currentProfile = updateData as UserProfile;
        return _currentProfile;
      }
    }
    
    // Fetch the profile
    const { data, error } = await query
      .eq('id', _currentUser.id)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    _currentProfile = data as UserProfile;
    return _currentProfile;
  } catch (error) {
    console.error('Exception in refreshProfile:', error);
    return null;
  }
}

/**
 * Updates a user profile using proper data access patterns
 */
export async function updateProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
  return await refreshProfile(updates);
}

/**
 * Sets up a listener for auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Initialize auth service and check for existing session
 */
export async function initializeAuthService() {
  try {
    // Get session to check if user is already logged in
    // Use getSessionSafely to avoid lock issues
    const { data, error } = await getSessionSafely();
    
    if (error) {
      console.error('Error initializing auth service:', error);
      
      // Even if getSession fails, check localStorage for tokens
      if (error.message?.includes('JWT') || error.message?.includes('token')) {
        console.log('JWT validation error detected - checking localStorage for tokens');
        return hasLocalStorageAuth();
      }
      
      return false;
    }
    
    if (data.session) {
      console.log('User already authenticated via Supabase session');
      return true;
    }
    
    // If no session but localStorage has tokens, consider authenticated
    return hasLocalStorageAuth();
  } catch (error) {
    console.error('Exception in initializeAuthService:', error);
    // Even if there's an exception, check localStorage for auth tokens
    return hasLocalStorageAuth();
  }
}

/**
 * Check if there are auth tokens in localStorage
 */
function hasLocalStorageAuth() {
  try {
    // Check all possible auth-related keys in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('supabase.auth.token') || 
        key.includes('sb-') ||
        key.includes('akii-auth') ||
        key === 'akii-auth-token' ||
        key === 'force-auth-login'
      )) {
        console.log('[AuthService] Found auth token in localStorage:', key);
        
        // For enhanced debugging, check what's in the token
        const value = localStorage.getItem(key);
        if (value) {
          try {
            // Try to parse JSON values
            const jsonData = JSON.parse(value);
            if (jsonData) {
              console.log('[AuthService] Auth token contains data with keys:', Object.keys(jsonData));
            }
          } catch (e) {
            // Not JSON, might be a direct token value
            console.log('[AuthService] Auth token is not JSON, length:', value.length);
          }
        }
        
        return true;
      }
    }
    return false;
  } catch (e) {
    console.error('[AuthService] Error checking localStorage auth:', e);
    return false;
  }
}

/**
 * Main export for easy importing
 */
const authService = {
  getCurrentUserWithProfile,
  signIn,
  signOut,
  getCurrentUser,
  getCurrentProfile,
  updateProfile,
  onAuthStateChange,
  initializeAuthService,
  client: supabase
};

export default authService; 