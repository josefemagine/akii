/**
 * UnifiedAuthContext.tsx
 * 
 * This file provides a single, unified authentication provider that combines
 * functionality from the three previous auth providers:
 * - DirectAuthProvider (direct DB auth)
 * - SupabaseAuthProvider (Supabase auth)
 * - AuthProvider/StandardAuthProvider (compatibility layer)
 * 
 * It maintains backward compatibility through aliased hooks while simplifying
 * the overall authentication architecture.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { 
  getProfileDirectly, 
  ensureProfileExists, 
  isLoggedIn as checkIsLoggedIn, 
  getMinimalUser,
  refreshSession,
  setLoggedIn,
  setLoggedOut
} from '@/lib/direct-db-access';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '@/types/custom-types';

// Debug flag
const DEBUG_AUTH = false;

// Helper for debug logging
const logDebug = (message: string, data?: any) => {
  if (DEBUG_AUTH) {
    console.log(`[UnifiedAuth] ${message}`, data || '');
  }
};

// Login result interface
interface LoginResult {
  success: boolean;
  error?: {
    message: string;
  };
  data?: any;
}

// Unified auth context type
interface UnifiedAuthContextType {
  // User data 
  user: User | null;
  profile: any | null;
  session: Session | null;
  
  // State flags
  isLoading: boolean;
  sessionLoaded: boolean;
  isAdmin: boolean;
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<LoginResult>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: AuthError | null }>;
  signOut: (scope?: 'global' | 'local' | 'others') => Promise<void>;
  refreshAuthState: () => Promise<void>;
  
  // Legacy method aliases
  signInWithPassword: (credentials: { email: string, password: string }) => Promise<LoginResult>;
  directLogin: (email: string, password: string) => Promise<LoginResult>;
  getSession: () => Promise<{ data: { session: any | null }, error: null | Error }>;
  refreshSession: () => Promise<void>;
}

// Create the context
const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

// Provider props
interface UnifiedAuthProviderProps {
  children: ReactNode;
}

/**
 * UnifiedAuthProvider component
 * Provides authentication functionality from all previous providers in one place
 */
export const UnifiedAuthProvider: React.FC<UnifiedAuthProviderProps> = ({ children }) => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionLoaded, setSessionLoaded] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  // Set admin status helper
  const setAdminStatus = (isAdmin: boolean) => {
    setIsAdmin(isAdmin);
    if (isAdmin) {
      localStorage.setItem('akii-is-admin', 'true');
    } else {
      localStorage.removeItem('akii-is-admin');
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      logDebug('Initializing authentication state');
      setIsLoading(true);
      
      try {
        // Try Supabase auth first
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          logDebug('Found valid Supabase session', sessionData.session.user.id);
          
          // Set Supabase auth state
          setSession(sessionData.session);
          setUser(sessionData.session.user as User);
          setSessionLoaded(true);
          
          // Check for admin status
          const isSupabaseAdmin = 
            sessionData.session.user.app_metadata?.role === 'admin' || 
            sessionData.session.user.user_metadata?.isAdmin === true ||
            sessionData.session.user.app_metadata?.is_admin === true;
          
          setAdminStatus(isSupabaseAdmin);
          
          // Try to get profile data
          await fetchProfileData(sessionData.session.user.id);
        } 
        else if (checkIsLoggedIn()) {
          // Fall back to direct DB auth if no Supabase session
          logDebug('No Supabase session, checking direct auth');
          
          const userID = localStorage.getItem('akii-auth-user-id');
          
          if (userID) {
            // Create a minimal user object
            const minimalUser = getMinimalUser();
            setUser(minimalUser as unknown as User);
            
            // Try to get profile data
            await fetchProfileData(userID);
            
            // Check for admin status
            const directIsAdmin = localStorage.getItem('akii-is-admin') === 'true' ||
                                  profile?.role === 'admin';
            
            setAdminStatus(directIsAdmin);
          }
        }
        
        // Always mark session as loaded
        setSessionLoaded(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setSessionLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Subscribe to Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logDebug('Supabase auth state changed', { event, userId: session?.user?.id });
        
        if (session) {
          setSession(session);
          setUser(session.user as User);
          
          // Check for admin status
          const isSupabaseAdmin = 
            session.user.app_metadata?.role === 'admin' || 
            session.user.user_metadata?.isAdmin === true ||
            session.user.app_metadata?.is_admin === true;
          
          setAdminStatus(isSupabaseAdmin);
          
          // Try to get profile data
          fetchProfileData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          // Clear state on sign out
          setSession(null);
          setUser(null);
          setProfile(null);
          setAdminStatus(false);
        }
      }
    );
    
    // Initialize auth
    initAuth();
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Helper to fetch profile data
  const fetchProfileData = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await getProfileDirectly();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        
        // Try to create profile if it doesn't exist
        const { data: createdProfile, error: createError } = await ensureProfileExists();
        
        if (createError) {
          console.error('Error creating profile:', createError);
        } else if (createdProfile) {
          setProfile(createdProfile);
          
          // Update admin status if needed
          if (createdProfile.role === 'admin') {
            setAdminStatus(true);
          }
        }
      } else if (profileData) {
        setProfile(profileData);
        
        // Update admin status if needed
        if (profileData.role === 'admin') {
          setAdminStatus(true);
        }
      }
    } catch (error) {
      console.error('Error in fetchProfileData:', error);
    }
  };
  
  // Sign in with Supabase
  const signIn = async (email: string, password: string): Promise<LoginResult> => {
    try {
      setIsLoading(true);
      logDebug('Signing in with Supabase', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        logDebug('Supabase sign in error', error.message);
        
        // Fall back to direct login for development
        if (import.meta.env.DEV) {
          logDebug('Trying direct login as fallback');
          return directLogin(email, password);
        }
        
        return { 
          success: false, 
          error: { message: error.message } 
        };
      }
      
      logDebug('Supabase sign in successful', data.user?.id);
      return { 
        success: true, 
        data 
      };
    } catch (error) {
      console.error('Error during sign in:', error);
      return { 
        success: false, 
        error: { message: error instanceof Error ? error.message : 'Unknown error during sign in' } 
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Direct login (primarily for development)
  const directLogin = async (email: string, password: string): Promise<LoginResult> => {
    try {
      setIsLoading(true);
      logDebug('Attempting direct login', email);
      
      // Development hardcoded user ID
      const HARDCODED_USER_ID = 'b574f273-e0e1-4cb8-8c98-f5a7569234c8';
      
      if (import.meta.env.DEV) {
        const userId = HARDCODED_USER_ID;
        
        // Set the login state with timestamps
        const timestamp = Date.now();
        const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
        const expiryTimestamp = timestamp + sessionDuration;
        
        // Clear any stale login state
        localStorage.removeItem('akii-is-logged-in');
        localStorage.removeItem('akii-auth-user-id');
        localStorage.removeItem('akii-login-timestamp');
        
        // Set login state
        localStorage.setItem('akii-is-logged-in', 'true');
        localStorage.setItem('akii-auth-user-id', userId);
        localStorage.setItem('akii-auth-user-email', email);
        localStorage.setItem('akii-login-timestamp', timestamp.toString());
        localStorage.setItem('akii-session-duration', sessionDuration.toString());
        localStorage.setItem('akii-session-expiry', expiryTimestamp.toString());
        
        // Use the helper function as well
        setLoggedIn(userId, email);
        
        // Create or update profile
        const { data: profileData, error: profileError } = await ensureProfileExists(email);
        
        if (profileError) {
          console.error('Error ensuring profile exists:', profileError);
          return { 
            success: false, 
            error: { message: profileError.message || 'Failed to create profile' } 
          };
        }
        
        // Set state
        const userObj = {
          id: userId,
          email: profileData?.email || email,
          role: profileData?.role || 'user',
          app_metadata: { provider: 'email' },
          user_metadata: {},
          created_at: new Date().toISOString()
        };
        
        setUser(userObj as User);
        setProfile(profileData);
        setAdminStatus(profileData?.role === 'admin');
        
        // Create a mock session for compatibility
        const mockSession = {
          access_token: 'mock_token',
          token_type: 'bearer',
          expires_in: sessionDuration / 1000,
          expires_at: expiryTimestamp / 1000,
          refresh_token: 'mock_refresh_token',
          user: userObj
        };
        
        setSession(mockSession as Session);
        setSessionLoaded(true);
        
        return { 
          success: true, 
          data: { 
            user: userObj,
            session: mockSession
          }
        };
      }
      
      return { 
        success: false, 
        error: { message: 'Direct login only supported in development mode' } 
      };
    } catch (error) {
      console.error('Error during direct login:', error);
      return { 
        success: false, 
        error: { message: error instanceof Error ? error.message : 'Unknown error during direct login' } 
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sign up with Supabase
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      logDebug('Signing up user', email);
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
  
  // Sign out
  const signOut = async (scope: 'global' | 'local' | 'others' = 'global') => {
    try {
      logDebug('Signing out user', { scope });
      
      // Keys to clear from storage
      const keysToRemove = [
        // Auth keys
        'akii-is-logged-in',
        'akii-auth-user-id',
        'akii-login-timestamp',
        'akii-session-expiry',
        'akii-is-admin',
        'akii-auth-user-email',
        'akii-auth-token',
        'akii-direct-profile',
        'akii-session-duration',
        
        // Admin keys
        'admin_override',
        'admin_override_email',
        'admin_override_time',
        'akii_admin_override',
        'akii_admin_override_email',
        'akii_admin_override_expiry',
        'permanent-dashboard-access',
        'force-auth-login',
      ];
      
      // Clear localStorage
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Failed to remove ${key} from localStorage`, e);
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
            console.warn(`Failed to remove ${key} from localStorage`, e);
          }
        }
      });
      
      // Call setLoggedOut helper
      setLoggedOut();
      
      // Sign out of Supabase
      await supabase.auth.signOut();
      
      // Clear state
      setUser(null);
      setProfile(null);
      setSession(null);
      setAdminStatus(false);
      
      // Force page reload for a clean state
      if (scope === 'global') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      
      // Force clean state even on error
      setUser(null);
      setProfile(null);
      setSession(null);
      setAdminStatus(false);
    }
  };
  
  // Refresh auth state
  const refreshAuthState = async () => {
    try {
      setIsLoading(true);
      logDebug('Refreshing auth state');
      
      // Try to refresh Supabase session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionData.session) {
        // Update state with Supabase session
        setSession(sessionData.session);
        setUser(sessionData.session.user as User);
        
        // Get profile data
        await fetchProfileData(sessionData.session.user.id);
      } else if (checkIsLoggedIn()) {
        // Try direct DB auth
        const userId = localStorage.getItem('akii-auth-user-id');
        
        if (userId) {
          // Get minimal user and profile
          const minimalUser = getMinimalUser();
          setUser(minimalUser as unknown as User);
          
          // Get profile data
          await fetchProfileData(userId);
        } else {
          // No valid auth, clear state
          setUser(null);
          setProfile(null);
          setSession(null);
          setAdminStatus(false);
        }
      } else {
        // No valid auth, clear state
        setUser(null);
        setProfile(null);
        setSession(null);
        setAdminStatus(false);
      }
    } catch (error) {
      console.error('Error refreshing auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Legacy method alias for refreshSession
  const refreshSessionMethod = async () => {
    try {
      logDebug('Refreshing session');
      await supabase.auth.refreshSession();
      await refreshAuthState();
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };
  
  // Legacy method alias for signInWithPassword
  const signInWithPassword = async (credentials: { email: string, password: string }): Promise<LoginResult> => {
    return signIn(credentials.email, credentials.password);
  };
  
  // Legacy method alias for getSession
  const getSession = async () => {
    try {
      // Try Supabase first
      const result = await supabase.auth.getSession();
      
      if (result.data.session) {
        return result;
      }
      
      // Fall back to direct auth
      return {
        data: {
          session: user ? { 
            user: { 
              id: user.id,
              email: user.email,
            } 
          } : null
        },
        error: null
      };
    } catch (error) {
      console.error('Error in getSession:', error);
      return {
        data: { session: null },
        error: error instanceof Error ? error : new Error('Unknown error in getSession')
      };
    }
  };
  
  // Create the context value
  const contextValue: UnifiedAuthContextType = {
    // State
    user,
    profile,
    session,
    isLoading,
    sessionLoaded,
    isAdmin,
    
    // Methods
    signIn,
    signUp,
    signOut,
    refreshAuthState,
    
    // Legacy method aliases
    signInWithPassword,
    directLogin,
    getSession,
    refreshSession: refreshSessionMethod
  };
  
  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

/**
 * Main hook for using the unified auth context
 */
export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  
  return context;
};

/**
 * Legacy hook aliases for backward compatibility
 */

// For components using the standard auth hook
export const useAuth = useUnifiedAuth;

// For components using the Supabase auth hook
export const useSupabaseAuth = useUnifiedAuth;

// For components using the direct auth hook
export const useDirectAuth = useUnifiedAuth;

/**
 * Legacy provider aliases for backward compatibility
 */
export const AuthProvider = UnifiedAuthProvider;
export const StandardAuthProvider = UnifiedAuthProvider;
export const SupabaseAuthProvider = UnifiedAuthProvider;
export const DirectAuthProvider = UnifiedAuthProvider;

// Default export
export default UnifiedAuthContext; 