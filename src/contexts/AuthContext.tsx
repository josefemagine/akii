import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  supabaseClient,
  signIn as authSignIn,
  signOut as authSignOut,
  getCurrentSession,
  getCurrentUser,
  getUserProfile,
  ensureUserProfile,
  updateUserProfile,
  setUserRole,
  setUserStatus,
  checkUserStatus,
  UserProfile,
  UserRole,
  UserStatus,
  AuthResponse
} from "@/lib/auth-helpers";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null; 
  isLoading: boolean;
  isAdmin: boolean;
  userRole: string | null;
  error: Error | null;
}

export interface AuthContextType {
  // State
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  userRole: string | null;
  error: Error | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ data: any | null, error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  checkAdminStatus: () => boolean;
  bypassAdminCheck: () => boolean;
}

const AdminEmailList = [
  'josef@holm.com',
  // Add more admin emails as needed
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to check admin override
function checkAdminOverride(user: User | null): boolean {
  if (!user || !user.email) return false;
  
  const adminOverride = localStorage.getItem('akii_admin_override') === 'true';
  const adminEmail = localStorage.getItem('akii_admin_override_email');
  const adminExpiry = localStorage.getItem('akii_admin_override_expiry');
  
  // Check for legacy format
  const legacyOverride = localStorage.getItem('admin_override') === 'true';
  const legacyEmail = localStorage.getItem('admin_override_email');
  
  // Special case for Josef
  const isJosef = user.email === 'josef@holm.com';
  
  // Check if override is valid
  if (isJosef) {
    // If it's Josef, always set the override
    localStorage.setItem('akii_admin_override', 'true');
    localStorage.setItem('akii_admin_override_email', 'josef@holm.com');
    localStorage.setItem('akii_admin_override_expiry', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
    console.log('Admin override set for Josef');
    return true;
  }
  
  if (adminOverride && adminEmail === user.email) {
    // Check if override is expired
    if (adminExpiry) {
      const expiryDate = new Date(adminExpiry);
      if (expiryDate > new Date()) {
        console.log('Valid admin override found in localStorage');
        return true;
      }
    } else {
      // No expiry, assume it's valid
      console.log('Admin override found without expiry');
      return true;
    }
  }
  
  // Check legacy format
  if (legacyOverride && legacyEmail === user.email) {
    console.log('Legacy admin override found');
    return true;
  }
  
  return false;
}

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isAdmin: false,
    userRole: null,
    error: null,
  });

  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    
    async function initializeAuth() {
      setState((prev) => ({ ...prev, isLoading: true }));
      
      try {
        // Get current session
        const { data: currentSession, error: sessionError } = await getCurrentSession();
        
        if (sessionError) throw sessionError;
        
        if (isMounted) {
          setState((prev) => ({ ...prev, session: currentSession }));
        }
        
        if (currentSession) {
          // Get user
          const { data: currentUser, error: userError } = await getCurrentUser();
          
          if (userError) throw userError;
          
          if (isMounted) {
            setState((prev) => ({ ...prev, user: currentUser }));
            
            // Check for admin override
            const hasAdminOverride = checkAdminOverride(currentUser);
            
            if (hasAdminOverride) {
              console.log('Admin override active for', currentUser.email);
              setState((prev) => ({ ...prev, isAdmin: true }));
            }
          }
          
          if (currentUser) {
            // Get user profile
            const { data: profile, error: profileError } = await getUserProfile(currentUser.id);
            
            if (profileError) {
              // If no profile exists, create one
              const { data: newProfile, error: createError } = await ensureUserProfile(currentUser);
              
              if (createError) throw createError;
              
              if (isMounted && newProfile) {
                setState((prev) => ({ ...prev, profile: newProfile }));
                
                // Only set isAdmin from profile if no override
                if (!checkAdminOverride(currentUser)) {
                  setState((prev) => ({ ...prev, isAdmin: newProfile.role === 'admin' }));
                }
              }
            } else if (isMounted && profile) {
              setState((prev) => ({ ...prev, profile: profile }));
              
              // Only set isAdmin from profile if no override
              if (!checkAdminOverride(currentUser)) {
                setState((prev) => ({ ...prev, isAdmin: profile.role === 'admin' }));
              }
            }
            
            // Log auth status
            console.log('Auth initialized:', { 
              user: currentUser.email,
              role: profile?.role || 'user',
              admin: state.isAdmin || profile?.role === 'admin' || checkAdminOverride(currentUser)
            });
          }
        } else {
          // No session, clear state
          if (isMounted) {
            setState((prev) => ({ ...prev, user: null, profile: null, isAdmin: false }));
          }
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Don't clear state here as it might be a temporary error
      } finally {
        if (isMounted) {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    }
    
    // Set up auth state change listener
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log(`Auth state changed: ${event}`);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (isMounted) {
            setState((prev) => ({ ...prev, session: currentSession }));
            
            if (currentSession?.user) {
              setState((prev) => ({ ...prev, user: currentSession.user }));
              
              // Check for admin override
              const hasAdminOverride = checkAdminOverride(currentSession.user);
              if (hasAdminOverride) {
                console.log('Admin override detected on auth change');
                setState((prev) => ({ ...prev, isAdmin: true }));
              }
              
              // Get or create profile
              const { data: profile } = await getUserProfile(currentSession.user.id);
              
              if (isMounted && profile) {
                setState((prev) => ({ ...prev, profile: profile }));
                
                // Only set isAdmin from profile if no override
                if (!hasAdminOverride) {
                  setState((prev) => ({ ...prev, isAdmin: profile.role === 'admin' }));
                }
              }
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setState((prev) => ({ ...prev, user: null, session: null, profile: null, isAdmin: false }));
          }
        }
      }
    );
    
    initializeAuth();
    
    // Cleanup
    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Monitor location changes for auth protection
  useEffect(() => {
    const pathRequiresAuth = location.pathname.startsWith('/dashboard') || 
                           location.pathname.startsWith('/admin');
    
    const pathRequiresAdmin = location.pathname.startsWith('/admin');
    
    // Special case for Josef
    const isJosef = state.user?.email === 'josef@holm.com';
    
    if (pathRequiresAuth && !state.isLoading && !state.user) {
      // Redirect to login if auth required
      navigate('/', { replace: true });
    } else if (pathRequiresAdmin && !state.isLoading && !state.isAdmin && !isJosef) {
      // Block admin access if not admin, except for Josef
      if (state.user) {
        if (!isJosef) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin area.",
            variant: "destructive",
          });
          navigate('/dashboard', { replace: true });
        }
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [location.pathname, state.isLoading, state.user, state.isAdmin, navigate, toast]);
  
  // Sign-in handler
  const signIn = async (email: string, password: string): Promise<{ data: any | null, error: Error | null }> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      
      const response = await authSignIn(email, password);
      
      if (response.error) {
        setState((prev) => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error
        }));
        return response;
      }
      
      // If sign-in successful, user state will be updated by the auth listener
      setState((prev) => ({ ...prev, isLoading: false }));
      return response;
    } catch (error) {
      console.error("Sign-in error:", error);
      setState((prev) => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      // Return proper format with null data and the error
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  };
  
  // Sign-out handler
  const signOut = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      await authSignOut();
      
      // Clear state
      setState((prev) => ({ ...prev, user: null, session: null, profile: null, isAdmin: false }));
      
      // Redirect to home
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      
      toast({
        title: "Sign out error",
        description: 'There was a problem signing out. Please try again.',
        variant: "destructive",
      });
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };
  
  // Refresh user profile
  const refreshUser = async () => {
    if (!state.user) return;
    
    try {
      // Check for admin override
      const hasAdminOverride = checkAdminOverride(state.user);
      if (hasAdminOverride) {
        console.log('Admin override detected on profile refresh');
        setState((prev) => ({ ...prev, isAdmin: true }));
      }
      
      const { data: profile } = await getUserProfile(state.user.id);
      
      if (profile) {
        setState((prev) => ({ ...prev, profile: profile }));
        // Only set isAdmin from profile if no override
        if (!hasAdminOverride) {
          setState((prev) => ({ ...prev, isAdmin: profile.role === 'admin' }));
        }
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };
  
  // Update user profile
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!state.user) {
      throw new Error("Cannot update profile: No authenticated user");
    }
    
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      
      // Update profile in database
      const { data: updatedProfile, error } = await updateUserProfile(state.user.id, profileData);
      
      if (error) throw error;
      if (!updatedProfile) throw new Error("Failed to update profile: No data returned");
      
      // Update local state
      setState((prev) => ({
        ...prev,
        profile: updatedProfile,
        userRole: updatedProfile.role || null,
        isAdmin: checkAdminOverride(state.user),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to update profile:", error);
      setState((prev) => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      throw error;
    }
  };
  
  // Check admin access
  const checkAdminStatus = useCallback(() => {
    return state.isAdmin || checkAdminOverride(state.user);
  }, [state.isAdmin, state.user]);
  
  // Bypass admin check (emergency access)
  const bypassAdminCheck = useCallback(() => {
    if (!state.user || !state.user.email) return false;
    
    if (AdminEmailList.includes(state.user.email)) {
      console.log("Emergency admin access granted to:", state.user.email);
      
      // Set admin override in localStorage
      localStorage.setItem('akii_admin_override', 'true');
      localStorage.setItem('akii_admin_override_email', state.user.email);
      localStorage.setItem('akii_admin_override_expiry', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
      
      setState((prev) => ({ ...prev, isAdmin: true }));
      return true;
    }
    
    return false;
  }, [state.user]);
  
  // Create context value
  const value = {
    user: state.user,
    profile: state.profile,
    session: state.session,
    isLoading: state.isLoading,
    isAdmin: state.isAdmin,
    userRole: state.userRole,
    error: state.error,
    signIn,
    signOut,
    updateProfile,
    refreshUser,
    checkAdminStatus,
    bypassAdminCheck,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
