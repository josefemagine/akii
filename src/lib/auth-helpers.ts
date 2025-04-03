/**
 * Authentication Helper Functions
 * Provides simplified access to Supabase authentication methods
 */

import { supabase } from './supabase-singleton';
import type { User, Session } from '@supabase/supabase-js';
import { 
  withAuthLock, 
  getSessionSafely, 
  getUserSafely, 
  signOutSafely,
  signInWithEmailSafely,
  signUpSafely
} from './auth-lock-fix';

// Define types needed for the response format
export type AuthResponse<T> = {
  data: T | null;
  error: Error | null;
};

// Supabase response types
type SupabaseSignInResponse = { data: { user: User | null; session: Session | null }, error: Error | null };
type SupabaseSignUpResponse = { data: { user: User | null; session: Session | null }, error: Error | null };

// User profile related types
export type UserRole = 'user' | 'admin' | 'moderator';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role?: UserRole;
  status?: UserStatus;
  created_at?: string;
  updated_at?: string;
}

// Error handling for auth errors
function handleAuthError(error: any): Error {
  if (!error) return new Error('Unknown error');
  
  // Extract the error message from various formats
  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message || error.error_description || JSON.stringify(error);
  
  console.error(`Auth error: ${errorMessage}`);
  
  // Check for specific error types
  if (typeof errorMessage === 'string') {
    if (errorMessage.includes('Email not confirmed')) {
      return new Error('Please check your email to confirm your account before signing in.');
    }
    
    if (errorMessage.includes('Invalid login credentials')) {
      return new Error('Invalid email or password. Please try again.');
    }
    
    if (errorMessage.includes('User already registered')) {
      return new Error('An account with this email already exists. Please sign in instead.');
    }
    
    if (errorMessage.includes('flow_state_not_found') || errorMessage.includes('PKCE flow')) {
      return new Error('Authentication flow expired. Please try signing in again.');
    }
    
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return new Error('Too many attempts. Please wait a moment and try again.');
    }
  }
  
  // Return the original error or a generic message
  return error instanceof Error ? error : new Error(errorMessage || 'Authentication error');
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  try {
    const result = await signInWithEmailSafely(email, password) as SupabaseSignInResponse;

    if (result.error) throw result.error;
    return { data: result.data, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { data: null, error: handleAuthError(error) };
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  try {
    const result = await signUpSafely(email, password, metadata) as SupabaseSignUpResponse;

    if (result.error) throw result.error;
    return { data: result.data, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { data: null, error: handleAuthError(error) };
  }
}

/**
 * Sign out the current user
 * Supports different scopes:
 * - global (default): terminates all sessions for the user
 * - local: terminates only the current session
 * - others: terminates all sessions except the current one
 */
export async function signOut(scope: 'global' | 'local' | 'others' = 'global') {
  try {
    // First try to clear token from browser storage for immediate UI feedback
    try {
      // Find tokens in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase.auth.token') || key.includes('sb-'))) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Error clearing local tokens:', e);
    }
    
    // Call the official signOut method with the specified scope
    const { error } = await signOutSafely({ scope });
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Sign out error (scope: ${scope}):`, error);
    return { error: handleAuthError(error) };
  }
}

/**
 * Get the current user session
 */
export async function getCurrentSession() {
  try {
    const { data, error } = await getSessionSafely();
    if (error) throw error;
    return { data: data.session, error: null };
  } catch (error) {
    console.error('Get session error:', error);
    return { data: null, error: handleAuthError(error) };
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await getUserSafely();
    if (error) throw error;
    return { data: data.user, error: null };
  } catch (error) {
    console.error('Get user error:', error);
    return { data: null, error: handleAuthError(error) };
  }
}

/**
 * Exchange auth code for session in PKCE flow
 */
export async function exchangeCodeForSession(code: string) {
  try {
    type CodeExchangeResponse = { data: { session: Session }, error: Error | null };
    
    const result = await withAuthLock(
      () => supabase.auth.exchangeCodeForSession(code),
      'exchangeCodeForSession'
    ) as CodeExchangeResponse;
    
    if (result.error) throw result.error;
    return { data: result.data, error: null };
  } catch (error) {
    console.error('Exchange code error:', error);
    return { data: null, error: handleAuthError(error) };
  }
}

/**
 * Reset password for email
 */
export async function resetPasswordForEmail(email: string) {
  try {
    type ResetPasswordResponse = { data: any, error: Error | null };
    
    const result = await withAuthLock(
      () => supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`
      }),
      'resetPassword'
    ) as ResetPasswordResponse;

    if (result.error) throw result.error;
    return { data: result.data, error: null };
  } catch (error) {
    console.error('Reset password error:', error);
    return { data: null, error: handleAuthError(error) };
  }
}

/**
 * Update the current user's password
 */
export async function updatePassword(password: string) {
  try {
    type UpdatePasswordResponse = { data: { user: User }, error: Error | null };
    
    const result = await withAuthLock(
      () => supabase.auth.updateUser({ password }),
      'updatePassword'
    ) as UpdatePasswordResponse;
    
    if (result.error) throw result.error;
    return { data: result.data, error: null };
  } catch (error) {
    console.error('Update password error:', error);
    return { data: null, error: handleAuthError(error) };
  }
}

/**
 * Get a user's profile
 */
export async function getUserProfile(userId: string): Promise<AuthResponse<UserProfile>> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error('Get user profile error:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Ensure a user profile exists, creating it if needed
 */
export async function ensureUserProfile(userId: string, email?: string): Promise<AuthResponse<UserProfile>> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // First check if profile exists
    const { data: existingProfile, error: checkError } = await getUserProfile(userId);

    if (checkError) throw checkError;

    // If profile exists, return it
    if (existingProfile) {
      return { data: existingProfile, error: null };
    }

    // Otherwise create a new profile
    const newProfile: UserProfile = {
      id: userId,
      email: email || '',
      role: 'user',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('profiles')
      .insert(newProfile);

    if (insertError) throw insertError;

    return { data: newProfile, error: null };
  } catch (error) {
    console.error('Ensure user profile error:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Update a user's profile
 */
export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<AuthResponse<UserProfile>> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Add updated_at timestamp
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error('Update user profile error:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Set a user's role
 */
export async function setUserRole(
  userId: string, 
  role: UserRole
): Promise<AuthResponse<UserProfile>> {
  return updateUserProfile(userId, { role });
}

/**
 * Set a user's status
 */
export async function setUserStatus(
  userId: string, 
  status: UserStatus
): Promise<AuthResponse<UserProfile>> {
  return updateUserProfile(userId, { status });
}

/**
 * Verify the connection to Supabase
 */
export async function verifySupabaseConnection() {
  try {
    const start = Date.now();
    const { data, error } = await supabase.auth.getSession();
    const latency = Date.now() - start;
    
    return {
      success: !error,
      latency,
      sessionExists: !!data?.session,
      error: error ? error.message : null
    };
  } catch (error) {
    return {
      success: false,
      latency: 0,
      sessionExists: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 