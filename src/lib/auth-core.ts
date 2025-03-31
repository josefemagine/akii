import {
  createClient,
  PostgrestError,
  Session,
  User,
} from "@supabase/supabase-js";
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

// Create Supabase clients
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey =
  import.meta.env.VITE_SUPABASE_SERVICE_KEY || supabaseAnonKey;

// Standard client for normal operations
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

// Admin client with service role for bypassing RLS
export const adminClient = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        "x-application-name": "akii-web-admin-core",
      },
    },
  },
);

// For backward compatibility
export const supabase = supabaseClient;

// Storage keys
const ADMIN_OVERRIDE_KEY = "akii_admin_override";
const ADMIN_OVERRIDE_EMAIL_KEY = "akii_admin_override_email";
const ADMIN_OVERRIDE_EXPIRY_KEY = "akii_admin_override_expiry";
const USER_PROFILE_CACHE_KEY = "akii_user_profile";
const USER_ROLE_CACHE_KEY = "akii_user_role";

// Core auth functions
export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult<User>> {
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

export async function signOut(): Promise<AuthResult> {
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
    // Try to get from cache first
    const cachedProfile = getCachedUserProfile();
    if (cachedProfile && cachedProfile.id === userId) {
      return { data: cachedProfile, error: null };
    }

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

    // Cache the profile
    cacheUserProfile(profile);

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

        cacheUserProfile(profile);
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

      // Cache the new profile
      if (newProfile) {
        const profile: UserProfile = {
          id: newProfile.id,
          email: newProfile.email,
          role: (newProfile.role as UserRole) || "user",
          status: (newProfile.status as UserStatus) || "active",
          created_at: newProfile.created_at,
          updated_at: newProfile.updated_at,
        };

        cacheUserProfile(profile);
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

        cacheUserProfile(profile);
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

      cacheUserProfile(profile);
      return { data: profile, error: null };
    }

    throw new Error("Failed to sync user profile");
  } catch (error) {
    console.error("Sync user profile error:", error);
    return { data: null, error: error as Error };
  }
}

// Admin elevation functions
export async function setUserRole(
  userId: string,
  role: UserRole,
): Promise<AuthResult> {
  try {
    // Only allow admin client to set roles for security
    const { error } = await adminClient
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) throw error;

    // Clear cache to ensure fresh data
    clearUserCache();

    return { data: true, error: null };
  } catch (error) {
    console.error("Set user role error:", error);
    return { data: null, error: error as Error };
  }
}

export async function setUserRoleByEmail(
  email: string,
  role: UserRole,
): Promise<AuthResult> {
  try {
    // Try direct update by email first (simpler approach)
    const { error } = await adminClient
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("email", email);

    if (error) throw error;

    clearUserCache();
    return { data: true, error: null };
  } catch (error) {
    console.error("Set user role by email error:", error);
    return { data: null, error: error as Error };
  }
}

// Emergency admin access (to be used sparingly)
export function enableAdminOverride(email: string, durationHours = 24): void {
  // Current time
  const now = new Date();

  // Set expiry time
  const expiry = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

  // Store in both localStorage and sessionStorage for redundancy
  localStorage.setItem(ADMIN_OVERRIDE_KEY, "true");
  localStorage.setItem(ADMIN_OVERRIDE_EMAIL_KEY, email);
  localStorage.setItem(ADMIN_OVERRIDE_EXPIRY_KEY, expiry.toISOString());

  sessionStorage.setItem(ADMIN_OVERRIDE_KEY, "true");
  sessionStorage.setItem(ADMIN_OVERRIDE_EMAIL_KEY, email);
  sessionStorage.setItem(ADMIN_OVERRIDE_EXPIRY_KEY, expiry.toISOString());

  console.log(
    `Admin override enabled for ${email} until ${expiry.toLocaleString()}`,
  );

  // Only attempt to use chrome APIs if they exist
  if (
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.sendMessage
  ) {
    try {
      chrome.runtime.sendMessage({
        action: "admin_override",
        email: email,
        expiry: expiry.toISOString(),
      });
    } catch (err) {
      console.warn("Failed to send admin override message to extension", err);
    }
  }
}

export function hasValidAdminOverride(email: string): boolean {
  try {
    // Check localStorage first
    const override = localStorage.getItem(ADMIN_OVERRIDE_KEY) === "true";
    const overrideEmail = localStorage.getItem(ADMIN_OVERRIDE_EMAIL_KEY);
    const expiryStr = localStorage.getItem(ADMIN_OVERRIDE_EXPIRY_KEY);

    if (override && overrideEmail === email && expiryStr) {
      const expiry = new Date(expiryStr);
      const now = new Date();

      if (now < expiry) {
        return true;
      }
    }

    // Check sessionStorage as fallback
    const sessionOverride =
      sessionStorage.getItem(ADMIN_OVERRIDE_KEY) === "true";
    const sessionEmail = sessionStorage.getItem(ADMIN_OVERRIDE_EMAIL_KEY);
    const sessionExpiryStr = sessionStorage.getItem(ADMIN_OVERRIDE_EXPIRY_KEY);

    if (sessionOverride && sessionEmail === email && sessionExpiryStr) {
      const expiry = new Date(sessionExpiryStr);
      const now = new Date();

      if (now < expiry) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking admin override:", error);
    return false;
  }
}

// Cache helpers
function cacheUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_PROFILE_CACHE_KEY, JSON.stringify(profile));
    localStorage.setItem(USER_ROLE_CACHE_KEY, profile.role);
  } catch (error) {
    console.error("Error caching user profile:", error);
  }
}

function getCachedUserProfile(): UserProfile | null {
  try {
    const profileJson = localStorage.getItem(USER_PROFILE_CACHE_KEY);
    if (!profileJson) return null;

    return JSON.parse(profileJson) as UserProfile;
  } catch (error) {
    console.error("Error getting cached profile:", error);
    return null;
  }
}

function getCachedUserRole(): UserRole | null {
  try {
    const role = localStorage.getItem(USER_ROLE_CACHE_KEY) as UserRole;
    return role || null;
  } catch (error) {
    console.error("Error getting cached role:", error);
    return null;
  }
}

function clearUserCache(): void {
  localStorage.removeItem(USER_PROFILE_CACHE_KEY);
  localStorage.removeItem(USER_ROLE_CACHE_KEY);
}

// Clear all auth state including Supabase stored session
export async function clearAuthState(): Promise<void> {
  try {
    // Clear our custom storage
    clearUserCache();

    // Clear admin override
    localStorage.removeItem(ADMIN_OVERRIDE_KEY);
    localStorage.removeItem(ADMIN_OVERRIDE_EMAIL_KEY);
    localStorage.removeItem(ADMIN_OVERRIDE_EXPIRY_KEY);
    sessionStorage.removeItem(ADMIN_OVERRIDE_KEY);
    sessionStorage.removeItem(ADMIN_OVERRIDE_EMAIL_KEY);
    sessionStorage.removeItem(ADMIN_OVERRIDE_EXPIRY_KEY);

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

    // Clear any cookies related to auth
    document.cookie.split(";").forEach(function (c) {
      if (
        c.trim().startsWith("sb-") ||
        c.trim().startsWith("supabase-") ||
        c.includes("auth")
      ) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      }
    });

    console.log("Auth state cleared successfully");
  } catch (error) {
    console.error("Error clearing auth state:", error);
  }
}

// Special function to force josef as admin
export async function forceJosefAsAdmin(): Promise<AuthResult> {
  const email = "josef@holm.com";

  try {
    // 1. Update profile with admin client
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
        // Continue to try other methods
      }
    }

    // 2. Set admin override for 7 days
    enableAdminOverride(email, 24 * 7);

    // 3. Create profile if it doesn't exist using direct DB operations
    try {
      // Try to find user with matching email in profiles
      const { data: existingUsers } = await adminClient
        .from("profiles")
        .select("id")
        .eq("email", email);

      if (!existingUsers || existingUsers.length === 0) {
        // No profile exists, try to look up auth user differently
        const { data: authUsers } = await adminClient
          .from("auth.users")
          .select("id")
          .eq("email", email)
          .limit(1);

        if (authUsers && authUsers.length > 0) {
          // Found auth user, create profile
          await adminClient.from("profiles").insert({
            id: authUsers[0].id,
            email: email,
            role: "admin",
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          // Last resort - create new auth user and profile
          console.log(
            "No existing user found, would need to create new auth user",
          );
        }
      }
    } catch (upsertError) {
      console.error("Error upserting profile:", upsertError);
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
