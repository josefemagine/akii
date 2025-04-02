/**
 * Authentication Helper Functions
 * Provides simplified access to Supabase authentication methods
 */

import { supabase } from './supabase-singleton';

// Define types needed for the response format
export type AuthResponse<T> = {
  data: T | null;
  error: Error | null;
};

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

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { data: null, error };
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { data: null, error };
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
}

/**
 * Get the current user session
 */
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { data: data.session, error: null };
  } catch (error) {
    console.error('Get session error:', error);
    return { data: null, error };
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { data: data.user, error: null };
  } catch (error) {
    console.error('Get user error:', error);
    return { data: null, error };
  }
}

/**
 * Reset password for email
 */
export async function resetPasswordForEmail(email: string) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Reset password error:', error);
    return { data: null, error };
  }
}

/**
 * Update the current user's password
 */
export async function updatePassword(password: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Update password error:', error);
    return { data: null, error };
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