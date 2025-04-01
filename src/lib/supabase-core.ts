/**
 * DEPRECATED: Legacy compatibility layer.
 * Import from supabase-singleton.ts or auth-helpers.ts directly.
 */

// Import from supabase-singleton
import { 
  supabase,
  supabaseAdmin, 
  auth,
  getSupabaseClient,
  getAdminClient,
  getAuth,
  debugSupabaseInstances
} from "./supabase-singleton";

// Import from auth-helpers
import {
  // User functions
  getCurrentUser,
  getCurrentSession,
  getUserProfile,
  ensureUserProfile,
  updateUserProfile,
  setUserRole,
  setUserStatus,
  
  // Types
  type UserProfile,
  type UserRole,
  type UserStatus,
  type AuthResponse
} from "./auth-helpers";

// Add the missing function that's causing the error
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

// Re-export everything
export {
  // Clients
  supabase,
  supabaseAdmin,
  auth,
  getSupabaseClient,
  getAdminClient,
  getAuth,
  debugSupabaseInstances,
  
  // User functions
  getCurrentUser,
  getCurrentSession,
  getUserProfile,
  ensureUserProfile,
  updateUserProfile,
  setUserRole,
  setUserStatus,
  
  // Types
  type UserProfile,
  type UserRole,
  type UserStatus,
  type AuthResponse
};

// Default export
export default supabase;
