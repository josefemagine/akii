import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, AuthError } from '@supabase/supabase-js';
import supabase from '@/lib/supabase-client';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { User, UserRole } from '@/types/custom-types';

// Declare global window property for circuit breaker state
declare global {
  interface Window {
    circuitBroken?: boolean;
  }
}

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

// Create the auth context
const SupabaseAuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the auth provider component
export const SupabaseAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Function to check if a user has admin privileges
  const checkUserAdmin = async (userId: string) => {
    try {
      // Query a profiles/users table to check admin status
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      // Set admin status based on role field
      const isAdminUser = data?.role === 'admin';
      setIsAdmin(isAdminUser);
      
      return isAdminUser;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  // Function to fetch user subscription data
  const fetchUserSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Exception fetching subscription:', error);
      return null;
    }
  };

  // Fetch the initial session and setup auth state listener
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        // If we have a session and user, set user and check admin status
        if (session?.user) {
          // Cast to our custom User type
          const currentUser = session.user as User;
          
          // Check admin status
          await checkUserAdmin(currentUser.id);
          
          // Fetch and add subscription data
          const subscription = await fetchUserSubscription(currentUser.id);
          if (subscription) {
            currentUser.subscription = subscription;
          }
          
          setUser(currentUser);
        } else {
          setUser(null);
        }
        
        // Listen for auth changes
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);
            setSession(session);
            
            if (session?.user) {
              // Cast to our custom User type
              const currentUser = session.user as User;
              
              // Check admin status
              await checkUserAdmin(currentUser.id);
              
              // Fetch and add subscription data
              const subscription = await fetchUserSubscription(currentUser.id);
              if (subscription) {
                currentUser.subscription = subscription;
              }
              
              setUser(currentUser);
              
              // SYNC: Set the login state for DirectAuth to detect
              const currentTimestamp = Date.now();
              const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
              const expiryTimestamp = currentTimestamp + sessionDuration;
              
              localStorage.setItem('akii-is-logged-in', 'true');
              localStorage.setItem('akii-auth-user-id', currentUser.id);
              localStorage.setItem('akii-login-timestamp', currentTimestamp.toString());
              localStorage.setItem('akii-session-duration', sessionDuration.toString());
              localStorage.setItem('akii-session-expiry', expiryTimestamp.toString());
              localStorage.setItem('akii-auth-user-email', currentUser.email || '');
              
              // Dispatch an event to notify DirectAuth of the change
              const loginEvent = new CustomEvent('akii-login-state-changed', { 
                detail: { isLoggedIn: true, userId: currentUser.id }
              });
              window.dispatchEvent(loginEvent);
            } else {
              setUser(null);
              setIsAdmin(false);
              
              // SYNC: Clear DirectAuth state
              localStorage.removeItem('akii-is-logged-in');
              localStorage.removeItem('akii-auth-user-id');
              localStorage.removeItem('akii-login-timestamp');
              localStorage.removeItem('akii-session-duration');
              localStorage.removeItem('akii-session-expiry');
              localStorage.removeItem('akii-auth-user-email');
              
              // Dispatch an event to notify DirectAuth of the change
              const logoutEvent = new CustomEvent('akii-login-state-changed', { 
                detail: { isLoggedIn: false }
              });
              window.dispatchEvent(logoutEvent);
            }
            
            // Handle specific auth events
            if (event === 'SIGNED_OUT') {
              console.log('User signed out');
            } else if (event === 'SIGNED_IN') {
              console.log('User signed in');
              // Redirect to dashboard on sign in
              const destination = 
                location.state?.from || 
                sessionStorage.getItem('redirectAfterLogin') || 
                '/dashboard';
                
              // Clear any stored redirect
              sessionStorage.removeItem('redirectAfterLogin');
              
              // Clear any circuit breaker or redirect tracking to allow navigation
              sessionStorage.removeItem('redirect-count');
              sessionStorage.removeItem('last-redirect-time');
              sessionStorage.removeItem('navigation-history');
              sessionStorage.removeItem('login-page-visits');
              
              // Reset circuit breaker state if present (for PrivateRoute)
              if (window.circuitBroken) {
                window.circuitBroken = false;
              }
              
              navigate(destination, { replace: true });
            }
          }
        );
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, [navigate, location.state]);

  // Sign up function
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (!error) {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account."
        });
      }

      return { error };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { error: error as AuthError };
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!error && data.user) {
        // After successful login, update localStorage to sync with DirectAuth
        const currentTimestamp = Date.now();
        const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
        const expiryTimestamp = currentTimestamp + sessionDuration;
        
        // SYNC: Set the login state for DirectAuth to detect
        localStorage.setItem('akii-is-logged-in', 'true');
        localStorage.setItem('akii-auth-user-id', data.user.id);
        localStorage.setItem('akii-login-timestamp', currentTimestamp.toString());
        localStorage.setItem('akii-session-duration', sessionDuration.toString());
        localStorage.setItem('akii-session-expiry', expiryTimestamp.toString());
        localStorage.setItem('akii-auth-user-email', email);
        
        // Dispatch an event to notify DirectAuth of the change
        const loginEvent = new CustomEvent('akii-login-state-changed', { 
          detail: { isLoggedIn: true, userId: data.user.id }
        });
        window.dispatchEvent(loginEvent);
        
        console.log('SupabaseAuth: Successfully logged in and synced with DirectAuth');
      }

      return { data, error };
    } catch (error) {
      console.error('Error during sign in:', error);
      return { data: undefined, error: error as AuthError };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      console.log('SupabaseAuth: Starting sign out process');
      
      // First, clear all auth-related local storage items before API call
      const localStorageKeysToRemove = [
        // Direct Auth Storage Keys
        'akii-is-logged-in',
        'akii-auth-user-id',
        'akii-login-timestamp',
        'akii-session-expiry',
        'akii-is-admin',
        'akii-auth-user-email',
        'akii-auth-token',
        'akii-direct-profile',
        'akii-session-duration',
        
        // Admin override keys
        'admin_override',
        'admin_override_email',
        'admin_override_time',
        'akii_admin_override',
        'akii_admin_override_email',
        'akii_admin_override_expiry',
        'permanent-dashboard-access',
        'force-auth-login',
        
        // Other auth-related keys
        'auth-in-progress',
        'auth-user-role',
        'user-role',
        'akii-auth-role',
      ];
      
      // Clear specific keys from localStorage
      localStorageKeysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`SupabaseAuth: Failed to remove ${key} from localStorage`, e);
        }
      });
      
      // Clear any supabase related keys
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || 
            key.includes('sb-') || 
            key.includes('akii-') || 
            key.includes('token') || 
            key.includes('auth')) {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.warn(`SupabaseAuth: Failed to remove ${key} from localStorage`, e);
          }
        }
      });
      
      // Clear session storage items
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('akii-') || key.includes('supabase')) {
          try {
            sessionStorage.removeItem(key);
          } catch (e) {
            console.warn(`SupabaseAuth: Failed to remove ${key} from sessionStorage`, e);
          }
        }
      });
      
      // Clear local state
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      // Call Supabase sign out
      await supabase.auth.signOut();
      console.log('SupabaseAuth: Successfully signed out with Supabase');
      
      // Navigate to login page
      navigate('/');
    } catch (error) {
      console.error('SupabaseAuth: Error during sign out:', error);
      
      // Even on error, clear state and navigate away
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      navigate('/');
    }
  };

  // Function to manually refresh the session
  const refreshSession = async () => {
    try {
      const { data } = await supabase.auth.refreshSession();
      setSession(data.session);
      
      if (data.session?.user) {
        // Cast to our custom User type
        const currentUser = data.session.user as User;
        
        // Check admin status
        await checkUserAdmin(currentUser.id);
        
        // Fetch and add subscription data
        const subscription = await fetchUserSubscription(currentUser.id);
        if (subscription) {
          currentUser.subscription = subscription;
        }
        
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Create the context value object
  const contextValue: AuthContextType = {
    session,
    user,
    isLoading,
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