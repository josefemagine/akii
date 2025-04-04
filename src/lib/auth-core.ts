/**
 * CORE AUTH UTILITIES
 * Simplified helpers for auth-related data extraction
 */
import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';
import { supabase, auth } from './supabase-singleton';
import { 
  signIn, 
  signUp, 
  signOut, 
  resetPasswordForEmail as resetPassword, 
  updatePassword,
  getCurrentSession,
  getCurrentUser,
  getUserProfile,
  ensureUserProfile,
  updateUserProfile,
  setUserRole,
  setUserStatus,
  verifySupabaseConnection
} from './auth-helpers';
import { signInWithOAuth } from './supabase-auth';

// Re-export types
export type User = SupabaseUser;
export type Session = SupabaseSession;

export type UserRole = "user" | "admin" | "moderator" | "owner" | "editor" | null;
export type UserStatus = "active" | "inactive" | "suspended" | "pending" | null;

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  first_name?: string;
  last_name?: string;
  company?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  theme_preference?: string;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

// Auth override helpers
export function hasValidAdminOverride(user: User | string | null): boolean {
  if (!user) return false;
  
  let email: string | null = null;
  
  // Handle both User object and email string
  if (typeof user === 'string') {
    email = user;
  } else {
    // User object may have undefined email, handle it safely
    email = user.email || null;
  }
  
  // Check local storage for admin override
  const override = localStorage.getItem('akii_admin_override') === 'true';
  const storedEmail = localStorage.getItem('akii_admin_override_email');
  
  // Check if override is valid
  return override && storedEmail === email;
}

// Wrapper for verifySupabaseConnection that returns the expected format
export async function verifyConnection(): Promise<{ 
  success: boolean; 
  message: string; 
  details: Record<string, boolean>; 
}> {
  try {
    const result = await verifySupabaseConnection();
    
    return {
      success: result.success,
      message: result.success 
        ? `Connection successful (${result.latency}ms)` 
        : `Connection failed${result.error ? ': ' + result.error.message : ''}`,
      details: {
        connected: result.success,
        sessionExists: result.sessionExists || false,
        hasError: !!result.error
      }
    };
  } catch (error) {
    console.error('Error in verifyConnection:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown connection error',
      details: {
        connected: false,
        error: true
      }
    };
  }
}

// Storage cleanup
export function clearStoredAuth() {
  // Clear auth-related items from localStorage
  try {
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('akii_admin_override');
    localStorage.removeItem('akii_admin_override_email');
    localStorage.removeItem('akii-auth-token');
    localStorage.removeItem('akii-auth-user');
  } catch (e) {
    console.error('Error clearing stored auth:', e);
  }
}

/**
 * Extract user profile data from various potential sources in the User object
 */
export function extractUserProfileData(user: User | null): { 
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  avatarUrl: string | null;
  id: string | null;
} {
  if (!user) {
    return { 
      firstName: null, 
      lastName: null, 
      email: null, 
      avatarUrl: null,
      id: null
    };
  }

  // Get user metadata from various possible locations
  const userMeta = user.user_metadata || {};
  const rawMeta = (user as any)._rawData?.raw_user_meta_data || 
                 (user as any).raw_user_meta_data || {};
  
  return {
    firstName: userMeta.first_name || rawMeta.first_name || null,
    lastName: userMeta.last_name || rawMeta.last_name || null,
    email: user.email || null,
    avatarUrl: userMeta.avatar_url || null,
    id: user.id || null
  };
}

/**
 * Helper function to safely get local storage auth data
 */
export function getLocalStorageAuthData(): {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  id: string | null;
} {
  try {
    const fallbackUserStr = localStorage.getItem("akii-auth-fallback-user");
    if (fallbackUserStr) {
      const fallbackData = JSON.parse(fallbackUserStr);
      return {
        firstName: fallbackData.first_name || null,
        lastName: fallbackData.last_name || null,
        email: fallbackData.email || null,
        id: fallbackData.id || null
      };
    }
  } catch (e) {
    console.error("Error parsing fallback user data:", e);
  }
  
  return {
    firstName: null,
    lastName: null,
    email: null,
    id: null
  };
}

// Re-export everything from auth helpers
export {
  signIn,
  signUp,
  signOut,
  signInWithOAuth,
  resetPassword,
  updatePassword,
  getCurrentSession,
  getCurrentUser,
  getUserProfile,
  ensureUserProfile,
  updateUserProfile,
  setUserRole,
  setUserStatus,
  verifySupabaseConnection,
  supabase,
  auth
};

export default {
  extractUserProfileData,
  getLocalStorageAuthData,
  hasValidAdminOverride,
  clearStoredAuth,
  signIn,
  signUp,
  signOut,
  signInWithOAuth,
  resetPassword,
  updatePassword
}; 