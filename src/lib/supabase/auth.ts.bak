/**
 * SUPABASE AUTH MODULE
 * Authentication and user management functions
 * Uses client.ts for Supabase instances
 */

import { getClient, getAdminClient } from './client';
import type { UserProfile, UserRole, UserStatus, ApiResponse } from './types';

// Get the auth client (cached for consistency)
export function getAuth() {
  return getClient().auth;
}

/**
 * Get the current logged-in user
 */
export async function getCurrentUser(): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await getAuth().getUser();
    if (error) throw error;
    return { data: data.user, error: null };
  } catch (error) {
    console.error("Get user error:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get the current session
 */
export async function getCurrentSession(): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await getAuth().getSession();
    if (error) throw error;
    return { data: data.session, error: null };
  } catch (error) {
    console.error("Get session error:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get a user's profile by ID
 */
export async function getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    const { data, error } = await getClient()
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Profile not found");

    return { 
      data: {
        id: data.id,
        email: data.email,
        role: (data.role as UserRole) || "user",
        status: (data.status as UserStatus) || "active",
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }, 
      error: null 
    };
  } catch (error) {
    console.error("Get user profile error:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get complete user data from Supabase
 * This includes auth data, profile data, and other associated data
 */
export async function getCompleteUserData(userId: string): Promise<ApiResponse<any>> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get user profile data
    const { data: profileData, error: profileError } = await getClient()
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') throw profileError;

    // Get admin client and check if it exists
    const adminClient = getAdminClient();
    if (!adminClient) {
      throw new Error("Failed to get admin client for user data retrieval");
    }

    // Get auth user data (this endpoint is available in admin API)
    const { data: adminUserData, error: adminUserError } = await adminClient.auth.admin.getUserById(userId);
    if (adminUserError) throw adminUserError;

    // Combine data
    return {
      data: {
        auth: adminUserData?.user || null,
        profile: profileData || null
      },
      error: null
    };
  } catch (error) {
    console.error("Get complete user data error:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Update a user's profile
 */
export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<ApiResponse<UserProfile>> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    const { data, error } = await getClient()
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Check a user's status
 */
export async function checkUserStatus(userId: string): Promise<ApiResponse<UserStatus>> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const { data, error } = await getUserProfile(userId);
    
    if (error) throw error;
    if (!data) throw new Error("User profile not found");
    
    return { data: data.status, error: null };
  } catch (error) {
    console.error("Error checking user status:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Set a user's role
 */
export async function setUserRole(userId: string, role: UserRole): Promise<ApiResponse<UserProfile>> {
  return updateUserProfile(userId, { role });
}

/**
 * Set a user's status
 */
export async function setUserStatus(userId: string, status: UserStatus): Promise<ApiResponse<UserProfile>> {
  return updateUserProfile(userId, { status });
} 