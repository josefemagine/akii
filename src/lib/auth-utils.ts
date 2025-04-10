import { User } from '@supabase/supabase-js';
import { Profile, AUTH_ERROR_EVENT, AUTH_RECOVERY_EVENT } from '@/types/auth.ts';
import { supabase } from "./supabase.tsx";

/**
 * Helper function to clear auth state data from storage
 */
export const clearAuthStorage = () => {
  try {
    localStorage.removeItem('auth-state');
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('auth-profile');
    
    // Clear profile cache keys
    const profileKeys = Object.keys(sessionStorage).filter(key => key.startsWith('profile-'));
    profileKeys.forEach(key => sessionStorage.removeItem(key));
    
    console.log('[Auth Utils] Cleared auth storage');
  } catch (e) {
    console.error('[Auth Utils] Error clearing auth storage:', e);
  }
};

/**
 * Create and dispatch an auth error event
 */
export const dispatchAuthError = (error: any, source: string) => {
  console.error(`[Auth Error] ${source}:`, error);
  
  const event = new CustomEvent(AUTH_ERROR_EVENT, {
    detail: {
      error,
      source,
      timestamp: Date.now()
    }
  });
  
  document.dispatchEvent(event);
};

/**
 * Create and dispatch an auth recovery event
 */
export const dispatchAuthRecovery = (data: any) => {
  console.log('[Auth Recovery] Recovery attempt:', data);
  
  const event = new CustomEvent(AUTH_RECOVERY_EVENT, {
    detail: {
      ...data,
      timestamp: Date.now()
    }
  });
  
  document.dispatchEvent(event);
};

/**
 * Check if the user profile is valid and complete
 */
export const isValidProfile = (profile: Profile | null): boolean => {
  if (!profile) return false;
  
  return (
    !!profile.id &&
    !!profile.email &&
    !!profile.role &&
    !!profile.status
  );
};

/**
 * Cache a user profile in session storage with timestamp
 */
export const cacheUserProfile = (userId: string, profile: Profile): void => {
  if (!userId || !profile) return;
  
  try {
    const cacheKey = `profile-${userId}`;
    sessionStorage.setItem(cacheKey, JSON.stringify({
      profile,
      timestamp: Date.now()
    }));
    console.log('[Auth Utils] Cached profile for user:', userId);
  } catch (e) {
    console.error('[Auth Utils] Error caching profile:', e);
  }
};

/**
 * Get a cached user profile from session storage
 */
export const getCachedProfile = (userId: string): Profile | null => {
  if (!userId) return null;
  
  try {
    const cacheKey = `profile-${userId}`;
    const cachedProfileStr = sessionStorage.getItem(cacheKey);
    
    if (cachedProfileStr) {
      const { profile, timestamp } = JSON.parse(cachedProfileStr);
      // Use cache if it's less than 5 minutes old
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return profile;
      }
    }
  } catch (e) {
    console.error('[Auth Utils] Error reading cached profile:', e);
  }
  
  return null;
};

/**
 * Check for admin role in profile
 */
export const hasAdminRole = (profile: Profile | null): boolean => {
  if (!profile) return false;
  
  return profile.role === 'admin';
};

/**
 * Check for developer role in profile
 */
export const hasDeveloperRole = (profile: Profile | null): boolean => {
  if (!profile) return false;
  
  return profile.role === 'developer';
}; 