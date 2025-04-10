/**
 * SUPABASE ADMIN MODULE
 * Admin-only functions that require service role
 */

import { getAdminClient } from './client.ts';
import { getUserProfile, updateUserProfile } from './auth.ts';
import type { UserProfile, UserRole, UserStatus, ApiResponse } from './types.ts';

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<ApiResponse<UserProfile[]>> {
  try {
    const admin = getAdminClient();
    if (!admin) {
      throw new Error("Admin client not available");
    }

    const { data, error } = await admin
      .from("profiles")
      .select("*");

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching all users:", error);
    return { data: [], error: error as Error };
  }
}

/**
 * Sync a user's profile (create if doesn't exist)
 */
export async function syncUserProfile(user: any): Promise<ApiResponse<UserProfile>> {
  try {
    if (!user || !user.id || !user.email) {
      throw new Error("Invalid user data for sync");
    }

    const admin = getAdminClient();
    if (!admin) {
      throw new Error("Admin client not available for profile sync");
    }

    // Check if profile exists
    const { data: existingProfile, error: checkError } = await admin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: insertError } = await admin
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          role: "user",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return { data: newProfile, error: null };
    }

    return { data: existingProfile, error: null };
  } catch (error) {
    console.error("Error syncing user profile:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Set a user as admin (admin only)
 */
export async function setUserAsAdmin(userId: string): Promise<ApiResponse<UserProfile>> {
  try {
    const admin = getAdminClient();
    if (!admin) {
      throw new Error("Admin client not available");
    }
    
    const { data, error } = await admin
      .from("profiles")
      .update({
        role: "admin",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error setting user as admin:", error);
    return { data: null, error: error as Error };
  }
}

// Alias for backward compatibility
export const ensureUserProfile = syncUserProfile; 