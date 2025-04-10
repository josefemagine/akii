import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/auth';
import { User, AuthError } from '@supabase/supabase-js';
import { cacheUserProfile } from './profile-cache';
import { dispatchAuthError } from './auth-events';

// Debug logger
const log = (...args: any[]) => console.log('[Auth API]', ...args);

/**
 * Fetch user profile from the database
 */
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  if (!userId) return null;
  
  try {
    log(`Fetching profile for user ${userId}`);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      log('Error fetching profile:', error);
      dispatchAuthError(error, 'fetchUserProfile');
      return null;
    }
    
    if (profile) {
      log('Profile fetched successfully');
      // Cache the profile
      cacheUserProfile(userId, profile);
      return profile;
    }
    
    return null;
  } catch (e) {
    const error = e as Error;
    log('Exception fetching profile:', error);
    dispatchAuthError(error, 'fetchUserProfile');
    return null;
  }
};

/**
 * Create or update a user profile
 */
export const saveUserProfile = async (
  userId: string, 
  profileData: Partial<Profile>
): Promise<Profile | null> => {
  if (!userId) return null;
  
  try {
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (checkError) {
      log('Error checking profile existence:', checkError);
      dispatchAuthError(checkError, 'saveUserProfile:check');
      return null;
    }
    
    // Prepare profile data with timestamps
    const now = new Date().toISOString();
    const profileWithTimestamps = {
      ...profileData,
      updated_at: now,
      // Only set created_at if it's a new profile
      ...(existingProfile ? {} : { created_at: now })
    };
    
    let result;
    
    if (existingProfile) {
      // Update existing profile
      log('Updating existing profile for user', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileWithTimestamps)
        .eq('id', userId)
        .select()
        .single();
      
      result = { data, error };
    } else {
      // Insert new profile
      log('Creating new profile for user', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          ...profileWithTimestamps
        })
        .select()
        .single();
      
      result = { data, error };
    }
    
    if (result.error) {
      log('Error saving profile:', result.error);
      dispatchAuthError(result.error, 'saveUserProfile:save');
      return null;
    }
    
    if (result.data) {
      log('Profile saved successfully');
      // Cache the updated profile
      cacheUserProfile(userId, result.data);
      return result.data;
    }
    
    return null;
  } catch (e) {
    const error = e as Error;
    log('Exception saving profile:', error);
    dispatchAuthError(error, 'saveUserProfile');
    return null;
  }
};

/**
 * Check if a user has admin privileges
 */
export const checkAdminStatus = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    log('Checking admin status for user', userId);
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') { // Not found error is expected
        log('Error checking admin status:', error);
        dispatchAuthError(error, 'checkAdminStatus');
      }
      return false;
    }
    
    log('Admin status check result:', data ? 'Admin' : 'Not admin');
    return !!data;
  } catch (e) {
    const error = e as Error;
    log('Exception checking admin status:', error);
    dispatchAuthError(error, 'checkAdminStatus');
    return false;
  }
};

/**
 * @deprecated Use checkAdminStatus instead. This function will be removed in a future update.
 * Legacy function to check if a user has super admin privileges
 */
export const checkSuperAdminStatus = async (userId: string): Promise<boolean> => {
  console.warn('DEPRECATED: checkSuperAdminStatus is deprecated. Use checkAdminStatus instead.');
  return false;
}; 