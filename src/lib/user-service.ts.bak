import supabase from './supabase-client';
import type { UserProfile } from '../types/custom';

// Profile cache to avoid repeated fetches
const profileCache = new Map<string, { profile: UserProfile; timestamp: number }>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getProfileFromCache = (userId: string): UserProfile | null => {
  const cached = profileCache.get(userId);
  if (!cached) return null;
  
  // Check if cache is expired
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    profileCache.delete(userId);
    return null;
  }
  
  return cached.profile;
};

const setProfileInCache = (userId: string, profile: UserProfile): void => {
  profileCache.set(userId, {
    profile,
    timestamp: Date.now(),
  });
};

export const getUserProfile = async (
  userId: string,
  forceRefresh: boolean = false,
): Promise<UserProfile | null> => {
  if (!userId) return null;

  try {
    // Check cache first unless forced refresh
    if (!forceRefresh) {
      const cached = getProfileFromCache(userId);
      if (cached) return cached;
    }

    console.log(`[UserService] Fetching profile for ${userId}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[UserService] Error fetching profile:', error);
      // If we can't fetch the profile and it's for a specific admin, create emergency profile
      if (forceRefresh && (
        userId === "b574f273-e0e1-4cb8-8c98-f5a7569234c8" || // Josef
        userId === "f00ba915-8d5a-44b4-9a52-0f7778241aca"    // Test User
      )) {
        console.warn('[UserService] Creating emergency profile for admin user');
        const emergencyProfile: UserProfile = {
          id: userId,
          email: userId === "b574f273-e0e1-4cb8-8c98-f5a7569234c8" ? "josef@holm.com" : "test@example.com",
          role: 'admin',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          first_name: 'Admin',
          last_name: 'User',
        };
        
        // Cache the emergency profile
        setProfileInCache(userId, emergencyProfile);
        return emergencyProfile;
      }
      return null;
    }

    if (!data) return null;

    // Cache the profile
    setProfileInCache(userId, data);
    return data;
  } catch (err) {
    console.error('[UserService] Exception in getUserProfile:', err);
    return null;
  }
}; 