/**
 * AUTHENTICATION CORE MODULE
 * 
 * Central module for all authentication-related functionality.
 * This module provides core auth functions that are used throughout the app.
 */

import type { PostgrestError } from "@supabase/supabase-js";
import { supabase, supabaseAdmin, auth, getAuth } from "./supabase-client";

// Re-export Supabase instances and auth
export { supabase, supabaseAdmin, auth, getAuth };

// Re-export types from supabase
import type { Session, User } from "@supabase/supabase-js";
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

export interface AuthResponse<T = any> {
  data: T | null;
  error: Error | PostgrestError | null;
}

// Session management functions
export async function getCurrentSession(): Promise<AuthResponse<Session>> {
  try {
    const { data, error } = await auth.getSession();
    if (error) throw error;
    return { data: data.session, error: null };
  } catch (error) {
    console.error("Get session error:", error);
    return { data: null, error: error as Error };
  }
}

export async function getCurrentUser(): Promise<AuthResponse<User>> {
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
): Promise<AuthResponse<UserProfile>> {
  try {
    // Guard against undefined userId
    if (!userId) {
      return { 
        data: null, 
        error: new Error("User ID is required to fetch profile") 
      };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // No data found is not a critical error
      if (error.code === "PGRST116") {
        return { data: null, error: null };
      }
      throw error;
    }

    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error("Get user profile error:", error);
    return { data: null, error: error as Error };
  }
}

export async function ensureUserProfile(
  user: User
): Promise<AuthResponse<UserProfile>> {
  try {
    if (!user?.id || !user?.email) {
      throw new Error("Invalid user data");
    }

    // Check if profile exists
    const { data: existingProfile } = await getUserProfile(user.id);
    
    if (existingProfile) {
      return { data: existingProfile, error: null };
    }

    // Create profile if it doesn't exist
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name,
        company: user.user_metadata?.company,
        role: "user",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error("Ensure user profile error:", error);
    return { data: null, error: error as Error };
  }
}

export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<AuthResponse<UserProfile>> {
  try {
    // Prevent updating protected fields
    const safeUpdates = { ...updates };
    delete safeUpdates.id;
    delete safeUpdates.email;
    delete safeUpdates.role; // Use setUserRole for this
    delete safeUpdates.status; // Use setUserStatus for this

    // Add timestamp
    safeUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update(safeUpdates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error("Update user profile error:", error);
    return { data: null, error: error as Error };
  }
}

export async function setUserRole(
  userId: string,
  role: UserRole
): Promise<AuthResponse<UserProfile>> {
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
): Promise<AuthResponse<UserProfile>> {
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
): Promise<AuthResponse<User>> {
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

export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, any>
): Promise<AuthResponse<User>> {
  try {
    const { data, error } = await auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;
    if (!data?.user) throw new Error("No user returned from sign up");
    
    // Create or ensure user profile with metadata
    // Note: In some auth flows, profile creation might need to happen after email confirmation
    // but we'll attempt it now to capture metadata
    if (data.user.id && data.user.email) {
      console.log("Creating initial profile with metadata:", metadata);
      
      try {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            email: data.user.email,
            first_name: metadata?.first_name || data.user.user_metadata?.first_name,
            last_name: metadata?.last_name || data.user.user_metadata?.last_name,
            company: metadata?.company || data.user.user_metadata?.company,
            role: "user",
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          
        if (profileError) {
          console.error("Profile creation during signup failed:", profileError);
        } else {
          console.log("Profile created successfully during signup");
        }
      } catch (profileError) {
        console.error("Exception creating profile during signup:", profileError);
        // We don't throw here as signup was successful even if profile creation failed
      }
    }

    return { data: data.user, error: null };
  } catch (error) {
    console.error("Sign up error:", error);
    return { data: null, error: error as Error };
  }
}

export async function signOut(): Promise<AuthResponse<boolean>> {
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
): Promise<AuthResponse<any>> {
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
): Promise<AuthResponse<boolean>> {
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
): Promise<AuthResponse<User>> {
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
export async function getAllUsers(): Promise<AuthResponse<UserProfile[]>> {
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
