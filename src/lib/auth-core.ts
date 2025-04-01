/**
 * Centralized authentication client configuration
 * This file creates and exports a single instance of the Supabase auth client
 * to prevent duplicate GoTrueClient instances across the application
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { isBrowser } from "./browser-check";

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

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey =
  import.meta.env.VITE_SUPABASE_SERVICE_KEY ||
  import.meta.env.SUPABASE_SERVICE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Check your .env file.",
  );
}

// Create a single instance of the Supabase client for public usage
export const supabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        "x-application-name": "akii-web-auth-core",
      },
    },
  },
);

// Create a single instance of the Supabase client with admin privileges
// Only use this for server-side operations that require elevated permissions
export const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          "x-application-name": "akii-web-admin-core",
        },
      },
    })
  : null;

// Export the auth client for direct access when needed
export const supabase = supabaseClient;

// Export the auth instance for direct access when needed
export const auth = supabaseClient.auth;

// Re-export all the existing functions from the original file
export async function signIn(email: string, password: string) {
  try {
    // Clear any previous auth state
    await clearAuthState();

    // Sign in with Supabase
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

export async function signOut() {
  try {
    // Clear all local storage related to auth
    await clearAuthState();

    // Sign out from Supabase
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;

    return { data: true, error: null };
  } catch (error) {
    console.error("Sign out error:", error);
    return { data: null, error: error as Error };
  }
}

export async function getCurrentSession() {
  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;

    return { data: data.session, error: null };
  } catch (error) {
    console.error("Get session error:", error);
    return { data: null, error: error as Error };
  }
}

export async function getCurrentUser() {
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
export async function getUserProfile(userId: string) {
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
      if (supabaseAdmin) {
        const { data } = await supabaseAdmin
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
      }
    } catch (fallbackError) {
      console.error("Admin fallback error:", fallbackError);
    }

    return { data: null, error: error as Error };
  }
}

export async function syncUserProfile(user: any) {
  try {
    if (!user || !user.id || !user.email) {
      throw new Error("Invalid user data for sync");
    }

    if (!supabaseAdmin) {
      throw new Error("Admin client not available for profile sync");
    }

    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
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
      const { data: newProfile, error: insertError } = await supabaseAdmin
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
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
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

// Simplified version of ensureUserProfile for compatibility
export async function ensureUserProfile(user: any) {
  return syncUserProfile(user);
}

// Simplified version of updateUserProfile for compatibility
export async function updateUserProfile(
  userId: string,
  profileData: Partial<UserProfile>,
) {
  try {
    const { data, error } = await supabaseClient
      .from("profiles")
      .update(profileData)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("No profile data returned");

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
    console.error("Update user profile error:", error);
    return { data: null, error: error as Error };
  }
}

// Simplified version of setUserRole for compatibility
export async function setUserRole(userId: string, role: UserRole) {
  try {
    if (!supabaseAdmin) {
      throw new Error("Admin client not available for setting user role");
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) throw error;

    return { data: true, error: null };
  } catch (error) {
    console.error("Set user role error:", error);
    return { data: null, error: error as Error };
  }
}

// Simplified version of setUserStatus for compatibility
export async function setUserStatus(userId: string, status: UserStatus) {
  try {
    if (!supabaseAdmin) {
      throw new Error("Admin client not available for setting user status");
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) throw error;

    return { data: true, error: null };
  } catch (error) {
    console.error("Set user status error:", error);
    return { data: null, error: error as Error };
  }
}

// Simplified version of checkUserStatus for compatibility
export async function checkUserStatus(userId: string) {
  try {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("status")
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("No profile found");

    return { data: data.status as UserStatus, error: null };
  } catch (error) {
    console.error("Check user status error:", error);
    return { data: null, error: error as Error };
  }
}

// Clear all auth state including Supabase stored session
export async function clearAuthState() {
  try {
    if (!isBrowser()) return;

    // Clear any Supabase items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("sb-") ||
          key.startsWith("supabase.") ||
          key.includes("supabase"))
      ) {
        localStorage.removeItem(key);
      }
    }

    // Also check session storage for Supabase items
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (
        key &&
        (key.startsWith("sb-") ||
          key.startsWith("supabase.") ||
          key.includes("supabase"))
      ) {
        sessionStorage.removeItem(key);
      }
    }

    // Clear any additional auth items
    localStorage.removeItem("auth-in-progress");
    localStorage.removeItem("auth-in-progress-time");
    localStorage.removeItem("auth-return-path");
    localStorage.removeItem("akii-auth-fallback-user");
    localStorage.removeItem("akii-auth-success-time");
    localStorage.removeItem("admin_override");
    localStorage.removeItem("admin_override_email");
    localStorage.removeItem("admin_override_time");
    localStorage.removeItem("akii-last-login");
    localStorage.removeItem("akii-session-data");
    localStorage.removeItem("akii-user-data");
    localStorage.removeItem("akii-auth-state");

    console.log("Auth state cleared successfully");
  } catch (error) {
    console.error("Error clearing auth state:", error);
  }
}
