/**
 * SUPABASE CLIENT MODULE
 * 
 * This module re-exports the supabase client from the singleton implementation.
 * It provides convenience methods but does NOT create its own client instance.
 */

import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase-singleton";

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
 * Gets the current user from the session
 */
export function getCurrentUser(): User | null {
  return _currentUser;
}

/**
 * Gets the current user profile
 */
export function getCurrentProfile(): UserProfile | null {
  return _currentProfile;
}

/**
 * Signs in a user with email and password using proper REST API auth
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
 * Signs out the current user
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
 * Refreshes the user profile
 */
export async function refreshProfile(updates?: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('Cannot refresh profile: No authenticated user');
      return null;
    }
    
    _currentUser = user;
    
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
        .eq('id', user.id)
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
      .eq('id', user.id)
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
 * Updates the user profile
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

// Re-export the supabase client
export default supabase;
