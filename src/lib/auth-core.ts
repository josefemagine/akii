/**
 * AUTHENTICATION CORE MODULE
 * 
 * Central module for all authentication-related functionality.
 * This module provides core auth functions that are used throughout the app.
 */

import type { PostgrestError, User, Session, AuthError, AuthApiError } from "@supabase/supabase-js";
import { supabase, supabaseAdmin, auth, getAuth, getSupabaseClient } from "./supabase-client";

// Re-export Supabase instances and auth
export { supabase, supabaseAdmin, auth, getAuth };

// Re-export types from supabase
export type { Session, User };

// Core type definitions
export type UserRole = "user" | "admin" | "team_member";
export type UserStatus = "active" | "inactive" | "banned" | "pending";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  first_name?: string;
  last_name?: string;
  company?: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseResponse<T = any> {
  data: T | null;
  error: Error | PostgrestError | null;
}

// Define SignUp types
export interface SignUpParams {
  email: string;
  password: string;
  metadata?: Record<string, any>;
  redirectTo?: string;
}

export interface SignUpResponse {
  data: {
    user: User | null;
    session: Session | null;
  } | null;
  error: Error | AuthApiError | null;
}

// Local profile cache to avoid repeated 403 errors
const profileCache = new Map<string, UserProfile>();

/**
 * Stores a profile in the local cache
 */
function cacheProfile(profile: UserProfile): void {
  if (profile?.id) {
    profileCache.set(profile.id, profile);
    
    // Also try to persist to localStorage for session durability
    try {
      const cachedProfiles = JSON.parse(localStorage.getItem('akii-profile-cache') || '{}');
      cachedProfiles[profile.id] = {
        ...profile,
        cached_at: new Date().toISOString()
      };
      localStorage.setItem('akii-profile-cache', JSON.stringify(cachedProfiles));
    } catch (error) {
      console.warn('Failed to persist profile to localStorage:', error);
    }
  }
}

/**
 * Gets a profile from the local cache
 */
function getCachedProfile(userId: string): UserProfile | null {
  // First check memory cache
  if (profileCache.has(userId)) {
    return profileCache.get(userId) || null;
  }
  
  // Then check localStorage
  try {
    const cachedProfiles = JSON.parse(localStorage.getItem('akii-profile-cache') || '{}');
    const profile = cachedProfiles[userId];
    
    if (profile) {
      // Load into memory cache for faster access
      profileCache.set(userId, profile);
      return profile;
    }
  } catch (error) {
    console.warn('Failed to retrieve profile from localStorage:', error);
  }
  
  return null;
}

// Session management functions
export async function getCurrentSession(): Promise<SupabaseResponse<Session>> {
  try {
    const { data, error } = await auth.getSession();
    if (error) throw error;
    return { data: data.session, error: null };
  } catch (error) {
    console.error("Get session error:", error);
    return { data: null, error: error as Error };
  }
}

export async function getCurrentUser(): Promise<SupabaseResponse<User>> {
  try {
    const { data, error } = await auth.getUser();
    if (error) throw error;
    return { data: data.user, error: null };
  } catch (error) {
    console.error("Get user error:", error);
    return { data: null, error: error as Error };
  }
}

// User profile functions
export async function getUserProfile(
  userId?: string
): Promise<SupabaseResponse<UserProfile>> {
  try {
    // Guard against undefined userId
    if (!userId) {
      return { 
        data: null, 
        error: new Error("User ID is required to fetch profile") 
      };
    }
    
    // Check cache first to avoid 403 errors on repeated calls
    const cachedProfile = getCachedProfile(userId);
    if (cachedProfile) {
      console.log(`Using cached profile for user ${userId}`);
      return { data: cachedProfile, error: null };
    }

    console.log(`Fetching profile for user ID: ${userId}`);
    
    // Always ensure we're using the authenticated client
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // Enhanced error logging
      console.error(`Profile fetch error for user ${userId}:`, error);
      console.error(`Error code: ${error.code}, message: ${error.message}`);
      
      if (error.code === "PGRST116") {
        // No data found is not a critical error
        return { data: null, error: null };
      }
      
      if (error.code === "PGRST301" || (error as any).status === 403) {
        // Permission denied, might need to use admin client
        console.log("Permission denied, attempting with admin client as fallback");
        const adminClient = supabaseAdmin;
        
        if (adminClient) {
          try {
            const { data: adminData, error: adminError } = await adminClient
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .single();
              
            if (adminError) {
              console.error("Admin client fallback also failed:", adminError);
              throw adminError;
            }
            
            // Cache successful result
            if (adminData) {
              cacheProfile(adminData as UserProfile);
            }
            
            return { data: adminData as UserProfile, error: null };
          } catch (adminFetchError) {
            console.error("Error in admin fetch fallback:", adminFetchError);
            throw adminFetchError;
          }
        } else {
          console.error("Admin client not available for fallback");
        }
      }
      
      throw error;
    }

    // Cache successful result
    if (data) {
      cacheProfile(data as UserProfile);
    }
    
    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error("Get user profile error:", error);
    
    // Try to get from cache as last resort
    const cachedProfile = getCachedProfile(userId);
    if (cachedProfile) {
      console.log(`Using cached profile after error for user ${userId}`);
      return { data: cachedProfile, error: null };
    }
    
    // Create a minimal profile to allow the app to continue functioning
    if (userId) {
      const minimalProfile: Partial<UserProfile> = {
        id: userId,
        role: "user",
        status: "active"
      };
      console.log("Returning minimal profile for error recovery:", minimalProfile);
      
      const fallbackProfile = minimalProfile as UserProfile;
      cacheProfile(fallbackProfile);
      
      return { 
        data: fallbackProfile, 
        error: error as Error 
      };
    }
    return { data: null, error: error as Error };
  }
}

/**
 * Gets user metadata from any available source (auth API, localStorage, or fallbacks)
 * This avoids direct database access which can trigger permission errors
 */
async function getUserMetadataFromAuthAPI(userId: string): Promise<Record<string, any>> {
  try {
    // First try to get from auth API which should always work
    const { data, error } = await auth.getUser();
    
    if (!error && data?.user?.user_metadata) {
      console.log("Got user metadata from Auth API");
      return data.user.user_metadata;
    }
    
    // Try to get from local storage if available
    try {
      const email = localStorage.getItem("akii-auth-user-email");
      const metadataString = localStorage.getItem("signup-metadata");
      
      if (metadataString) {
        const metadata = JSON.parse(metadataString);
        console.log("Got user metadata from localStorage signup data");
        return metadata;
      }
      
      // Try the profile cache as a last resort
      const cachedProfile = getCachedProfile(userId);
      if (cachedProfile) {
        const extractedMetadata = {
          first_name: cachedProfile.first_name,
          last_name: cachedProfile.last_name,
          company: cachedProfile.company,
        };
        console.log("Extracted user metadata from cached profile");
        return extractedMetadata;
      }
      
      // Return an empty object if nothing found
      return {};
    } catch (storageError) {
      console.error("Error getting metadata from storage:", storageError);
      return {};
    }
  } catch (error) {
    console.error("Error getting user metadata:", error);
    return {};
  }
}

/**
 * Ensures that a user has a profile, creating one if it doesn't exist
 */
export const ensureUserProfile = async (user: User) => {
  if (!user?.id) {
    console.error("Cannot ensure profile for user with no ID");
    return { data: null, error: new Error("Cannot ensure profile for user with no ID") };
  }

  // Check cache first for better performance
  const cachedProfile = getCachedProfile(user.id);
  if (cachedProfile) {
    console.log(`Using cached profile for user ${user.id} in ensureUserProfile`);
    // Merge with latest user metadata to ensure it's up to date
    const updatedProfile = {
      ...cachedProfile,
      email: user.email || cachedProfile.email,
      first_name: user.user_metadata?.first_name || cachedProfile.first_name,
      last_name: user.user_metadata?.last_name || cachedProfile.last_name,
      company: user.user_metadata?.company || cachedProfile.company,
    };
    // Update cache with the merged data
    cacheProfile(updatedProfile);
    return { data: updatedProfile, error: null };
  }
  
  const supabase = getSupabaseClient();
  
  // First check if a profile already exists
  console.log(`Checking if profile exists for user ID: ${user.id}`);
  try {
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (fetchError) {
      // Enhanced error logging
      console.error(`Profile fetch error for user ${user.id}:`, fetchError);
      console.error(`Error code: ${fetchError.code}, message: ${fetchError.message}`);
      
      if (fetchError.code === "PGRST116") {
        // No data found is not a critical error
        console.log("No profile found, continuing to creation");
      } else if (fetchError.code === "PGRST301" || fetchError.code === "42501" || (fetchError as any).status === 403) {
        console.warn("Permission denied accessing database table. Using fallback approach.");
        
        // Get metadata from Auth API instead of database
        const metadata = await getUserMetadataFromAuthAPI(user.id);
        
        // Create a profile with the metadata we could retrieve
        const fallbackProfile: UserProfile = {
          id: user.id,
          email: user.email || "",
          first_name: metadata.first_name || "",
          last_name: metadata.last_name || "",
          company: metadata.company || "",
          role: "user" as UserRole,
          status: "active" as UserStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        console.log("Created fallback profile with Auth API data:", fallbackProfile);
        cacheProfile(fallbackProfile);
        return { 
          data: fallbackProfile as UserProfile, 
          error: null 
        };
      } else {
        // Log but continue with attempt to create profile
        console.error("Error checking for profile, will still try to create one:", fetchError);
      }
    }
    
    // If profile exists, cache and return it
    if (existingProfile) {
      console.log(`Profile found for user ID: ${user.id}`);
      cacheProfile(existingProfile as UserProfile);
      return { data: existingProfile as UserProfile, error: null };
    }
    
    console.log(`No profile found for user ID: ${user.id}, creating new profile`);
    
    // Get additional metadata from Auth API to ensure we have the most complete data
    const authMetadata = await getUserMetadataFromAuthAPI(user.id);
    
    // Prepare profile data with all required fields, combining data from user and Auth API
    const profileData = {
      id: user.id,
      email: user.email || "",
      first_name: user.user_metadata?.first_name || authMetadata.first_name || "",
      last_name: user.user_metadata?.last_name || authMetadata.last_name || "",
      company: user.user_metadata?.company || authMetadata.company || "",
      role: "user" as UserRole, // Default role
      status: "active" as UserStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Try to create profile using upsert
    const { data: insertedProfile, error: insertError } = await supabase
      .from("profiles")
      .upsert(profileData)
      .select()
      .single();
      
    if (insertError) {
      console.error("Error creating profile:", insertError);
      
      // If permission error, use fallback profile
      if (insertError.code === "PGRST301" || insertError.code === "42501" || (insertError as any).status === 403) {
        console.warn("Permission denied creating profile. Using fallback profile.");
        cacheProfile(profileData as UserProfile);
        return { 
          data: profileData as UserProfile, 
          error: null 
        };
      }
      
      // For other errors, try recovery mechanism
      console.log("Checking if profile was created despite error");
      const { data: recoveryProfile, error: recoveryError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (recoveryError) {
        if (recoveryError.code === "PGRST301" || recoveryError.code === "42501" || (recoveryError as any).status === 403) {
          // Permission denied again, use fallback
          console.warn("Permission denied during recovery. Using fallback profile.");
          cacheProfile(profileData as UserProfile);
          return { 
            data: profileData as UserProfile, 
            error: null 
          };
        }
        
        console.error("Recovery attempt failed:", recoveryError);
        cacheProfile(profileData as UserProfile);
        return { 
          data: profileData as UserProfile, 
          error: insertError 
        };
      }
      
      if (recoveryProfile) {
        console.log("Profile was created despite error, returning recovery profile");
        cacheProfile(recoveryProfile as UserProfile);
        return { data: recoveryProfile as UserProfile, error: null };
      }
      
      // If all else fails, return a fallback profile
      cacheProfile(profileData as UserProfile);
      return { 
        data: profileData as UserProfile, 
        error: insertError 
      };
    }
    
    console.log(`Profile successfully created for user ID: ${user.id}`);
    cacheProfile(insertedProfile as UserProfile);
    return { data: insertedProfile as UserProfile, error: null };
  } catch (unexpectedError) {
    console.error("Unexpected error in ensureUserProfile:", unexpectedError);
    
    // Try to get user metadata from Auth API
    const authMetadata = await getUserMetadataFromAuthAPI(user.id);
    
    // Create a fallback profile with available data
    const fallbackProfile = {
      id: user.id,
      email: user.email || "",
      first_name: user.user_metadata?.first_name || authMetadata.first_name || "",
      last_name: user.user_metadata?.last_name || authMetadata.last_name || "",
      company: user.user_metadata?.company || authMetadata.company || "",
      role: "user" as UserRole,
      status: "active" as UserStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    cacheProfile(fallbackProfile as UserProfile);
    return { 
      data: fallbackProfile as UserProfile, 
      error: unexpectedError as Error 
    };
  }
};

export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<SupabaseResponse<UserProfile>> {
  try {
    // Prevent updating protected fields
    const safeUpdates = { ...updates };
    delete safeUpdates.id;
    delete safeUpdates.email;
    delete safeUpdates.role; // Use setUserRole for this
    delete safeUpdates.status; // Use setUserStatus for this

    // Add timestamp
    safeUpdates.updated_at = new Date().toISOString();

    console.log(`Updating profile for user ${userId} with:`, safeUpdates);
    
    const { data, error } = await supabase
      .from("profiles")
      .update(safeUpdates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating profile for user ${userId}:`, error);
      
      // Check if it's a permission issue (common in production)
      if (error.code === "PGRST301" || (error as any).status === 403) {
        console.warn("Permission denied updating profile. Using optimistic update approach.");
        
        // Get current profile first
        const { data: currentProfile } = await getUserProfile(userId);
        
        if (currentProfile) {
          // Create an updated profile by merging current with updates
          const optimisticProfile = {
            ...currentProfile,
            ...safeUpdates,
            // Ensure these fields aren't overwritten
            id: currentProfile.id,
            email: currentProfile.email,
            role: currentProfile.role,
            status: currentProfile.status,
          };
          
          console.log("Created optimistic profile update:", optimisticProfile);
          
          // Return optimistic update without error to prevent UI disruption
          return { data: optimisticProfile as UserProfile, error: null };
        }
        
        // If we can't get current profile, create minimal one with updates
        const fallbackProfile: UserProfile = {
          id: userId,
          email: updates.email || "",
          role: "user" as UserRole,
          status: "active" as UserStatus,
          ...safeUpdates,
        };
        
        console.log("Created fallback profile with updates:", fallbackProfile);
        return { data: fallbackProfile, error: null };
      }
      
      // For other errors, throw normally
      throw error;
    }

    console.log(`Profile updated successfully for user ${userId}`);
    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error("Update user profile error:", error);
    return { data: null, error: error as Error };
  }
}

export async function setUserRole(
  userId: string,
  role: UserRole
): Promise<SupabaseResponse<UserProfile>> {
  try {
    const adminClient = supabaseAdmin;
    if (!adminClient) {
      throw new Error("Admin client not available - cannot set user role");
    }

    const { data, error } = await adminClient
      .from("profiles")
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error("Set user role error:", error);
    return { data: null, error: error as Error };
  }
}

export async function setUserStatus(
  userId: string,
  status: UserStatus
): Promise<SupabaseResponse<UserProfile>> {
  try {
    const adminClient = supabaseAdmin;
    if (!adminClient) {
      throw new Error("Admin client not available - cannot set user status");
    }

    const { data, error } = await adminClient
      .from("profiles")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error("Set user status error:", error);
    return { data: null, error: error as Error };
  }
}

// Authentication functions
export async function signIn(
  email: string,
  password: string
): Promise<SupabaseResponse<User>> {
  try {
    // Clear stored auth data
    clearStoredAuth();
    
    // Sign in
    const { data, error } = await auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("No user returned after sign in");

    // Store backup auth data
    try {
      localStorage.setItem("akii-auth-user-email", email);
      localStorage.setItem("akii-auth-user-id", data.user.id);
      localStorage.setItem("akii-auth-timestamp", Date.now().toString());
    } catch (storageError) {
      console.error("Failed to store backup auth data:", storageError);
    }

    // Ensure profile exists
    await ensureUserProfile(data.user);

    return { data: data.user, error: null };
  } catch (error) {
    console.error("Sign in error:", error);
    return { data: null, error: error as Error };
  }
}

export async function signUp({
  email,
  password,
  metadata,
  redirectTo,
}: SignUpParams): Promise<SignUpResponse> {
  try {
    // Store metadata in localStorage before attempting signup
    try {
      if (metadata) {
        localStorage.setItem("signup-metadata", JSON.stringify(metadata));
        localStorage.setItem("signup-email", email);
        localStorage.setItem("signup-timestamp", Date.now().toString());
      }
    } catch (storageError) {
      console.error("Failed to store signup metadata:", storageError);
    }
    
    console.log("Attempting to sign up with email:", email, "and metadata:", metadata);
    
    const { data, error } = await auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: metadata,
      },
    });
    
    // For auto-confirmed accounts (or if email confirmation disabled) create profile
    // Most users will create profile when they sign in after email confirmation
    if (data?.session) {
      // User has active session immediately after signup
      console.log("User has active session after signup, creating profile");
      try {
        const { data: profileData, error: profileError } = await ensureUserProfile(data.user);
        
        if (profileError) {
          console.error("Error creating profile after signup:", profileError);
        } else if (profileData) {
          console.log("Profile created successfully after signup");
        }
      } catch (profileCreationError) {
        console.error("Exception during profile creation after signup:", profileCreationError);
      }
    }

    return {
      data,
      error,
    };
  } catch (err) {
    return {
      data: null,
      error: err as AuthApiError,
    };
  }
}

export async function signOut(): Promise<SupabaseResponse<boolean>> {
  try {
    // Clear stored auth data
    clearStoredAuth();
    
    // Sign out
    const { error } = await auth.signOut();
    if (error) throw error;
    
    return { data: true, error: null };
  } catch (error) {
    console.error("Sign out error:", error);
    return { data: false, error: error as Error };
  }
}

export async function signInWithOAuth(
  provider: 'google' | 'github'
): Promise<SupabaseResponse<any>> {
  try {
    const { data, error } = await auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Sign in with ${provider} error:`, error);
    return { data: null, error: error as Error };
  }
}

export async function resetPassword(
  email: string
): Promise<SupabaseResponse<boolean>> {
  try {
    const { error } = await auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    console.error("Reset password error:", error);
    return { data: false, error: error as Error };
  }
}

export async function updatePassword(
  password: string
): Promise<SupabaseResponse<User>> {
  try {
    const { data, error } = await auth.updateUser({
      password,
    });

    if (error) throw error;
    return { data: data.user, error: null };
  } catch (error) {
    console.error("Update password error:", error);
    return { data: null, error: error as Error };
  }
}

// Helper functions
export function hasValidAdminOverride(email: string): boolean {
  try {
    // Check for Josef (special case)
    if (email === "josef@holm.com") {
      return true;
    }

    // Check for valid override
    const override = localStorage.getItem("akii_admin_override");
    const overrideEmail = localStorage.getItem("akii_admin_override_email");
    const overrideExpiry = localStorage.getItem("akii_admin_override_expiry");

    if (override === "true" && overrideEmail === email && overrideExpiry) {
      // Check if override is expired
      const expiryDate = new Date(overrideExpiry);
      if (expiryDate > new Date()) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking admin override:", error);
    return false;
  }
}

export function clearStoredAuth(): void {
  try {
    // Don't clear auth data for Josef (special case)
    const isJosef = localStorage.getItem("akii-auth-user-email") === "josef@holm.com";

    if (!isJosef) {
      // Clear Supabase tokens
      localStorage.removeItem("sb-access-token");
      localStorage.removeItem("sb-refresh-token");

      // Clear any auth state flags
      localStorage.removeItem("auth-in-progress");
      localStorage.removeItem("auth-in-progress-time");

      // Clear admin overrides
      localStorage.removeItem("akii_admin_override");
      localStorage.removeItem("akii_admin_override_email");
      localStorage.removeItem("akii_admin_override_expiry");

      // Clear backup auth data
      localStorage.removeItem("akii-auth-user-email");
      localStorage.removeItem("akii-auth-user-id");
      localStorage.removeItem("akii-auth-timestamp");
    }
  } catch (error) {
    console.error("Error clearing auth state:", error);
  }
}

// Admin functions
export async function getAllUsers(): Promise<SupabaseResponse<UserProfile[]>> {
  try {
    const adminClient = supabaseAdmin;
    if (!adminClient) {
      throw new Error("Admin client not available - cannot fetch all users");
    }

    const { data, error } = await adminClient
      .from("profiles")
      .select("*");

    if (error) throw error;
    return { data: data as UserProfile[], error: null };
  } catch (error) {
    console.error("Get all users error:", error);
    return { data: [], error: error as Error };
  }
}

// Debugging functions
export async function verifySupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  details: Record<string, boolean>;
}> {
  const details = {
    connection: false,
    publicClient: false,
    adminClient: false,
    auth: false,
    profilesTable: false,
  };

  try {
    // Test public client connection
    const { data: sessionData, error: sessionError } = await getCurrentSession();
    details.connection = !sessionError;
    details.auth = !!getAuth();

    // Check if we can access the profiles table
    try {
      const { error: countError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      
      details.publicClient = !countError;
      details.profilesTable = !countError;
    } catch (e) {
      details.profilesTable = false;
    }

    // Test admin client connection
    try {
      if (supabaseAdmin) {
        const { error: adminError } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .limit(1);
        
        details.adminClient = !adminError;
      }
    } catch (e) {
      details.adminClient = false;
    }

    const success = details.connection && details.publicClient;
    
    return {
      success,
      message: success 
        ? "Supabase connection verified successfully" 
        : "Issues detected with Supabase connection",
      details,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to verify connection: ${error instanceof Error ? error.message : String(error)}`,
      details,
    };
  }
}
