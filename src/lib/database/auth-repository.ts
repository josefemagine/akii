/**
 * Auth Repository
 * 
 * Handles all authentication-related database operations using the Supabase REST API
 */

import { supabase } from '@/lib/supabase';
import { DatabaseService } from './index';
import type { Profile } from '@/types/auth';
import type { User, Session } from '@supabase/supabase-js';

export class AuthRepository {
  /**
   * Get the current session
   */
  static async getSession(): Promise<{
    session: Session | null;
    user: User | null;
    error?: Error;
  }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[AuthRepository] Error getting session:', error);
        return { session: null, user: null, error };
      }
      
      return { 
        session: data.session,
        user: data.session?.user || null
      };
    } catch (err) {
      console.error('[AuthRepository] Exception getting session:', err);
      const error = err instanceof Error ? err : new Error('Unknown error getting session');
      return { session: null, user: null, error };
    }
  }
  
  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string): Promise<{
    session: Session | null;
    user: User | null;
    error?: Error;
  }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('[AuthRepository] Error during sign in:', error);
        return { session: null, user: null, error };
      }
      
      return {
        session: data.session,
        user: data.user
      };
    } catch (err) {
      console.error('[AuthRepository] Exception during sign in:', err);
      const error = err instanceof Error ? err : new Error('Unknown error during sign in');
      return { session: null, user: null, error };
    }
  }
  
  /**
   * Sign up with email and password
   */
  static async signUp(
    email: string, 
    password: string, 
    metadata?: any
  ): Promise<{
    session: Session | null;
    user: User | null;
    error?: Error;
  }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {
            first_name: email.split('@')[0],
            last_name: ''
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('[AuthRepository] Error during sign up:', error);
        return { session: null, user: null, error };
      }
      
      return {
        session: data.session,
        user: data.user
      };
    } catch (err) {
      console.error('[AuthRepository] Exception during sign up:', err);
      const error = err instanceof Error ? err : new Error('Unknown error during sign up');
      return { session: null, user: null, error };
    }
  }
  
  /**
   * Sign out the current user
   */
  static async signOut(): Promise<{ error?: Error }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[AuthRepository] Error during sign out:', error);
        return { error };
      }
      
      return {};
    } catch (err) {
      console.error('[AuthRepository] Exception during sign out:', err);
      const error = err instanceof Error ? err : new Error('Unknown error during sign out');
      return { error };
    }
  }
  
  /**
   * Refresh the current session
   */
  static async refreshSession(): Promise<{
    session: Session | null;
    user: User | null;
    error?: Error;
  }> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('[AuthRepository] Error refreshing session:', error);
        return { session: null, user: null, error };
      }
      
      return {
        session: data.session,
        user: data.user
      };
    } catch (err) {
      console.error('[AuthRepository] Exception refreshing session:', err);
      const error = err instanceof Error ? err : new Error('Unknown error refreshing session');
      return { session: null, user: null, error };
    }
  }
  
  /**
   * Check if user is an admin
   */
  static async isUserAdmin(userId: string): Promise<boolean> {
    try {
      // First check if user is the special admin user
      if (userId === 'b574f273-e0e1-4cb8-8c98-f5a7569234c8') {
        return true;
      }
      
      // Check the profile for admin status
      const profile = await DatabaseService.getById<Profile>('profiles', userId);
      return profile?.is_admin === true || profile?.role === 'admin';
    } catch (err) {
      console.error('[AuthRepository] Error checking admin status:', err);
      return false;
    }
  }
  
  /**
   * Get the latest user profile
   */
  static async getUserProfile(userId: string): Promise<Profile | null> {
    return DatabaseService.getUserProfile(userId);
  }
  
  /**
   * Ensure a user profile exists, creating one if needed
   */
  static async ensureProfileExists(
    userId: string,
    email: string,
    role: string = 'user',
    status: string = 'active'
  ): Promise<Profile | null> {
    try {
      // Try to get the profile first
      const profile = await this.getUserProfile(userId);
      
      if (profile) {
        return profile;
      }
      
      // If profile doesn't exist, create one
      return await DatabaseService.callFunction<Profile>('ensure_profile_exists', {
        user_id: userId,
        user_email: email,
        user_role: role,
        user_status: status
      });
    } catch (err) {
      console.error('[AuthRepository] Error ensuring profile exists:', err);
      return null;
    }
  }
  
  /**
   * Update a user's profile
   */
  static async updateProfile(
    userId: string,
    updates: Partial<Profile>
  ): Promise<Profile | null> {
    return DatabaseService.updateItem<Profile>('profiles', userId, updates);
  }
  
  /**
   * Set a user as admin
   */
  static async setUserAsAdmin(userId: string): Promise<boolean> {
    try {
      const result = await DatabaseService.callFunction<boolean>('set_user_as_admin', {
        user_id: userId
      });
      
      // Ensure we return a boolean value
      return result === true;
    } catch (err) {
      console.error('[AuthRepository] Error setting user as admin:', err);
      return false;
    }
  }
} 