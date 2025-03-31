import { PostgrestError, Session, User } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Define core types
export type UserRole = "user" | "admin" | "team_member";
export type UserStatus = "active" | "inactive" | "banned" | "pending";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResult<T = any> {
  data: T | null;
  error: Error | PostgrestError | null;
  message?: string;
}

// Import Supabase clients from the centralized core module
import { supabaseClient, adminClient, supabase } from "./supabase-core";

// Re-export the clients for use in other modules
export { supabaseClient, adminClient, supabase };

// Core auth functions
export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult<User>> {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("No user returned after sign in");

    // Ensure profile exists and sync user data
    await syncUserProfile(data.user);

    return { data: data.user, error: null };
  } catch (error) {
    console.error("Sign in error:", error);
    return { data: null, error: error as Error };
  }
}

export async function signOut(): Promise<AuthResult> {
  try {
    // Sign out from Supabase
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;

    return { data: true, error: null };
  } catch (error) {
    console.error("Sign out error:", error);
    return { data: null, error: error as Error };
  }
}

export async function getCurrentSession(): Promise<AuthResult<Session>> {
  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;

    return { data: data.session, error: null };
  } catch (error) {
    console.error("Get session error:", error);
    return { data: null, error: error as Error };
  }
}

export async function getCurrentUser(): Promise<AuthResult<User>> {
  try {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error) throw error;

    return { data: data.user, error: null };
  } catch (error) {
    console.error("Get user error:", error);
    return { data: null, error: error as Error };
  }
}

// User profile management
export async function getUserProfile(
  userId: string,
): Promise<AuthResult<UserProfile>> {
  try {
    // Get from database
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Profile not found");

    const profile: UserProfile = {
      id: data.id,
      email: data.email,
      role: (data.role as UserRole) || "user",
      status: (data.status as UserStatus) || "active",
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return { data: profile, error: null };
  } catch (error) {
    console.error("Get user profile error:", error);

    // Try with admin client as fallback
    try {
      const { data } = await adminClient
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        const profile: UserProfile = {
          id: data.id,
          email: data.email,
          role: (data.role as UserRole) || "user",
          status: (data.status as UserStatus) || "active",
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        return { data: profile, error: null };
      }
    } catch (fallbackError) {
      console.error("Admin fallback error:", fallbackError);
    }

    return { data: null, error: error as Error };
  }
}

export async function syncUserProfile(
  user: User,
): Promise<AuthResult<UserProfile>> {
  try {
    if (!user || !user.id || !user.email) {
      throw new Error("Invalid user data for sync");
    }

    // Check if profile exists
    const { data: existingProfile, error: checkError } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // Real error, not just "no rows returned"
      throw checkError;
    }

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: insertError } = await adminClient
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

      if (newProfile) {
        const profile: UserProfile = {
          id: newProfile.id,
          email: newProfile.email,
          role: (newProfile.role as UserRole) || "user",
          status: (newProfile.status as UserStatus) || "active",
          created_at: newProfile.created_at,
          updated_at: newProfile.updated_at,
        };

        return { data: profile, error: null };
      }
    } else {
      // Update existing profile to ensure email matches
      const { data: updatedProfile, error: updateError } = await adminClient
        .from("profiles")
        .update({
          email: user.email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      if (updatedProfile) {
        const profile: UserProfile = {
          id: updatedProfile.id,
          email: updatedProfile.email,
          role: (updatedProfile.role as UserRole) || "user",
          status: (updatedProfile.status as UserStatus) || "active",
          full_name: updatedProfile.full_name,
          avatar_url: updatedProfile.avatar_url,
          created_at: updatedProfile.created_at,
          updated_at: updatedProfile.updated_at,
        };

        return { data: profile, error: null };
      }
    }

    // Fallback to returning existing profile
    if (existingProfile) {
      const profile: UserProfile = {
        id: existingProfile.id,
        email: existingProfile.email,
        role: (existingProfile.role as UserRole) || "user",
        status: (existingProfile.status as UserStatus) || "active",
        full_name: existingProfile.full_name,
        avatar_url: existingProfile.avatar_url,
        created_at: existingProfile.created_at,
        updated_at: existingProfile.updated_at,
      };

      return { data: profile, error: null };
    }

    throw new Error("Failed to sync user profile");
  } catch (error) {
    console.error("Sync user profile error:", error);
    return { data: null, error: error as Error };
  }
}

// Special function for Josef
export async function ensureJosefAdmin(): Promise<AuthResult> {
  const email = "josef@holm.com";

  try {
    // Update profile with admin client
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        role: "admin",
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (updateError) {
      console.error("Error updating profile:", updateError);

      // Try fallback with RPC
      try {
        const { error: rpcError } = await adminClient.rpc("force_admin_role", {
          target_email: email,
        });

        if (rpcError) throw rpcError;
      } catch (rpcError) {
        console.error("Error with RPC fallback:", rpcError);
      }
    }

    return {
      data: true,
      error: null,
      message: "Josef has been set as admin through multiple methods",
    };
  } catch (error) {
    console.error("Force josef admin error:", error);
    return {
      data: null,
      error: error as Error,
      message: "Admin elevation attempted but encountered errors",
    };
  }
}
