import { useCallback } from 'react';
import { Profile } from '@/types/auth';
import { 
  saveUserProfile, 
  fetchUserProfile, 
  checkAdminStatus,
  isCompleteProfile,
  isAdmin as checkIsAdmin,
  dispatchProfileUpdated,
  dispatchAuthError
} from '@/utils/auth';

// Debug logger
const log = (...args: any[]) => console.log('[useUserProfile]', ...args);

interface ProfileResult {
  success: boolean;
  error: Error | null;
  profile?: Profile | null;
}

interface AdminStatusResult {
  success: boolean;
  error: Error | null;
  isAdmin?: boolean;
}

/**
 * Custom hook for user profile operations
 */
export function useUserProfile() {
  /**
   * Fetch a user's profile
   */
  const getUserProfile = useCallback(async (userId: string): Promise<ProfileResult> => {
    try {
      if (!userId) {
        return { success: false, error: new Error('User ID is required'), profile: null };
      }
      
      log('Fetching profile for user', userId);
      const profile = await fetchUserProfile(userId);
      
      if (!profile) {
        return { 
          success: false, 
          error: new Error('Failed to fetch user profile or profile does not exist'),
          profile: null
        };
      }
      
      return { success: true, error: null, profile };
    } catch (err) {
      log('Error fetching user profile:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      dispatchAuthError(error, 'getUserProfile');
      return { success: false, error, profile: null };
    }
  }, []);

  /**
   * Update a user's profile
   */
  const updateProfile = useCallback(async (
    userId: string, 
    profileUpdates: Partial<Profile>
  ): Promise<ProfileResult> => {
    try {
      if (!userId) {
        return { success: false, error: new Error('User ID is required'), profile: null };
      }
      
      log('Updating profile for user', userId, profileUpdates);
      
      // Get current profile first
      const currentProfile = await fetchUserProfile(userId);
      
      // Create the updated profile
      const updatedProfile = {
        ...currentProfile,
        ...profileUpdates,
        updated_at: new Date().toISOString()
      };
      
      // Save the updated profile
      const savedProfile = await saveUserProfile(userId, updatedProfile);
      
      if (!savedProfile) {
        return { 
          success: false, 
          error: new Error('Failed to save user profile updates'),
          profile: null
        };
      }
      
      // Dispatch profile updated event
      dispatchProfileUpdated(userId, savedProfile);
      
      return { success: true, error: null, profile: savedProfile };
    } catch (err) {
      log('Error updating user profile:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      dispatchAuthError(error, 'updateProfile');
      return { success: false, error, profile: null };
    }
  }, []);

  /**
   * Check if a profile meets the required criteria
   */
  const validateProfile = useCallback((profile: Profile | null): boolean => {
    return isCompleteProfile(profile);
  }, []);

  /**
   * Check if a user has admin status
   */
  const checkUserAdminStatus = useCallback(async (userId: string): Promise<AdminStatusResult> => {
    try {
      if (!userId) {
        return { success: false, error: new Error('User ID is required') };
      }
      
      log('Checking admin status for user', userId);
      
      // Get the user profile
      const profile = await fetchUserProfile(userId);
      
      if (!profile) {
        return { 
          success: false, 
          error: new Error('Failed to fetch user profile or profile does not exist')
        };
      }
      
      // Check if user is admin based on profile
      const isAdminFromProfile = checkIsAdmin(profile);
      
      // If already admin in profile, no need to check database
      if (isAdminFromProfile) {
        return { 
          success: true, 
          error: null, 
          isAdmin: true
        };
      }
      
      // Check database for admin status
      const isAdminFromDb = await checkAdminStatus(userId);
      
      return { 
        success: true, 
        error: null, 
        isAdmin: isAdminFromDb
      };
    } catch (err) {
      log('Error checking admin status:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      dispatchAuthError(error, 'checkUserAdminStatus');
      return { success: false, error };
    }
  }, []);

  /**
   * Set user as admin
   */
  const setAsAdmin = useCallback(async (userId: string): Promise<ProfileResult> => {
    try {
      if (!userId) {
        return { success: false, error: new Error('User ID is required'), profile: null };
      }
      
      log('Setting user as admin', userId);
      
      // Get current profile first
      const currentProfile = await fetchUserProfile(userId);
      
      if (!currentProfile) {
        return { 
          success: false, 
          error: new Error('Failed to fetch user profile or profile does not exist'),
          profile: null
        };
      }
      
      // Update profile with admin role
      const updatedProfile = {
        ...currentProfile,
        role: 'admin',
        updated_at: new Date().toISOString()
      };
      
      // Save the updated profile
      const savedProfile = await saveUserProfile(userId, updatedProfile);
      
      if (!savedProfile) {
        return { 
          success: false, 
          error: new Error('Failed to save admin status'),
          profile: null
        };
      }
      
      // Dispatch profile updated event
      dispatchProfileUpdated(userId, savedProfile);
      
      return { success: true, error: null, profile: savedProfile };
    } catch (err) {
      log('Error setting user as admin:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      dispatchAuthError(error, 'setAsAdmin');
      return { success: false, error, profile: null };
    }
  }, []);

  return {
    getUserProfile,
    updateProfile,
    validateProfile,
    checkUserAdminStatus,
    setAsAdmin
  };
} 