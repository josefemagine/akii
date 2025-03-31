/**
 * Auth helper functions for handling Supabase authentication
 */

import { createClient, SupabaseClient, User, Session, PostgrestError } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Types
export type UserRole = 'user' | 'admin' | 'team_member';
export type UserStatus = 'active' | 'inactive' | 'banned';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse<T = any> {
  data: T | null;
  error: Error | PostgrestError | null;
}

// Create the Supabase clients
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || supabaseAnonKey;

// Standard client for user operations
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      "x-application-name": "akii-web-auth",
    },
  },
});

// Admin client for protected operations
export const adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      "x-application-name": "akii-web-admin",
    },
  },
});

// Backward compatibility
export const supabase = supabaseClient;

// Authentication functions
export async function signIn(email: string, password: string): Promise<AuthResponse<User>> {
  try {
    // Clear previous auth state
    await clearStoredAuth();
    
    // Sign in with Supabase
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    if (!data.user) throw new Error('No user returned after sign in');
    
    // Ensure profile exists
    await ensureUserProfile(data.user);
    
    return { data: data.user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { data: null, error: error as Error };
  }
}

export async function signOut(): Promise<AuthResponse> {
  try {
    // Clear all local storage related to auth
    await clearStoredAuth();
    
    // Sign out from Supabase
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    
    return { data: true, error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { data: null, error: error as Error };
  }
}

export async function getCurrentSession(): Promise<AuthResponse<Session>> {
  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    
    return { data: data.session, error: null };
  } catch (error) {
    console.error('Get session error:', error);
    return { data: null, error: error as Error };
  }
}

export async function getCurrentUser(): Promise<AuthResponse<User>> {
  try {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error) throw error;
    
    return { data: data.user, error: null };
  } catch (error) {
    console.error('Get user error:', error);
    return { data: null, error: error as Error };
  }
}

// User profile functions
export async function getUserProfile(userId: string): Promise<AuthResponse<UserProfile>> {
  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      // No data found is not a critical error
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      
      console.error('Error fetching user profile:', error.message);
      return { data: null, error };
    }
    
    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return { 
      data: null, 
      error: error instanceof Error 
        ? error 
        : new Error('An unexpected error occurred fetching the user profile')
    };
  }
}

export async function getUserProfileByEmail(email: string): Promise<AuthResponse<UserProfile>> {
  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      // No data found is not a critical error
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      
      console.error('Error fetching user profile by email:', error.message);
      return { data: null, error };
    }
    
    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error('Unexpected error fetching user profile by email:', error);
    return { 
      data: null, 
      error: error instanceof Error 
        ? error 
        : new Error('An unexpected error occurred fetching the user profile')
    };
  }
}

export async function ensureUserProfile(user: User): Promise<AuthResponse<UserProfile>> {
  try {
    // First check if profile exists
    const { data: existingProfile } = await getUserProfile(user.id);
    
    if (existingProfile) {
      return { data: existingProfile, error: null };
    }
    
    // If no profile exists, create one
    const newProfile: Partial<UserProfile> = {
      id: user.id,
      email: user.email || '',
      role: 'user',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabaseClient
      .from('profiles')
      .upsert(newProfile)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user profile:', error.message);
      return { data: null, error };
    }
    
    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error('Unexpected error ensuring user profile:', error);
    return { 
      data: null, 
      error: error instanceof Error 
        ? error 
        : new Error('An unexpected error occurred ensuring the user profile')
    };
  }
}

export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<AuthResponse<UserProfile>> {
  try {
    // Prevent updating protected fields
    const safeUpdates = { ...updates };
    delete safeUpdates.id;
    delete safeUpdates.role; // Use setUserRole for this
    delete safeUpdates.status; // Use setUserStatus for this
    
    // Add updated timestamp
    safeUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabaseClient
      .from('profiles')
      .update(safeUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error.message);
      return { data: null, error };
    }
    
    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error('Unexpected error updating user profile:', error);
    return { 
      data: null, 
      error: error instanceof Error 
        ? error 
        : new Error('An unexpected error occurred updating the user profile')
    };
  }
}

// Role management functions
export async function setUserRole(userId: string, role: UserRole): Promise<AuthResponse<UserProfile>> {
  try {
    // Use admin client to bypass RLS
    const { data, error } = await adminClient
      .from('profiles')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error setting user role:', error.message);
      return { data: null, error };
    }
    
    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error('Unexpected error setting user role:', error);
    return { 
      data: null, 
      error: error instanceof Error 
        ? error 
        : new Error('An unexpected error occurred setting the user role')
    };
  }
}

export async function setUserStatus(userId: string, status: UserStatus): Promise<AuthResponse<UserProfile>> {
  try {
    // Use admin client to bypass RLS
    const { data, error } = await adminClient
      .from('profiles')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error setting user status:', error.message);
      return { data: null, error };
    }
    
    return { data: data as UserProfile, error: null };
  } catch (error) {
    console.error('Unexpected error setting user status:', error);
    return { 
      data: null, 
      error: error instanceof Error 
        ? error 
        : new Error('An unexpected error occurred setting the user status')
    };
  }
}

// Database utility functions
export async function checkUserExists(email: string): Promise<AuthResponse<boolean>> {
  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return { data: !!data, error: null };
  } catch (error) {
    console.error('Check user exists error:', error);
    return { data: null, error: error as Error };
  }
}

export async function checkUserStatus(email: string): Promise<AuthResponse<UserStatus>> {
  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('status')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('User not found');
    
    return { data: data.status as UserStatus, error: null };
  } catch (error) {
    console.error('Check user status error:', error);
    return { data: null, error: error as Error };
  }
}

// Auth state helpers
export function clearStoredAuth(): void {
  try {
    // Clear Supabase tokens
    localStorage.removeItem('sb-access-token');
    localStorage.removeItem('sb-refresh-token');
    localStorage.removeItem('supabase.auth.token');
    
    // Clear auth state flags
    localStorage.removeItem('auth-in-progress');
    localStorage.removeItem('auth-in-progress-time');
    
    // Clear any debug tokens
    localStorage.removeItem('debug-access-token');
    localStorage.removeItem('debug-refresh-token');
    
    // Clear admin overrides
    localStorage.removeItem('admin_override');
    localStorage.removeItem('admin_override_email');
    localStorage.removeItem('admin_override_time');
    localStorage.removeItem('akii_admin_override');
    localStorage.removeItem('akii_admin_override_email');
    localStorage.removeItem('akii_admin_override_expiry');
    
    // Clear session storage as well
    sessionStorage.removeItem('admin_override');
    sessionStorage.removeItem('admin_override_email');
    sessionStorage.removeItem('admin_override_time');
    sessionStorage.removeItem('akii_admin_override');
    sessionStorage.removeItem('akii_admin_override_email');
    sessionStorage.removeItem('akii_admin_override_expiry');
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
}

// Synchronize users - ensure auth.users are in profiles table
export async function syncUserProfiles(): Promise<AuthResponse<{ created: number, updated: number }>> {
  try {
    // Get all auth users using admin client
    const { data: authUsers, error: authError } = await adminClient
      .auth.admin.listUsers();
    
    if (authError) throw authError;
    if (!authUsers?.users) throw new Error('No users returned from auth.admin.listUsers');
    
    let created = 0;
    let updated = 0;
    
    // Process each auth user
    for (const user of authUsers.users) {
      if (!user.id || !user.email) continue;
      
      // Check if profile exists
      const { data: existingProfile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (!existingProfile) {
        // Create new profile
        const { error: insertError } = await adminClient
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            role: 'user',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (!insertError) created++;
      } else {
        // Update email if needed
        const { error: updateError } = await adminClient
          .from('profiles')
          .update({
            email: user.email,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (!updateError) updated++;
      }
    }

    return {
      data: { created, updated }, 
      error: null 
    };
  } catch (error) {
    console.error('Sync user profiles error:', error);
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
    service: false
  };
  
  try {
    // Test basic connection
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError) {
      return {
        success: false,
        message: `Failed to connect to Supabase: ${sessionError.message}`,
        details
      };
    }
    
    details.connection = true;
    
    // Check if profile table exists by attempting a count
    try {
      const { count, error: countError } = await supabaseClient
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        return {
          success: false,
          message: `Connected to Supabase but profiles table may not exist: ${countError.message}`,
          details
        };
      }
      
      details.profile = true;
      
      // Test service role connection
      const { error: adminError } = await adminClient
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (adminError) {
        return {
          success: false,
          message: `Connected to Supabase but service role access failed: ${adminError.message}`,
          details: { ...details, service: false }
        };
      }
      
      details.service = true;
      
      return {
        success: true,
        message: 'Supabase connection and configuration verified successfully!',
        details
      };
    } catch (error) {
      return {
        success: false,
        message: `Error verifying profiles table: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to verify Supabase connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details
    };
  }
}
