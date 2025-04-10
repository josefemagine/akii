import { Profile, AuthContextType } from "@/types/auth.ts";
import { cacheUserProfile } from "./profile-cache.ts";
import { dispatchProfileUpdated } from "./auth-events.ts";

// Debug logger
const log = (...args: any[]) => console.log('[Profile Utils]', ...args);

/**
 * Extended Profile type with additional properties 
 * that might be used in different parts of the app
 */
interface ExtendedProfile extends Profile {
  avatar_url?: string;
  bio?: string;
  company?: string;
  company_name?: string;
  display_name?: string;
  full_name?: string;
  is_admin?: boolean;
  is_team_owner?: boolean;
  team_id?: string;
  onboarding_completed?: boolean;
  // Add other potential properties here
}

/**
 * Check if a profile is complete with all required fields
 */
export const isCompleteProfile = (profile: Profile | null): boolean => {
  if (!profile) return false;
  
  const extProfile = profile as ExtendedProfile;
  
  // Check for required fields
  return !!(
    profile.id &&
    profile.email &&
    (extProfile.full_name || (profile.first_name && profile.last_name)) &&
    profile.avatar_url
  );
};

/**
 * Check if a user is a team owner
 */
export const isTeamOwner = (profile: Profile | null): boolean => {
  if (!profile) return false;
  
  // Check is_team_owner property if it exists
  if ('is_team_owner' in profile && (profile as any).is_team_owner === true) {
    return true;
  }
  
  return profile.role === 'team_owner';
};

/**
 * Check if a user is an admin
 */
export const isAdmin = (profile: Profile | null): boolean => {
  if (!profile) return false;
  
  // Check role field
  if (profile.role === 'admin') {
    return true;
  }
  
  // Check is_admin property if it exists
  if ('is_admin' in profile && (profile as any).is_admin === true) {
    return true;
  }
  
  return false;
};

/**
 * Get a default avatar URL based on user's name or email
 */
export const getDefaultAvatarUrl = (profile: Partial<Profile>): string => {
  const extProfile = profile as Partial<ExtendedProfile>;
  
  // Try getting name from various properties
  let name = extProfile.full_name || '';
  
  if (!name && profile.first_name) {
    name = `${profile.first_name} ${profile.last_name || ''}`.trim();
  }
  
  if (!name && profile.display_name) {
    name = profile.display_name;
  }
  
  if (!name && profile.email) {
    name = profile.email;
  }
  
  if (!name) {
    name = 'User';
  }
  
  // Use a placeholder avatar service
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
};

/**
 * Update a user profile and handle caching and events
 */
export const updateUserProfile = async (
  auth: AuthContextType,
  userId: string,
  profileData: Partial<Profile>
): Promise<Profile | null> => {
  try {
    // Get the current profile through auth context's refreshProfile method
    const existingProfile = await auth.refreshProfile();
    
    if (!existingProfile) {
      throw new Error('No existing profile found');
    }
    
    // Handle partial updates to avoid overwriting existing data
    const updatedProfile = {
      ...existingProfile,
      ...profileData,
      updated_at: new Date().toISOString()
    };
    
    // Save using the built-in update method
    const success = await auth.updateProfile(updatedProfile);
    
    if (success) {
      // The profile will be automatically cached by the auth context
      
      // Dispatch event
      dispatchProfileUpdated(userId, updatedProfile);
      
      log('Profile updated successfully', updatedProfile);
      return updatedProfile;
    }
    
    throw new Error('Failed to save profile');
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

/**
 * Format user display name based on profile information
 */
export const formatUserDisplayName = (profile: Profile | null): string => {
  if (!profile) return 'Guest';
  
  const extProfile = profile as ExtendedProfile;
  
  if (extProfile.full_name) {
    return extProfile.full_name;
  }
  
  if (profile.display_name) {
    return profile.display_name;
  }
  
  if (profile.first_name) {
    return `${profile.first_name} ${profile.last_name || ''}`.trim();
  }
  
  if (profile.email) {
    // Use email without domain as display name
    return profile.email.split('@')[0];
  }
  
  return 'User';
};

/**
 * Check if a profile has completed onboarding
 */
export const hasCompletedOnboarding = (profile: Profile | null): boolean => {
  if (!profile) return false;
  
  const extProfile = profile as ExtendedProfile;
  return !!extProfile.onboarding_completed;
};

/**
 * Get user's team ID
 */
export const getUserTeamId = (profile: Profile | null): string | null => {
  if (!profile) return null;
  
  const extProfile = profile as ExtendedProfile;
  return extProfile.team_id || null;
}; 