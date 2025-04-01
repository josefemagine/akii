/**
 * Auth helper functions for handling Supabase authentication
 */

import type { Session, User, PostgrestError } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { 
  getAuth, 
  getSupabaseClient, 
  getAdminClient, 
  supabase, 
  auth 
} from "./supabase-singleton";

// Export our own types
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

// Types
export interface AuthResponse<T = any> {
  data: T | null;
  error: Error | PostgrestError | null;
}

// Use this approach - don't re-export, just import what you need:
// No exports of these clients

// Authentication functions
export async function signIn(
  email: string,
  password: string,
): Promise<AuthResponse<User>> {
  try {
    // Clear previous auth state
    await clearStoredAuth();

    console.log("Signing in user:", email);

    // Sign in with Supabase
    const { data, error } = await auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("No user returned after sign in");

    console.log("Sign in successful for:", data.user.email);

    // Store backup session data for resilience
    try {
      localStorage.setItem("akii-auth-user-email", email);
      localStorage.setItem("akii-auth-user-id", data.user.id);
      localStorage.setItem("akii-auth-timestamp", Date.now().toString());

      // For josef@holm.com, set admin override
      if (email === "josef@holm.com") {
        localStorage.setItem("akii_admin_override", "true");
        localStorage.setItem("akii_admin_override_email", "josef@holm.com");
        localStorage.setItem(
          "akii_admin_override_expiry",
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        );
        sessionStorage.setItem("admin_override", "true");
        sessionStorage.setItem("admin_override_email", "josef@holm.com");
      }
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

export async function signOut(): Promise<AuthResponse> {
  try {
    // Clear all local storage related to auth
    await clearStoredAuth();

    // Sign out from Supabase
    const { error } = await auth.signOut();
    if (error) throw error;

    return { data: true, error: null };
  } catch (error) {
    console.error("Sign out error:", error);
    return { data: null, error: error as Error };
  }
}

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
  userId?: string,
): Promise<AuthResponse<UserProfile>> {
  try {
    // Guard against undefined userId
    if (!userId) {
      console.warn("getUserProfile called with undefined userId");
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

      console.error("Error fetching user profile:", error.message);
      return { data: null, error };
    }

    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error("Unexpected error fetching user profile:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("An unexpected error occurred fetching the user profile"),
    };
  }
}

export async function getUserProfileByEmail(
  email: string,
): Promise<AuthResponse<UserProfile>> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      // No data found is not a critical error
      if (error.code === "PGRST116") {
        return { data: null, error: null };
      }

      console.error("Error fetching user profile by email:", error.message);
      return { data: null, error };
    }

    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error("Unexpected error fetching user profile by email:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("An unexpected error occurred fetching the user profile"),
    };
  }
}

export async function ensureUserProfile(
  user: User,
): Promise<AuthResponse<UserProfile>> {
  try {
    // First check if profile exists
    const { data: existingProfile } = await getUserProfile(user.id);

    if (existingProfile) {
      return { data: existingProfile, error: null };
    }

    // If no profile exists, create one
    const newProfile: Partial<UserProfile> = {
      id: user.id,
      email: user.email || "",
      role: "user",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(newProfile)
      .select()
      .single();

    if (error) {
      console.error("Error creating user profile:", error.message);
      return { data: null, error };
    }

    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error("Unexpected error ensuring user profile:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("An unexpected error occurred ensuring the user profile"),
    };
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<AuthResponse<UserProfile>> {
  try {
    // Prevent updating protected fields
    const safeUpdates = { ...updates };
    delete safeUpdates.id;
    delete safeUpdates.role; // Use setUserRole for this
    delete safeUpdates.status; // Use setUserStatus for this

    // Add updated timestamp
    safeUpdates.updated_at = new Date().toISOString();

    console.log("Updating user profile with:", safeUpdates);

    const { data, error } = await supabase
      .from("profiles")
      .update(safeUpdates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error.message);
      return { data: null, error };
    }

    // Store avatar URL in localStorage for immediate access
    if (safeUpdates.avatar_url) {
      localStorage.setItem("akii-avatar-url", safeUpdates.avatar_url);
    }

    console.log("Profile updated successfully:", data);
    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error("Unexpected error updating user profile:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("An unexpected error occurred updating the user profile"),
    };
  }
}

// Role management functions
export async function setUserRole(
  userId: string,
  role: UserRole,
): Promise<AuthResponse<UserProfile>> {
  try {
    // Use admin client to bypass RLS
    const { data, error } = await getAdminClient()
      .from("profiles")
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error setting user role:", error.message);
      return { data: null, error };
    }

    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error("Unexpected error setting user role:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("An unexpected error occurred setting the user role"),
    };
  }
}

export async function setUserStatus(
  userId: string,
  status: UserStatus,
): Promise<AuthResponse<UserProfile>> {
  try {
    // Use admin client to bypass RLS
    const { data, error } = await getAdminClient()
      .from("profiles")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error setting user status:", error.message);
      return { data: null, error };
    }

    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error("Unexpected error setting user status:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error
          : new Error("An unexpected error occurred setting the user status"),
    };
  }
}

// Database utility functions
export async function checkUserExists(
  email: string,
): Promise<AuthResponse<boolean>> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return { data: !!data, error: null };
  } catch (error) {
    console.error("Check user exists error:", error);
    return { data: null, error: error as Error };
  }
}

export async function getUserStatus(userId: string) {
  const client = getSupabaseClient();
  // Implementation using client...
}

export async function checkAdminStatus(userId: string) {
  const adminClient = getAdminClient();
  if (!adminClient) {
    throw new Error("Admin client not available");
  }
  // Implementation using adminClient...
}

// Auth state helpers
export function clearStoredAuth(): void {
  try {
    // Don't clear auth data for josef@holm.com
    const isJosef =
      localStorage.getItem("akii-auth-user-email") === "josef@holm.com";

    if (!isJosef) {
      // Clear Supabase tokens
      localStorage.removeItem("sb-access-token");
      localStorage.removeItem("sb-refresh-token");
      localStorage.removeItem("supabase.auth.token");

      // Clear auth state flags
      localStorage.removeItem("auth-in-progress");
      localStorage.removeItem("auth-in-progress-time");

      // Clear any debug tokens
      localStorage.removeItem("debug-access-token");
      localStorage.removeItem("debug-refresh-token");

      // Clear admin overrides
      localStorage.removeItem("admin_override");
      localStorage.removeItem("admin_override_email");
      localStorage.removeItem("admin_override_time");
      localStorage.removeItem("akii_admin_override");
      localStorage.removeItem("akii_admin_override_email");
      localStorage.removeItem("akii_admin_override_expiry");

      // Clear session storage as well
      sessionStorage.removeItem("admin_override");
      sessionStorage.removeItem("admin_override_email");
      sessionStorage.removeItem("admin_override_time");
      sessionStorage.removeItem("akii_admin_override");
      sessionStorage.removeItem("akii_admin_override_email");
      sessionStorage.removeItem("akii_admin_override_expiry");

      // Clear backup auth data
      localStorage.removeItem("akii-auth-user-email");
      localStorage.removeItem("akii-auth-user-id");
      localStorage.removeItem("akii-auth-timestamp");
    } else {
      console.log("Preserving auth data for josef@holm.com");
      // For josef@holm.com, ensure admin override is set
      localStorage.setItem("akii_admin_override", "true");
      localStorage.setItem("akii_admin_override_email", "josef@holm.com");
      localStorage.setItem(
        "akii_admin_override_expiry",
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      );
      sessionStorage.setItem("admin_override", "true");
      sessionStorage.setItem("admin_override_email", "josef@holm.com");
    }
  } catch (error) {
    console.error("Error clearing auth state:", error);
  }
}

// Synchronize users - ensure auth.users are in profiles table
export async function syncUserProfiles(): Promise<
  AuthResponse<{ created: number; updated: number }>
> {
  try {
    // Get all auth users using admin client
    const { data: authUsers, error: authError } =
      await getAdminClient().auth.admin.listUsers();

    if (authError) throw authError;
    if (!authUsers?.users)
      throw new Error("No users returned from auth.admin.listUsers");

    let created = 0;
    let updated = 0;

    // Process each auth user
    for (const user of authUsers.users) {
      if (!user.id || !user.email) continue;

      // Check if profile exists
      const { data: existingProfile } = await getAdminClient()
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingProfile) {
        // Create new profile
        const { error: insertError } = await getAdminClient()
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            role: "user",
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (!insertError) created++;
      } else {
        // Update email if needed
        const { error: updateError } = await getAdminClient()
          .from("profiles")
          .update({
            email: user.email,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (!updateError) updated++;
      }
    }

    return {
      data: { created, updated },
      error: null,
    };
  } catch (error) {
    console.error("Sync user profiles error:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Verify Supabase connection and configuration
 * Use this function to test if your Supabase setup is working correctly
 */
export async function verifySupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  details: {
    connection: boolean;
    profile: boolean;
    service: boolean;
  };
}> {
  const details = {
    connection: false,
    profile: false,
    service: false,
  };

  try {
    // Test basic connection
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      return {
        success: false,
        message: `Failed to connect to Supabase: ${sessionError.message}`,
        details,
      };
    }

    details.connection = true;

    // Check if profile table exists by attempting a count
    try {
      const { count, error: countError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (countError) {
        return {
          success: false,
          message: `Connected to Supabase but profiles table may not exist: ${countError.message}`,
          details,
        };
      }

      details.profile = true;

      // Test service role connection
      const { error: adminError } = await getAdminClient()
        .from("profiles")
        .select("id")
        .limit(1);

      if (adminError) {
        return {
          success: false,
          message: `Connected to Supabase but service role access failed: ${adminError.message}`,
          details: { ...details, service: false },
        };
      }

      details.service = true;

      return {
        success: true,
        message: "Supabase connection and configuration verified successfully!",
        details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error verifying profiles table: ${error instanceof Error ? error.message : "Unknown error"}`,
        details,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to verify Supabase connection: ${error instanceof Error ? error.message : "Unknown error"}`,
      details,
    };
  }
}

// Use unique function names that don't conflict with other exports
export async function checkProfileStatus(userId: string) {
  const client = getSupabaseClient();
  // Implementation
}

export async function verifyAdminAccess(userId: string) {
  const adminClient = getAdminClient();
  if (!adminClient) {
    throw new Error("Admin client not available");
  }
  // Implementation
}

// Re-export auth and auth-related functions
export { getAuth } from "./supabase-singleton";
