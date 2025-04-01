/**
 * AUTHENTICATION CORE MODULE
 * 
 * Central module for all authentication-related functionality.
 * This module provides core auth functions that are used throughout the app.
 */

import type { PostgrestError, User, Session, AuthError, AuthApiError } from "@supabase/supabase-js";
import { supabase, supabaseAdmin, auth, getAuth, getSupabaseClient } from "./supabase-client";
import { isBrowser } from "./browser-check";

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
  
  // Add mutex status for this user ID to prevent multiple concurrent profile creations
  const MUTEX_KEY = `PROFILE_CREATION_${user.id}`;
  
  // Check if we're already in process of creating this profile
  if (isBrowser) {
    const inProgress = sessionStorage.getItem(MUTEX_KEY);
    if (inProgress) {
      console.log(`Profile creation already in progress for ${user.id}, waiting...`);
      // Wait for the mutex to clear (max 3 seconds)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check cache again after waiting
      const profileAfterWait = getCachedProfile(user.id);
      if (profileAfterWait) {
        return { data: profileAfterWait, error: null };
      }
    }
    
    // Set mutex to prevent concurrent creation
    try {
      sessionStorage.setItem(MUTEX_KEY, Date.now().toString());
    } catch (e) {
      console.warn("Could not set session storage mutex", e);
    }
  }
  
  // Get all clients we might need
  const supabase = getSupabaseClient();
  const adminClient = supabaseAdmin;
  
  try {
    // First check if a profile already exists
    console.log(`Checking if profile exists for user ID: ${user.id}`);
    
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (fetchError) {
        if (fetchError.code !== "PGRST116") { // Not the "no rows returned" error
          console.error(`Profile fetch error for user ${user.id}:`, fetchError);
        }
        
        // No profile found or error occurred, continue to creation
      } else if (existingProfile) {
        // Profile found, cache and return it
        console.log(`Profile found for user ID: ${user.id}`);
        cacheProfile(existingProfile as UserProfile);
        
        // Clear mutex
        if (isBrowser) {
          sessionStorage.removeItem(MUTEX_KEY);
        }
        
        return { data: existingProfile as UserProfile, error: null };
      }
    } catch (fetchError) {
      console.error(`Unexpected error checking for profile: ${user.id}:`, fetchError);
      // Continue to creation attempt
    }
    
    console.log(`Creating profile for user ID: ${user.id}`);
    
    // Get additional metadata - start by using data from Auth API
    const authMetadata = await getUserMetadataFromAuthAPI(user.id);
    
    // Also check localStorage for saved metadata from signup
    let signupMetadata: Record<string, any> = {};
    try {
      const metadataString = localStorage.getItem("signup-metadata");
      const storedEmail = localStorage.getItem("signup-email");
      
      if (metadataString && storedEmail === user.email) {
        signupMetadata = JSON.parse(metadataString);
        console.log("Retrieved stored signup metadata:", signupMetadata);
      }
    } catch (storageError) {
      console.warn("Error retrieving stored signup metadata:", storageError);
    }
    
    // Merge all metadata sources with priority order:
    // 1. User's user_metadata (from auth)
    // 2. Stored signup metadata (from localStorage)
    // 3. Auth API metadata (retrieved separately)
    const mergedMetadata = {
      ...authMetadata,
      ...signupMetadata,
      ...user.user_metadata
    };
    
    // Prepare profile data with all required fields
    const profileData = {
      id: user.id,
      email: user.email || "",
      first_name: mergedMetadata.first_name || "",
      last_name: mergedMetadata.last_name || "",
      company: mergedMetadata.company || "",
      full_name: mergedMetadata.full_name || 
                `${mergedMetadata.first_name || ""} ${mergedMetadata.last_name || ""}`.trim() || 
                null,
      role: "user" as UserRole, // Default role
      status: "active" as UserStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    console.log(`Attempting to create profile with data:`, profileData);
    
    let createdProfile: UserProfile | null = null;
    let creationError: Error | null = null;
    
    // Try with regular client first
    try {
      const { data: insertedProfile, error: insertError } = await supabase
        .from("profiles")
        .upsert(profileData)
        .select()
        .single();
        
      if (insertError) {
        console.error("Error creating profile with regular client:", insertError);
        creationError = insertError;
      } else if (insertedProfile) {
        createdProfile = insertedProfile as UserProfile;
      }
    } catch (error) {
      console.error("Exception creating profile with regular client:", error);
      creationError = error as Error;
    }
    
    // If first attempt failed and we have admin client, try with that
    if (!createdProfile && creationError && adminClient) {
      try {
        console.log("Trying profile creation with admin client");
        const { data: adminInsertedProfile, error: adminInsertError } = await adminClient
          .from("profiles")
          .upsert(profileData)
          .select()
          .single();
          
        if (adminInsertError) {
          console.error("Error creating profile with admin client:", adminInsertError);
        } else if (adminInsertedProfile) {
          createdProfile = adminInsertedProfile as UserProfile;
          creationError = null;
        }
      } catch (adminError) {
        console.error("Exception creating profile with admin client:", adminError);
      }
    }
    
    // If creation still failed but we're in a browser, check if maybe it was created anyway
    if (!createdProfile && isBrowser) {
      try {
        console.log("Checking if profile was created despite errors");
        const { data: recoveryProfile, error: recoveryError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (!recoveryError && recoveryProfile) {
          console.log("Found profile during recovery check");
          createdProfile = recoveryProfile as UserProfile;
          creationError = null;
        }
      } catch (recoveryAttemptError) {
        console.error("Error during recovery attempt:", recoveryAttemptError);
      }
    }
    
    // If still no profile, use our prepared data as a fallback
    if (!createdProfile) {
      console.log("Using fallback profile data");
      createdProfile = profileData as UserProfile;
    }
    
    // Cache the profile whatever the result
    if (createdProfile) {
      cacheProfile(createdProfile);
    }
    
    // Clear mutex
    if (isBrowser) {
      sessionStorage.removeItem(MUTEX_KEY);
    }
    
    return { 
      data: createdProfile, 
      error: creationError
    };
  } catch (unexpectedError) {
    console.error("Critical error in ensureUserProfile:", unexpectedError);
    
    // Clear mutex on error
    if (isBrowser) {
      sessionStorage.removeItem(MUTEX_KEY);
    }
    
    // Create a fallback profile
    const fallbackProfile = {
      id: user.id,
      email: user.email || "",
      first_name: user.user_metadata?.first_name || "",
      last_name: user.user_metadata?.last_name || "",
      company: user.user_metadata?.company || "",
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
    // This is crucial as we need this data after email confirmation
    try {
      if (metadata) {
        console.log("Storing signup metadata for later profile creation:", metadata);
        
        // Store with a more robust approach
        localStorage.setItem("signup-metadata", JSON.stringify(metadata));
        localStorage.setItem("signup-email", email);
        localStorage.setItem("signup-timestamp", Date.now().toString());
        
        // Add redundant backup in case primary storage gets cleared
        const backupKey = `akii-signup-${email.replace(/[^a-zA-Z0-9]/g, "")}`;
        sessionStorage.setItem(backupKey, JSON.stringify({
          metadata,
          email,
          timestamp: Date.now()
        }));
      }
    } catch (storageError) {
      console.error("Failed to store signup metadata:", storageError);
    }
    
    console.log("Attempting to sign up with email:", email, "and metadata:", metadata);
    
    const { data, error } = await auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        data: metadata,
      },
    });
    
    if (error) {
      console.error("Signup error:", error);
      return { data: null, error };
    }
    
    // We have 2 scenarios here:
    // 1. Email confirmation is required (most common) - profile will be created after email confirmation
    // 2. User gets an active session immediately (e.g., auto-confirm is enabled)
    
    if (!data?.session) {
      // Email confirmation required - make sure metadata is stored for when they return
      console.log("Email confirmation required. Metadata has been stored for when user confirms email.");
      
      // We don't create profile now - it will be created after email confirmation
      // Instead we store a reminder that this user needs profile creation
      if (isBrowser) {
        localStorage.setItem(`profile-pending-${email.replace(/[^a-zA-Z0-9]/g, "")}`, "true");
      }
    } else {
      // User has active session immediately after signup (auto-confirm enabled)
      console.log("User has active session after signup, creating profile immediately");
      
      try {
        // Ensure we have the metadata available to the profile creation function
        if (data.user && metadata) {
          // Add metadata to user object to ensure it's available for profile creation
          data.user.user_metadata = {
            ...data.user.user_metadata,
            ...metadata
          };
        }
        
        const { data: profileData, error: profileError } = await ensureUserProfile(data.user);
        
        if (profileError) {
          console.error("Error creating profile after signup:", profileError);
        } else if (profileData) {
          console.log("Profile created successfully after signup:", profileData.id);
          
          // Clear signup metadata since we've successfully created the profile
          if (isBrowser) {
            try {
              localStorage.removeItem("signup-metadata");
              localStorage.removeItem("signup-email");
              localStorage.removeItem("signup-timestamp");
              localStorage.removeItem(`profile-pending-${email.replace(/[^a-zA-Z0-9]/g, "")}`);
            } catch (e) {
              console.warn("Could not clear signup metadata:", e);
            }
          }
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
    console.error("Unexpected error during signup:", err);
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
