/**
 * Dashboard profile utility functions
 */
import { User as SupabaseUser } from '@supabase/supabase-js';
import { EnhancedUser, UserDisplayData } from '@/types/dashboard';
import { supabase } from '@/lib/supabase';
import { safeLocalStorage } from '@/lib/browser-check';

/**
 * Extracts display data from user information
 * @param typedUser The enhanced user object
 * @param userProfile The user profile data
 * @returns Object with formatted user display data
 */
export const extractUserDisplayData = (
  typedUser: EnhancedUser | null,
  userProfile: any | null
): UserDisplayData => {
  if (!typedUser) {
    return { isAuthenticated: false };
  }
  
  const result: UserDisplayData = {
    email: typedUser.email,
    isAuthenticated: true,
  };
  
  // Try to get name from profile
  if (userProfile) {
    result.firstName = userProfile.first_name;
    result.lastName = userProfile.last_name;
    result.avatarUrl = userProfile.avatar_url;
  }
  
  // If no profile, try user metadata
  if ((!result.firstName || !result.lastName) && typedUser._rawData?.user_metadata) {
    result.firstName = result.firstName || typedUser._rawData.user_metadata.first_name;
    result.lastName = result.lastName || typedUser._rawData.user_metadata.last_name;
    result.avatarUrl = result.avatarUrl || typedUser._rawData.user_metadata.avatar_url;
  }
  
  // Another fallback for raw_user_meta_data
  if ((!result.firstName || !result.lastName) && typedUser.raw_user_meta_data) {
    result.firstName = result.firstName || typedUser.raw_user_meta_data.first_name;
    result.lastName = result.lastName || typedUser.raw_user_meta_data.last_name;
  }
  
  // Try identity data as last resort
  if ((!result.firstName || !result.lastName) && typedUser.identities && typedUser.identities.length > 0) {
    const identity = typedUser.identities[0];
    
    if (identity.identity_data) {
      const { 
        full_name, 
        name, 
        given_name, 
        family_name 
      } = identity.identity_data;
      
      if (full_name) {
        const nameParts = full_name.split(' ');
        if (!result.firstName && nameParts.length > 0) {
          result.firstName = nameParts[0];
        }
        if (!result.lastName && nameParts.length > 1) {
          result.lastName = nameParts.slice(1).join(' ');
        }
      } else {
        result.firstName = result.firstName || given_name || name;
        result.lastName = result.lastName || family_name;
      }
    }
  }
  
  return result;
};

/**
 * Creates a user profile in the database
 * @param userId User ID to create profile for
 * @param userData User display data to use for profile
 * @returns The created profile or null if failed
 */
export const createUserProfile = async (
  userId: string,
  userData: UserDisplayData
): Promise<any | null> => {
  try {
    const newProfile = {
      id: userId,
      email: userData.email || '',
      first_name: userData.firstName || '',
      last_name: userData.lastName || '',
      avatar_url: userData.avatarUrl || '',
      role: 'user',
      status: 'active',
      created_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }
    
    // Cache profile in localStorage for emergency auth
    try {
      const cacheSuccess = safeLocalStorage.setItem(
        `userProfile_${userId}`, 
        JSON.stringify(data)
      );
      
      if (!cacheSuccess) {
        console.warn('Failed to cache profile data in localStorage');
      }
    } catch (e) {
      console.warn('Error caching profile data:', e);
    }
    
    return data;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return null;
  }
};

/**
 * Fetches a user profile directly from the database
 * @param userId The user ID to fetch the profile for
 * @returns The fetched profile or null if failed
 */
export const fetchUserProfile = async (userId: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile directly:', error);
      return null;
    }
    
    if (data) {
      // Cache profile in localStorage for emergency auth
      try {
        const cacheSuccess = safeLocalStorage.setItem(
          `userProfile_${userId}`, 
          JSON.stringify(data)
        );
        
        if (!cacheSuccess) {
          console.warn('Failed to cache profile data in localStorage');
        }
      } catch (e) {
        console.warn('Error caching profile data:', e);
      }
      
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
}; 