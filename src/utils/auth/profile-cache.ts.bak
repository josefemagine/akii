import { Profile } from "@/types/auth";

// Debug logger
const log = (...args: any[]) => console.log('[Auth]', ...args);

// Create a cache for user profiles to avoid excessive fetching
const profileCache = new Map<string, Profile>();

/**
 * Clear the entire profile cache
 */
export const clearProfileCache = () => {
  profileCache.clear();
  log('Profile cache cleared');
  
  // Also clear session storage cache
  try {
    if (typeof sessionStorage !== 'undefined') {
      const profileKeys = Object.keys(sessionStorage).filter(key => key.startsWith('profile-'));
      profileKeys.forEach(key => sessionStorage.removeItem(key));
      log(`Cleared ${profileKeys.length} cached profiles from session storage`);
    }
  } catch (e) {
    console.error('Error clearing profile cache from session storage:', e);
  }
};

/**
 * Clear a specific user's cached profile
 */
export const clearCachedUserProfile = (userId: string) => {
  if (userId && profileCache.has(userId)) {
    profileCache.delete(userId);
    log(`Cleared cached profile for user ${userId}`);
    
    // Also clear from session storage
    try {
      if (typeof sessionStorage !== 'undefined') {
        const cacheKey = `profile-${userId}`;
        sessionStorage.removeItem(cacheKey);
      }
    } catch (e) {
      console.error('Error clearing cached profile from session storage:', e);
    }
  }
};

/**
 * Cache a user profile in memory and session storage
 */
export const cacheUserProfile = (userId: string, profile: Profile): void => {
  if (!userId || !profile) return;
  
  // Add to in-memory cache
  profileCache.set(userId, profile);
  
  // Also cache in session storage for persistence between page refreshes
  try {
    if (typeof sessionStorage !== 'undefined') {
      const cacheKey = `profile-${userId}`;
      sessionStorage.setItem(cacheKey, JSON.stringify({
        profile,
        timestamp: Date.now()
      }));
    }
  } catch (e) {
    console.error('Error caching profile:', e);
  }
};

/**
 * Get a cached user profile from memory or session storage
 */
export const getCachedUserProfile = (userId: string): Profile | null => {
  if (!userId) return null;
  
  // First check in-memory cache (fastest)
  if (profileCache.has(userId)) {
    return profileCache.get(userId) || null;
  }
  
  // Then check session storage (persists between page refreshes)
  try {
    if (typeof sessionStorage !== 'undefined') {
      const cacheKey = `profile-${userId}`;
      const cachedProfileStr = sessionStorage.getItem(cacheKey);
      if (cachedProfileStr) {
        const { profile, timestamp } = JSON.parse(cachedProfileStr);
        // Use cache if it's less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          // Also update the in-memory cache
          profileCache.set(userId, profile);
          return profile;
        }
      }
    }
  } catch (e) {
    console.error('Error reading cached profile:', e);
  }
  return null;
}; 