/**
 * Authentication recovery utilities
 */
import { supabase } from '@/lib/supabase';
import { safeLocalStorage } from '@/lib/browser-check';
import { EnhancedUser } from '@/types/dashboard';

/**
 * Try to recover authentication from localStorage if session is missing
 * @returns The recovered user or null if recovery failed
 */
export const recoverAuthFromLocalStorage = async (): Promise<{
  user: EnhancedUser | null;
  profile: any | null;
}> => {
  try {
    console.log('Attempting auth recovery...');
    
    // Check if we have auth data in localStorage
    const localAuthData = safeLocalStorage.getItem('supabase.auth.token');
    
    if (!localAuthData) {
      console.warn('No local auth data found');
      return { user: null, profile: null };
    }
    
    try {
      // Parse auth data
      const parsedAuthData = JSON.parse(localAuthData);
      
      if (
        !parsedAuthData || 
        !parsedAuthData.currentSession || 
        !parsedAuthData.currentSession.access_token
      ) {
        console.warn('Invalid auth data structure');
        return { user: null, profile: null };
      }
      
      // We have valid auth data - try to set the session
      const { data, error } = await supabase.auth.setSession({
        access_token: parsedAuthData.currentSession.access_token,
        refresh_token: parsedAuthData.currentSession.refresh_token,
      });
      
      if (error) {
        console.error('Error recovering session:', error);
        return { user: null, profile: null };
      }
      
      if (data.session) {
        console.log('Successfully recovered session');
        const user = data.session.user as EnhancedUser;
        
        // Check if user profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        return { user, profile };
      }
    } catch (parseError) {
      console.error('Error parsing local auth data:', parseError);
    }
    
    return { user: null, profile: null };
  } catch (error) {
    console.error('Error in recoverAuthFromLocalStorage:', error);
    return { user: null, profile: null };
  }
};

/**
 * Check if there's auth data in localStorage and return the user
 * @returns The user data from localStorage or null
 */
export const checkLocalStorageAuth = (): {
  user: EnhancedUser | null;
  profile: any | null;
} => {
  try {
    const localAuthData = safeLocalStorage.getItem('supabase.auth.token');
    if (!localAuthData) return { user: null, profile: null };
    
    const parsedAuthData = JSON.parse(localAuthData);
    if (
      !parsedAuthData || 
      !parsedAuthData.currentSession || 
      !parsedAuthData.currentSession.access_token
    ) {
      return { user: null, profile: null };
    }
    
    // We have valid auth data
    const userData = parsedAuthData.currentSession.user;
    
    // Get profile data from localStorage as fallback
    let profileData = null;
    try {
      const localProfileData = safeLocalStorage.getItem(`userProfile_${userData.id}`);
      if (localProfileData) {
        profileData = JSON.parse(localProfileData);
      }
    } catch (e) {
      console.warn('Error parsing local profile data:', e);
    }
    
    return { 
      user: userData as EnhancedUser,
      profile: profileData
    };
  } catch (error) {
    console.error('Error in checkLocalStorageAuth:', error);
    return { user: null, profile: null };
  }
};

/**
 * Clear all authentication data from storage
 */
export const clearAuthStorage = (): boolean => {
  try {
    let success = true;
    
    // Clear local storage data
    try {
      const localRemoved = safeLocalStorage.removeItem('supabase.auth.token');
      if (!localRemoved) {
        console.warn('Failed to remove auth token from localStorage');
        success = false;
      }
    } catch (e) {
      console.warn('Error clearing localStorage auth data:', e);
      success = false;
    }
    
    // Get sessionStorage if available and remove the item
    try {
      const sessionStorage = window.sessionStorage;
      if (sessionStorage) {
        try {
          sessionStorage.removeItem('supabase.auth.token');
        } catch (e) {
          console.warn('Error clearing sessionStorage auth data:', e);
          success = false;
        }
      }
    } catch (e) {
      console.warn('Error accessing sessionStorage:', e);
      success = false;
    }
    
    return success;
  } catch (e) {
    console.warn('Error in clearAuthStorage:', e);
    return false;
  }
}; 