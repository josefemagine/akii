import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { isBrowser } from "@/lib/browser-check";

// Import from our consolidated auth-core module
import {
  User,
  Session,
  UserProfile,
  UserRole,
  UserStatus,
  SupabaseResponse,
  getCurrentSession,
  getCurrentUser,
  getUserProfile,
  ensureUserProfile,
  updateUserProfile,
  setUserRole,
  setUserStatus,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  signInWithOAuth,
  resetPassword as authResetPassword,
  updatePassword as authUpdatePassword,
  hasValidAdminOverride,
  clearStoredAuth,
  auth,
  supabase,
  verifySupabaseConnection
} from "@/lib/auth-core";

// State interface
interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  userRole: UserRole | null;
  error: Error | null;
}

// Context interface
export interface AuthContextType {
  // State
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  userRole: UserRole | null;
  error: Error | null;
  isAuthenticated: boolean;

  // Actions
  signIn: (
    email: string,
    password: string,
  ) => Promise<SupabaseResponse<User>>;
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, any>,
  ) => Promise<SupabaseResponse<User>>;
  signInWithGoogle: () => Promise<SupabaseResponse<any>>;
  resetPassword: (
    email: string,
  ) => Promise<SupabaseResponse<boolean>>;
  updatePassword: (
    password: string,
  ) => Promise<SupabaseResponse<User>>;
  signOut: () => Promise<SupabaseResponse<boolean>>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<SupabaseResponse<UserProfile>>;
  refreshUser: () => Promise<void>;
  setUserRole: (userId: string, role: UserRole) => Promise<SupabaseResponse<UserProfile>>;
  verifyConnection: () => Promise<{
    success: boolean;
    message: string;
    details: Record<string, boolean>;
  }>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create provider
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

  // Check if user is authenticated
  const isAuthenticated = !!state.user && !!state.session;

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Get session
      const { data: session, error: sessionError } = await getCurrentSession();
      
      if (sessionError) {
        console.error("Error getting session:", sessionError);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: sessionError,
          session: null,
          user: null,
          profile: null,
          isAdmin: false,
          userRole: null
        }));
        return;
      }
      
      // If no session, clear state
      if (!session) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          session: null,
          user: null,
          profile: null,
          isAdmin: false,
          userRole: null
        }));
        return;
      }
      
      // Get user
      const { data: user, error: userError } = await getCurrentUser();
      
      if (userError) {
        console.error("Error getting user:", userError);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: userError,
          session,
          user: null,
          profile: null,
          isAdmin: false,
          userRole: null
        }));
        return;
      }
      
      if (!user) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          session,
          user: null,
          profile: null,
          isAdmin: false,
          userRole: null
        }));
        return;
      }
      
      // Get profile
      const { data: profile, error: profileError } = await getUserProfile(user.id);
      
      if (profileError) {
        console.error("Error getting profile:", profileError);
      }
      
      // If no profile, create one
      let userProfile = profile;
      if (!profile) {
        const { data: newProfile, error: createError } = await ensureUserProfile(user);
        
        if (createError) {
          console.error("Error creating profile:", createError);
        } else {
          userProfile = newProfile;
        }
      }
      
      // Check admin status
      const isUserAdmin = (userProfile?.role === "admin") || hasValidAdminOverride(user.email || "");
      
      // Update state
      setState({
        user,
        session,
        profile: userProfile,
        isLoading: false,
        isAdmin: isUserAdmin,
        userRole: userProfile?.role || null,
        error: null,
      });
      
    } catch (error) {
      console.error("Auth initialization error:", error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error as Error 
      }));
    }
  }, []);

  // Effect to initialize auth and handle auth changes
  useEffect(() => {
    if (!isBrowser) return;
    
    // Initialize auth
    initializeAuth();
    
    // Set up auth listener
    const { data: authListener } = auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth event: ${event}`, session);
      
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        initializeAuth();
      } else if (event === "SIGNED_OUT") {
        setState({
          user: null,
          profile: null,
          session: null,
          isLoading: false,
          isAdmin: false,
          userRole: null,
          error: null,
        });
      }
    });
    
    // Cleanup
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [initializeAuth]);

  // Sign in function
  const signIn = async (
    email: string,
    password: string,
  ): Promise<SupabaseResponse<User>> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authSignIn(email, password);
      
      if (response.error) {
        toast({
          title: "Sign in failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else if (response.data) {
        toast({
          title: "Signed in successfully",
          variant: "default",
        });
        
        // Auth state will be updated by the onAuthStateChange listener
      }
      
      return response;
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return { data: null, error: error as Error };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Sign up function
  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, any>,
  ): Promise<SupabaseResponse<User>> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authSignUp({
        email,
        password,
        metadata,
        redirectTo: `${window.location.origin}/auth/callback`
      });
      
      if (response.error) {
        toast({
          title: "Sign up failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed up successfully",
          description: "Please check your email to confirm your account.",
          variant: "default",
        });
      }
      
      return { 
        data: response.data?.user || null, 
        error: response.error 
      };
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Sign up error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return { data: null, error: error as Error };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<SupabaseResponse<any>> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await signInWithOAuth("google");
      
      if (response.error) {
        toast({
          title: "Google sign in failed",
          description: response.error.message,
          variant: "destructive",
        });
      }
      
      return response;
    } catch (error) {
      console.error("Google sign in error:", error);
      toast({
        title: "Google sign in error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return { data: null, error: error as Error };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Reset password
  const resetPassword = async (
    email: string,
  ): Promise<SupabaseResponse<boolean>> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authResetPassword(email);
      
      if (response.error) {
        toast({
          title: "Password reset failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password reset email sent",
          description: "Please check your email for instructions.",
          variant: "default",
        });
      }
      
      return response;
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Password reset error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return { data: false, error: error as Error };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Update password
  const updatePassword = async (
    password: string,
  ): Promise<SupabaseResponse<User>> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authUpdatePassword(password);
      
      if (response.error) {
        toast({
          title: "Password update failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password updated successfully",
          variant: "default",
        });
      }
      
      return response;
    } catch (error) {
      console.error("Password update error:", error);
      toast({
        title: "Password update error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return { data: null, error: error as Error };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Sign out
  const signOut = async (): Promise<SupabaseResponse<boolean>> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // First update local state to signed out
      setState({
        user: null,
        profile: null,
        session: null,
        isLoading: false,
        isAdmin: false,
        userRole: null,
        error: null,
      });
      
      // Force navigation to happen immediately, before awaiting signOut
      navigate("/", { replace: true });
      
      // Now perform the actual sign out
      const response = await authSignOut();
      
      if (response.error) {
        console.error("Sign out API error:", response.error);
        toast({
          title: "Sign out had an issue",
          description: response.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out successfully",
          variant: "default",
        });
      }
      
      return response;
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return { data: false, error: error as Error };
    } finally {
      // Make sure loading state is reset
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Update profile
  const updateProfile = async (
    profileData: Partial<UserProfile>,
  ): Promise<SupabaseResponse<UserProfile>> => {
    if (!state.user?.id) {
      return {
        data: null,
        error: new Error("Cannot update profile: User not authenticated"),
      };
    }
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await updateUserProfile(state.user.id, profileData);
      
      if (response.error) {
        toast({
          title: "Profile update failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else if (response.data) {
        // Update profile in state
        setState(prev => ({
          ...prev,
          profile: response.data,
        }));
        
        toast({
          title: "Profile updated successfully",
          variant: "default",
        });
      }
      
      return response;
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Profile update error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return { data: null, error: error as Error };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Refresh user
  const refreshUser = async (): Promise<void> => {
    if (!state.user?.id) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Get profile
      const { data: profile, error: profileError } = await getUserProfile(state.user.id);
      
      if (profileError) {
        console.error("Error refreshing profile:", profileError);
        toast({
          title: "Error refreshing profile",
          description: profileError.message,
          variant: "destructive",
        });
        return;
      }
      
      if (profile) {
        // Check admin status
        const isUserAdmin = (profile.role === "admin") || hasValidAdminOverride(state.user.email || "");
        
        // Update state
        setState(prev => ({
          ...prev,
          profile,
          isAdmin: isUserAdmin,
          userRole: profile.role,
        }));
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      toast({
        title: "Error refreshing user",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Set user role
  const handleSetUserRole = async (
    userId: string, 
    role: UserRole
  ): Promise<SupabaseResponse<UserProfile>> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await setUserRole(userId, role);
      
      if (response.error) {
        toast({
          title: "Error setting user role",
          description: response.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "User role updated",
          description: `Role changed to ${role}`,
          variant: "default",
        });
        
        // If this is the current user, update state
        if (state.user?.id === userId) {
          await refreshUser();
        }
      }
      
      return response;
    } catch (error) {
      console.error("Error setting user role:", error);
      toast({
        title: "Error setting user role",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return { data: null, error: error as Error };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Verify connection
  const verifyConnection = async () => {
    return await verifySupabaseConnection();
  };

  // Create context value
  const contextValue: AuthContextType = {
    ...state,
    isAuthenticated,
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
    updatePassword,
    signOut,
    updateProfile,
    refreshUser,
    setUserRole: handleSetUserRole,
    verifyConnection,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for using auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};

// Shorthand hooks
export const useUser = () => useAuth().user;
export const useProfile = () => useAuth().profile;
export const useIsAdmin = () => useAuth().isAdmin;
export const useIsAuthenticated = () => useAuth().isAuthenticated; 