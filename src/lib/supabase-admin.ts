/**
 * Supabase admin client export
 * This file re-exports the centralized admin client from auth-core
 * to maintain backward compatibility with existing imports
 */

import { supabaseAdmin } from "./auth-core";

export { supabaseAdmin };

// Re-export functions for backward compatibility
import { getUserProfile, syncUserProfile, setUserRole } from "./auth-core";

// Function to get user role directly from database
export async function getUserRole(email: string) {
  try {
    if (!supabaseAdmin) {
      throw new Error("Admin client not available");
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("email", email)
      .single();

    if (error) throw error;
    return { role: data?.role || null, error: null };
  } catch (error) {
    console.error("Error getting user role:", error);
    return { role: null, error };
  }
}

// Function to fetch all users
export async function getAllUsers() {
  try {
    if (!supabaseAdmin) {
      throw new Error("Admin client not available");
    }

    // Get users from profiles table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*");

    if (profileError) throw profileError;

    return { users: profileData || [], error: null };
  } catch (error) {
    console.error("Error fetching all users:", error);
    return { users: [], error };
  }
}

// Update the setUserAsAdmin function to be more resilient
export async function setUserAsAdmin(email: string) {
  try {
    if (!supabaseAdmin) {
      throw new Error("Admin client not available");
    }

    // First try with the admin client
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ role: "admin" })
      .eq("email", email)
      .select();

    if (error) {
      console.error("Error with admin client:", error);

      // Try with direct insert as fallback
      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({ email, role: "admin" })
        .select();

      // Ignore duplicate errors
      if (insertError && !insertError.message.includes("duplicate key")) {
        throw insertError;
      }

      // Check if update succeeded despite error
      const { data: checkData, error: checkError } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("email", email)
        .single();

      if (checkError) throw checkError;

      if (checkData?.role === "admin") {
        return { success: true, data: [checkData], error: null };
      } else {
        throw new Error("Failed to set admin role with all methods");
      }
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error("Error setting user as admin:", error);
    return { success: false, data: null, error };
  }
}

/**
 * Get users from auth schema using the service role
 */
export async function getAuthUsers() {
  try {
    if (!supabaseAdmin) {
      throw new Error("Admin client not available");
    }

    // First try the admin API
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("Failed to fetch users with admin API:", error);
      // Fall back to getting users from auth schema directly if available (needs proper permissions)
      try {
        // Try direct SQL query if you have permissions (requires enabling postgres extensions)
        const { data: userData, error: userError } =
          await supabaseAdmin.rpc("get_auth_users");

        if (userError) {
          console.error("Failed to fetch users with RPC:", userError);
          return { data: null, error: userError };
        }

        return { data: userData, error: null };
      } catch (rpcError) {
        console.error("RPC call failed:", rpcError);
        return { data: null, error: rpcError };
      }
    }

    return { data, error: null };
  } catch (err) {
    console.error("Error in getAuthUsers:", err);
    return { data: null, error: err };
  }
}
