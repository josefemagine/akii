/**
 * FIXED AUTH MODULE
 * This is a clean implementation that fixes the multiple GoTrueClient instances
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { Session, User, PostgrestError } from "@supabase/supabase-js";

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || import.meta.env.SUPABASE_SERVICE_KEY;

// Debug log environment variables only in development
if (import.meta.env.DEV) {
  console.log('[DEBUG] Supabase environment check:', {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasServiceKey: !!supabaseServiceKey,
    urlPreview: supabaseUrl ? supabaseUrl.substring(0, 15) + '...' : null,
  });
}

// Core types
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

export interface AuthResponse<T = any> {
  data: T | null;
  error: Error | PostgrestError | null;
}

// SINGLETON PATTERN - Create instances only once
let _supabaseClient = null;
let _supabaseAdmin = null;
let _auth = null;

// Create the Supabase client (only once)
export function getSupabaseClient() {
  if (!_supabaseClient) {
    _supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      global: {
        headers: { 'x-application-name': 'akii-web-app' },
      },
      realtime: {
        timeout: 30000, // 30 seconds
      },
    });
    console.log("[Auth] Created Supabase client");
  }
  return _supabaseClient;
}

// Create the Supabase admin client (only once)
export function getAdminClient() {
  if (!supabaseServiceKey) {
    console.warn("No service key available for admin client");
    return null;
  }
  
  if (!_supabaseAdmin && supabaseServiceKey) {
    _supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { "x-application-name": "akii-web-admin" } },
    });
    console.log("[Auth] Created Supabase admin client");
  }
  return _supabaseAdmin;
}

// Get auth instance (only once)
export function getAuth() {
  if (!_auth) {
    _auth = getSupabaseClient().auth;
  }
  return _auth;
}

// Aliases for convenience
export const getClient = getSupabaseClient;

// Core authentication functions
export async function getCurrentUser(): Promise<AuthResponse<User>> {
  try {
    const { data, error } = await getAuth().getUser();
    if (error) throw error;
    return { data: data.user, error: null };
  } catch (error) {
    console.error("Get user error:", error);
    return { data: null, error: error as Error };
  }
}

export async function getCurrentSession(): Promise<AuthResponse<Session>> {
  try {
    const { data, error } = await getAuth().getSession();
    if (error) throw error;
    return { data: data.session, error: null };
  } catch (error) {
    console.error("Get session error:", error);
    return { data: null, error: error as Error };
  }
}

export async function getUserProfile(userId: string): Promise<AuthResponse<UserProfile>> {
  try {
    const { data, error } = await getSupabaseClient()
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

export async function syncUserProfile(user: any): Promise<AuthResponse<UserProfile>> {
  try {
    if (!user || !user.id || !user.email) {
      throw new Error("Invalid user data for sync");
    }

    if (!getAdminClient()) {
      throw new Error("Admin client not available for profile sync");
    }

    // Check if profile exists
    const { data: existingProfile, error: checkError } = await getAdminClient()
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: insertError } = await getAdminClient()
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

// Helper functions
export async function checkUserStatus(userId: string): Promise<AuthResponse<UserStatus>> {
  try {
    if (!userId) {
      throw new Error("User ID is required to check status");
    }

    const { data: profile, error } = await getUserProfile(userId);
    
    if (error) throw error;
    if (!profile) throw new Error("User profile not found");
    
    return { data: profile.status, error: null };
  } catch (error) {
    console.error("Error checking user status:", error);
    return { data: null, error: error as Error };
  }
}

export async function ensureUserProfile(user: any): Promise<AuthResponse<UserProfile>> {
  return syncUserProfile(user); // This is an alias for syncUserProfile
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<AuthResponse<UserProfile>> {
  try {
    const { data, error } = await getSupabaseClient()
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

export async function setUserRole(userId: string, role: UserRole): Promise<AuthResponse<UserProfile>> {
  return updateUserProfile(userId, { role });
}

export async function setUserStatus(userId: string, status: UserStatus): Promise<AuthResponse<UserProfile>> {
  return updateUserProfile(userId, { status });
}

// Auth methods
export async function signIn(email: string, password: string): Promise<AuthResponse<User>> {
  try {
    console.log("Signing in user:", email);

    // Sign in with Supabase
    const { data, error } = await getSupabaseClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("No user returned after sign in");

    console.log("Sign in successful for:", data.user.email);

    // Store backup auth data for resilience
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

export async function signOut(): Promise<AuthResponse<boolean>> {
  try {
    // Clear auth data
    try {
      localStorage.removeItem("akii-auth-user-email");
      localStorage.removeItem("akii-auth-user-id");
      localStorage.removeItem("akii-auth-timestamp");
    } catch (e) {
      console.error("Error clearing local storage:", e);
    }

    // Sign out from Supabase
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) throw error;

    return { data: true, error: null };
  } catch (error) {
    console.error("Sign out error:", error);
    return { data: null, error: error as Error };
  }
}

// Export all functions
export const auth = {
  getCurrentUser,
  getCurrentSession,
  getUserProfile,
  syncUserProfile,
  ensureUserProfile,
  updateUserProfile,
  setUserRole,
  setUserStatus,
  checkUserStatus,
  signIn,
  signOut
}; 