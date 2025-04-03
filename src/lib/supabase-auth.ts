import { supabase } from '@/lib/supabase-singleton';
import type { User, Session } from '@supabase/supabase-js';
import { getSessionSafely } from '@/lib/auth-lock-fix';

// Types
export { User, Session };

export interface UserProfile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  role?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse<T> {
  data: T | null;
  error: Error | null;
}

// Authentication functions
export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: metadata
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { data: null, error: error as Error };
  }
}

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
    return { data: null, error: error as Error };
  }
}

export async function signInWithOAuth(provider: 'google' | 'github') {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Sign in with ${provider} error:`, error);
    return { data: null, error: error as Error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error as Error };
  }
}

export async function resetPasswordForEmail(email: string) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Reset password error:', error);
    return { data: null, error: error as Error };
  }
}

export async function updatePassword(password: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Update password error:', error);
    return { data: null, error: error as Error };
  }
}

// Session management
export async function getCurrentSession() {
  try {
    const { data, error } = await getSessionSafely();
    if (error) throw error;
    return { data: data.session, error: null };
  } catch (error) {
    console.error('Get session error:', error);
    return { data: null, error: error as Error };
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { data: data.user, error: null };
  } catch (error) {
    console.error('Get user error:', error);
    return { data: null, error: error as Error };
  }
}

// User profile management
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Get profile error:', error);
      
      // Check for infinite recursion in RLS policy error
      if (error.message?.includes('infinite recursion') || error.code === '42P17') {
        console.warn('RLS policy error detected. Using fallback profile strategy.');
        
        // Get current user to extract metadata
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          // Create a minimal profile from user metadata
          const fallbackProfile = {
            id: userId,
            email: userData.user.email,
            first_name: userData.user.user_metadata?.first_name || userData.user.user_metadata?.full_name || userData.user.user_metadata?.name,
            last_name: userData.user.user_metadata?.last_name,
            company: userData.user.user_metadata?.company,
            avatar_url: userData.user.user_metadata?.avatar_url || userData.user.user_metadata?.picture,
            role: 'user', // Default role
            status: 'active',
            created_at: userData.user.created_at,
            updated_at: userData.user.updated_at
          };
          
          return { data: fallbackProfile, error: null };
        }
      }
      
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Get profile error:', error);
    return { data: null, error: error as Error };
  }
}

export async function updateUserProfile(profile: Partial<UserProfile>) {
  try {
    if (!profile.id) {
      const { data: user } = await getCurrentUser();
      if (!user) throw new Error('No authenticated user');
      profile.id = user.id;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', profile.id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Update profile error:', error);
    return { data: null, error: error as Error };
  }
}

// Utility to ensure a user profile exists
export async function ensureUserProfile(user: { id: string; email?: string }) {
  try {
    // First check if profile exists
    const { data: existingProfile, error: getError } = await getUserProfile(user.id);
    
    if (existingProfile) {
      return { data: existingProfile, error: null };
    }
    
    // If there's an infinite recursion error, we've already tried to create a fallback profile
    // in getUserProfile, so we should return that instead of trying again
    if (getError && (getError.message?.includes('infinite recursion') || 
                     (getError as any)?.code === '42P17')) {
      console.warn('Skipping profile creation due to RLS policy error');
      
      // Get user data to create fallback profile
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const fallbackProfile = {
          id: user.id,
          email: user.email || userData.user.email,
          first_name: userData.user.user_metadata?.first_name || userData.user.user_metadata?.full_name || userData.user.user_metadata?.name,
          last_name: userData.user.user_metadata?.last_name,
          company: userData.user.user_metadata?.company,
          avatar_url: userData.user.user_metadata?.avatar_url || userData.user.user_metadata?.picture,
          role: 'user',
          status: 'active',
          created_at: userData.user.created_at,
          updated_at: userData.user.updated_at
        };
        
        return { data: fallbackProfile, error: null };
      }
      
      return { data: null, error: getError };
    }
    
    // Create profile if it doesn't exist or if we failed to get it for other reasons
    const newProfile: Partial<UserProfile> = {
      id: user.id,
      email: user.email,
      role: 'user',
      status: 'active',
      created_at: new Date().toISOString()
    };
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();
        
      if (error) throw error;
      return { data, error: null };
    } catch (insertError) {
      console.error('Error creating profile:', insertError);
      
      // If insert fails due to RLS policy, return fallback profile
      if (insertError instanceof Error && 
          (insertError.message?.includes('infinite recursion') || 
          (insertError as any)?.code === '42P17')) {
        
        // Get user data for fallback
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const fallbackProfile = {
            id: user.id,
            email: user.email || userData.user.email,
            first_name: userData.user.user_metadata?.first_name || userData.user.user_metadata?.full_name || userData.user.user_metadata?.name,
            last_name: userData.user.user_metadata?.last_name,
            company: userData.user.user_metadata?.company,
            avatar_url: userData.user.user_metadata?.avatar_url || userData.user.user_metadata?.picture,
            role: 'user',
            status: 'active',
            created_at: userData.user.created_at,
            updated_at: userData.user.updated_at
          };
          
          return { data: fallbackProfile, error: null };
        }
      }
      
      return { data: null, error: insertError as Error };
    }
  } catch (error) {
    console.error('Ensure profile error:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Check if a user is an admin by directly querying the profiles table
 * This provides a reliable way to check admin status even when the profile object isn't available
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    if (!userId) return false;
    
    // First try getting the profile from the database
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    // Check if the role field is 'admin'
    return data?.role === 'admin';
  } catch (e) {
    console.error('Exception checking admin status:', e);
    return false;
  }
} 