import React, { createContext, useContext, ReactNode } from 'react';
import { Session, AuthError } from '@supabase/supabase-js';
import supabase from '@/lib/supabase';
import { useUser } from './UserContext';
import { User } from '@/types/custom-types';

// Define types
interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ data: any, error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create a context that adapts UserContext to the old SupabaseAuthContext
const SupabaseAuthContext = createContext<AuthContextType | undefined>(undefined);

// Adapter component that bridges UserContext to SupabaseAuthContext
export const SupabaseAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Use the new UserContext
  const { user, session, sessionLoaded } = useUser();
  
  // Check if user has admin role
  const isAdmin = user?.app_metadata?.role === 'admin' || 
                  user?.user_metadata?.isAdmin === true || 
                  user?.app_metadata?.is_admin === true || 
                  false;
  
  // Implement auth methods using Supabase client directly
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });
      return { error };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { error: error as AuthError };
    }
  };
  
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    } catch (error) {
      console.error('Error during sign in:', error);
      return { data: null, error: error as AuthError };
    }
  };
  
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };
  
  const refreshSession = async () => {
    try {
      await supabase.auth.refreshSession();
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };
  
  // Create the adapted context value
  const contextValue: AuthContextType = {
    session,
    user: user as User,
    isLoading: !sessionLoaded,
    isAdmin,
    signUp,
    signIn,
    signOut,
    refreshSession
  };
  
  return (
    <SupabaseAuthContext.Provider value={contextValue}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  
  return context;
};

export default SupabaseAuthContext;