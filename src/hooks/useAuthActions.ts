import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { clearSession, dispatchAuthError, saveUserProfile } from '@/utils/auth';

// Debug logger
const log = (...args: any[]) => console.log('[useAuthActions]', ...args);

interface SignInOptions {
  email: string;
  password: string;
  redirectTo?: string;
}

interface SignUpOptions {
  email: string;
  password: string;
  metadata?: Record<string, any>;
  redirectTo?: string;
}

interface PasswordResetOptions {
  email: string;
  redirectTo?: string;
}

interface AuthActionResult {
  success: boolean;
  error: Error | null;
  data?: any;
}

/**
 * Custom hook providing authentication action methods
 */
export function useAuthActions() {
  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (options: SignInOptions): Promise<AuthActionResult> => {
    try {
      log('Signing in user with email', options.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: options.email,
        password: options.password,
      });
      
      if (error) {
        log('Sign in error:', error);
        dispatchAuthError(error, 'signIn');
        return { success: false, error };
      }
      
      log('Sign in successful');
      return { success: true, error: null, data };
    } catch (err) {
      log('Exception during sign in:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      dispatchAuthError(error, 'signIn');
      return { success: false, error };
    }
  }, []);

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(async (options: SignUpOptions): Promise<AuthActionResult> => {
    try {
      log('Signing up user with email', options.email);
      
      const { data, error } = await supabase.auth.signUp({
        email: options.email,
        password: options.password,
        options: {
          data: options.metadata,
          emailRedirectTo: options.redirectTo
        }
      });
      
      if (error) {
        log('Sign up error:', error);
        dispatchAuthError(error, 'signUp');
        return { success: false, error };
      }
      
      // Create a basic profile for the new user if sign-up was successful and confirmed
      if (data?.user && data.user.id && !data.user.email_confirmed_at) {
        try {
          // Create basic profile
          await saveUserProfile(data.user.id, {
            id: data.user.id,
            email: data.user.email,
            role: 'user',
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } catch (profileErr) {
          log('Error creating initial profile during sign-up:', profileErr);
          // Don't fail the signup because of profile creation error
        }
      }
      
      log('Sign up successful');
      return { success: true, error: null, data };
    } catch (err) {
      log('Exception during sign up:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      dispatchAuthError(error, 'signUp');
      return { success: false, error };
    }
  }, []);

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    try {
      log('Signing out user');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        log('Sign out error:', error);
        dispatchAuthError(error, 'signOut');
        return { success: false, error };
      }
      
      // Clear session from localStorage
      clearSession();
      
      log('Sign out successful');
      return { success: true, error: null };
    } catch (err) {
      log('Exception during sign out:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      dispatchAuthError(error, 'signOut');
      return { success: false, error };
    }
  }, []);

  /**
   * Send a password reset email
   */
  const resetPassword = useCallback(async (options: PasswordResetOptions): Promise<AuthActionResult> => {
    try {
      log('Sending password reset email to', options.email);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        options.email,
        { redirectTo: options.redirectTo }
      );
      
      if (error) {
        log('Password reset error:', error);
        dispatchAuthError(error, 'resetPassword');
        return { success: false, error };
      }
      
      log('Password reset email sent successfully');
      return { success: true, error: null, data };
    } catch (err) {
      log('Exception during password reset:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      dispatchAuthError(error, 'resetPassword');
      return { success: false, error };
    }
  }, []);

  /**
   * Update the current user's password
   */
  const updatePassword = useCallback(async (newPassword: string): Promise<AuthActionResult> => {
    try {
      log('Updating user password');
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        log('Update password error:', error);
        dispatchAuthError(error, 'updatePassword');
        return { success: false, error };
      }
      
      log('Password updated successfully');
      return { success: true, error: null, data };
    } catch (err) {
      log('Exception during password update:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      dispatchAuthError(error, 'updatePassword');
      return { success: false, error };
    }
  }, []);

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  };
} 