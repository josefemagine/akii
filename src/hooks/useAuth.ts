import { useMemo } from 'react';
import { Profile } from '@/types/auth';
import { useAuthState } from './useAuthState';
import { useAuthActions } from './useAuthActions';
import { useUserProfile } from './useUserProfile';
import { isAdmin, isSuperAdmin, isTeamOwner } from '@/utils/auth';

// Debug logger
const log = (...args: any[]) => console.log('[useAuth]', ...args);

/**
 * Main auth hook that combines auth state, actions, and profile management
 * This is the primary hook that should be used throughout the application
 */
export function useAuth() {
  // Get auth state
  const { 
    user, 
    session, 
    profile, 
    loading, 
    error,
    hasUser,
    hasProfile
  } = useAuthState();
  
  // Get auth actions
  const { 
    signIn, 
    signUp, 
    signOut, 
    resetPassword, 
    updatePassword 
  } = useAuthActions();
  
  // Get profile operations
  const { 
    getUserProfile, 
    updateProfile, 
    validateProfile,
    checkUserAdminStatus,
    setAsAdmin
  } = useUserProfile();
  
  // Computed values that depend on profile
  const isUserAdmin = useMemo(() => isAdmin(profile), [profile]);
  const isUserSuperAdmin = useMemo(() => isSuperAdmin(profile), [profile]);
  const isUserTeamOwner = useMemo(() => isTeamOwner(profile), [profile]);
  
  // Combined loading/error state
  const isLoading = loading;
  const authError = error;
  
  // Refreshing user profile
  const refreshProfile = async (): Promise<Profile | null> => {
    if (!user?.id) return null;
    
    log('Refreshing profile for user', user.id);
    const { success, profile: freshProfile } = await getUserProfile(user.id);
    
    return success && freshProfile ? freshProfile : null;
  };
  
  // Update current user's profile
  const updateCurrentProfile = async (updates: Partial<Profile>): Promise<boolean> => {
    if (!user?.id) return false;
    
    log('Updating current user profile', updates);
    const { success } = await updateProfile(user.id, updates);
    
    return success;
  };
  
  // Check admin status for current user
  const checkCurrentAdminStatus = async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    log('Checking admin status for current user');
    const { success, isAdmin = false } = await checkUserAdminStatus(user.id);
    
    return success && isAdmin;
  };
  
  // Set current user as admin
  const setCurrentUserAsAdmin = async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    log('Setting current user as admin');
    const { success } = await setAsAdmin(user.id);
    
    return success;
  };
  
  return {
    // Auth state
    user,
    session,
    profile,
    hasUser,
    hasProfile,
    isLoading,
    authError,
    
    // Auth actions
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    
    // Profile operations
    refreshProfile,
    updateProfile: updateCurrentProfile,
    isValidProfile: validateProfile,
    
    // Admin/permissions
    isAdmin: isUserAdmin,
    isSuperAdmin: isUserSuperAdmin,
    isTeamOwner: isUserTeamOwner,
    checkAdminStatus: checkCurrentAdminStatus,
    setUserAsAdmin: setCurrentUserAsAdmin
  };
} 