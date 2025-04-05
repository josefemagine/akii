import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { isBrowser, safeStorage } from "@/lib/browser-check";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import type { Session, AuthError } from "@supabase/supabase-js";
import type { User, UserRole, UserStatus, Subscription } from "@/types/custom";
import type { UserProfile } from "@/lib/auth-helpers";

// Import everything from supabase-core
import {
  // Client functions
  getAuth,
  getSupabaseClient,
  // Auth functions
  getCurrentUser,
  getCurrentSession,
  getUserProfile,
  ensureUserProfile,
  updateUserProfile,
  setUserRole,
  setUserStatus,
  checkUserStatus,
  // Types
  type AuthResponse,
} from "@/lib/supabase-core";

import {
  signIn as authSignIn,
  signOut as authSignOut,
  signUp as authSignUp,
  verifySupabaseConnection,
} from "@/lib/auth-helpers";

// Update imports to use the singleton
import supabase, { auth, supabaseAdmin, debugSupabaseInstances } from "@/lib/supabase";

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
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    metadata?: any,
  ) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ data: any | null; error: Error | null }>;
  verifyOtp: (
    email: string,
    token: string,
  ) => Promise<{ data: any | null; error: Error | null }>;
  resetPassword: (
    email: string,
  ) => Promise<{ data: any | null; error: Error | null }>;
  confirmPasswordReset: (
    email: string,
    token: string,
    password: string,
  ) => Promise<{ data: any | null; error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  checkAdminStatus: () => boolean;
  bypassAdminCheck: () => boolean;
  updatePassword: (
    password: string,
  ) => Promise<{ data: any | null; error: Error | null }>;
  refreshSession: () => Promise<void>;
}

const AdminEmailList = [
  "josef@holm.com",
  // Add more admin emails as needed
];

// Create the auth context with a meaningful name
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to check admin override
function checkAdminOverride(user: User | null): boolean {
  if (!user || !user.email) return false;

  // Special case for Josef - always grant admin access
  const isJosef = user.email === "josef@holm.com";
  if (isJosef) {
    // If it's Josef, always set the override
    try {
      safeStorage.setItem("akii_admin_override", "true");
      safeStorage.setItem("akii_admin_override_email", "josef@holm.com");
      safeStorage.setItem(
        "akii_admin_override_expiry",
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      );

      // Also set legacy format for maximum compatibility
      safeStorage.setItem("admin_override", "true");
      safeStorage.setItem("admin_override_email", "josef@holm.com");
      safeStorage.setItem("admin_override_time", Date.now().toString());

      // Additional admin flags
      safeStorage.setItem("auth-user-role", "admin");
      safeStorage.setItem("user-role", "admin");
      safeStorage.setItem("akii-auth-role", "admin");

      console.log("Admin override set for Josef");
    } catch (error) {
      console.error("Error setting admin override for Josef:", error);
    }
    return true;
  }

  // Check for current format
  const adminOverride = safeStorage.getItem("akii_admin_override") === "true";
  const adminEmail = safeStorage.getItem("akii_admin_override_email");
  const adminExpiry = safeStorage.getItem("akii_admin_override_expiry");

  // Check for legacy format
  const legacyOverride = safeStorage.getItem("admin_override") === "true";
  const legacyEmail = safeStorage.getItem("admin_override_email");

  if (adminOverride && adminEmail === user.email) {
    // Check if override is expired
    if (adminExpiry) {
      const expiryDate = new Date(adminExpiry);
      if (expiryDate > new Date()) {
        console.log("Valid admin override found in localStorage");
        return true;
      }
    } else {
      // No expiry, assume it's valid
      console.log("Admin override found without expiry");
      return true;
    }
  }

  // Check legacy format
  if (legacyOverride && legacyEmail === user.email) {
    console.log("Legacy admin override found");
    return true;
  }

  return false;
}

const getDefaultAdminSubscription = (user: User | null) => {
  if (!user) return null;
  return {
    plan: "enterprise",
    status: "active",
    messages_used: 0,
    message_limit: 1000000,
    renews_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    addons: {},
    payment_method: "admin",
  };
};

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

  // Initialize auth state and set up auth listener
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        // Try to get existing session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: sessionError 
          }));
          return;
        }
        
        // If no session, set user to null and return early
        if (!sessionData?.session) {
          setState(prev => ({
            ...prev,
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            isAdmin: false,
            userRole: null,
          }));
          return;
        }
        
        // We have a session, try to get user
        const { data: userData, error: userError } = await auth.getUser();
        
        if (userError || !userData) {
          console.error("Error getting user:", userError);
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: userError || new Error("User data is empty")
          }));
          return;
        }
        
        // Use type checking for userData
        if (!userData || !userData.user) {
          console.error("User data is undefined or empty");
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: new Error("User data is undefined")
          }));
          return;
        }
        
        const userObj = userData.user;
        if (!userObj || !userObj.id) {
          console.error("User ID is undefined or empty");
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: new Error("User ID is undefined")
          }));
          return;
        }
        
        // Get profile with valid user ID
        try {
          const { data: profileData, error: profileError } = await getUserProfile(userObj.id);
          
          if (profileError) {
            console.error("Error getting profile:", profileError);
            setState(prev => ({ 
              ...prev, 
              isLoading: false,
              error: profileError 
            }));
            return;
          }
          
          // Update state with profile
          setState(prev => ({
            ...prev,
            profile: profileData,
            isLoading: false,
            isAdmin: profileData?.role === "admin" || checkAdminOverride(userObj as any),
            userRole: profileData?.role || null,
          }));
        } catch (profileError) {
          console.error("Exception getting profile:", profileError);
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: profileError instanceof Error ? profileError : new Error(String(profileError))
          }));
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error))
        }));
      }
    }

    // Set up auth state listener
    const authClient = auth;
    const {
      data: { subscription },
    } = authClient.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_OUT') {
        setState(prev => ({
          ...prev,
          user: null,
          profile: null,
          session: null,
          isLoading: false,
          isAdmin: false,
          userRole: null,
        }));
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        try {
          const user = await getCurrentUser();
          if (!mounted) return;

          if (user) {
            const profile = await getUserProfile(user.data.id);
            if (!mounted) return;

            setState(prev => ({
              ...prev,
              user: user.data as any,
              profile: profile.data,
              session,
              isLoading: false,
              isAdmin: profile.data?.role === "admin" || checkAdminOverride(user.data as any),
              userRole: profile.data?.role || null,
            }));
          }
        } catch (error) {
          console.error("Error updating auth state:", error);
        }
      }
    });

    // Initialize auth state
    initializeAuth();

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Monitor location changes for auth protection
  useEffect(() => {
    let mounted = true;

    const checkAuthAndRedirect = async () => {
      const pathRequiresAuth =
        location.pathname.startsWith("/dashboard") ||
        location.pathname.startsWith("/admin");

      const pathRequiresAdmin = location.pathname.startsWith("/admin");

      // Special case for Josef
      const isJosef = state.user?.email === "josef@holm.com";

      if (!mounted) return;

      if (pathRequiresAuth && !state.isLoading && !state.user) {
        // Redirect to login if auth required
        navigate("/", { replace: true });
      } else if (
        pathRequiresAdmin &&
        !state.isLoading &&
        !state.isAdmin &&
        !isJosef
      ) {
        // Block admin access if not admin, except for Josef
        if (state.user) {
          if (!isJosef && mounted) {
            toast({
              title: "Access Denied",
              description: "You don't have permission to access the admin area.",
              variant: "destructive",
            });
            navigate("/dashboard", { replace: true });
          }
        } else {
          navigate("/", { replace: true });
        }
      }
    };

    checkAuthAndRedirect();

    return () => {
      mounted = false;
    };
  }, [location.pathname, state.isLoading, state.user, state.isAdmin, navigate, toast]);

  // Update state.user with subscription data for admins
  useEffect(() => {
    let mounted = true;

    const updateSubscription = async () => {
      if (state.user && state.isAdmin) {
        // Use a local variable to track if we've already updated the subscription
        const hasSubscription = state.user.subscription !== undefined;

        if (!hasSubscription && mounted) {
          setState((prev) => ({
            ...prev,
            user: {
              ...prev.user,
              subscription: getDefaultAdminSubscription(prev.user),
            },
          }));
        }
      }
    };

    updateSubscription();

    return () => {
      mounted = false;
    };
  }, [state.user, state.isAdmin]);

  // Sign-in handler
  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: AuthError | null }> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      console.log("AuthContext: Signing in user", email);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("AuthContext: Sign-in error", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error,
        }));
        return { error };
      }

      console.log("AuthContext: Sign-in successful");
      // If sign-in successful, user state will be updated by the auth listener
      setState((prev) => ({ ...prev, isLoading: false }));
      return { error };
    } catch (error) {
      console.error("Sign-in error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      // Return proper format with null data and the error
      return { error: error as AuthError };
    }
  };

  // Sign-up handler
  const signUp = async (
    email: string,
    password: string,
    metadata?: any,
  ): Promise<{ error: AuthError | null }> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error("Sign-up error:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
        return { error };
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account."
      });

      setState((prev) => ({ ...prev, isLoading: false }));
      return { error };
    } catch (error) {
      console.error("Sign-up error:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      return { error: error as AuthError };
    }
  };

  // Google sign-in handler
  const signInWithGoogle = async (): Promise<{
    data: any | null;
    error: Error | null;
  }> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { data, error } = await getAuth().signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      setState((prev) => ({ ...prev, isLoading: false }));

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Google sign-in error:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  };

  // Verify OTP handler
  const verifyOtp = async (
    email: string,
    token: string,
  ): Promise<{ data: any | null; error: Error | null }> => {
    try {
      const { data, error } = await getAuth().verifyOtp({
        email,
        token,
        type: "email",
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return { data: null, error: error as Error };
    }
  };

  // Reset password handler
  const resetPassword = async (
    email: string,
  ): Promise<{ data: any | null; error: Error | null }> => {
    try {
      const { data, error } = await getAuth().resetPasswordForEmail(email);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Error resetting password:", error);
      return { data: null, error: error as Error };
    }
  };

  // Confirm password reset handler
  const confirmPasswordReset = async (
    email: string,
    token: string,
    password: string,
  ): Promise<{ data: any | null; error: Error | null }> => {
    try {
      const { data, error } = await getAuth().updateUser({
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Error confirming password reset:", error);
      return { data: null, error: error as Error };
    }
  };

  // Sign-out handler
  const signOut = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      console.log("AuthContext: Starting sign out process");
      
      // First attempt to clear all tokens and local storage
      try {
        // Clear Supabase tokens
        localStorage.removeItem("sb-access-token");
        localStorage.removeItem("sb-refresh-token");
        localStorage.removeItem("supabase.auth.token");
        localStorage.removeItem("supabase_auth_token");
        
        // Clear auth state flags
        localStorage.removeItem("auth-in-progress");
        localStorage.removeItem("auth-user-role");
        localStorage.removeItem("user-role");
        localStorage.removeItem("akii-auth-role");
        
        // Clear admin overrides
        localStorage.removeItem("admin_override");
        localStorage.removeItem("admin_override_email");
        localStorage.removeItem("admin_override_time");
        localStorage.removeItem("akii_admin_override");
        localStorage.removeItem("akii_admin_override_email");
        localStorage.removeItem("akii_admin_override_expiry");
        
        console.log("AuthContext: Cleared localStorage tokens and state");
      } catch (storageError) {
        console.error("AuthContext: Error clearing localStorage:", storageError);
        // Continue with sign out even if localStorage clearing fails
      }

      // Now call Supabase signOut
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("AuthContext: Error from Supabase auth.signOut():", error);
        // Continue with sign out flow even if Supabase call fails
      } else {
        console.log("AuthContext: Supabase auth.signOut() successful");
      }

      // Always clear state regardless of API errors
      console.log("AuthContext: Clearing user state");
      setState((prev) => ({
        ...prev,
        user: null,
        session: null,
        profile: null,
        isAdmin: false,
        isLoading: false,
      }));

      // Redirect to home page after sign out
      console.log("AuthContext: Redirecting to home page");
      navigate('/');
      
      console.log("AuthContext: Sign out complete");
    } catch (error) {
      console.error("AuthContext: Unexpected error during sign out:", error);
      
      // Still clear state even if there was an error
      setState((prev) => ({
        ...prev,
        user: null,
        session: null,
        profile: null,
        isAdmin: false,
        isLoading: false,
      }));
      
      // Redirect to home page even if there was an error
      navigate('/');
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Refresh user profile
  const refreshUser = async () => {
    if (!state.user) return;

    try {
      console.log("Refreshing user profile for ID:", state.user.id);

      // Check for admin override
      const hasAdminOverride = checkAdminOverride(state.user);
      if (hasAdminOverride) {
        console.log("Admin override detected on profile refresh");
        setState((prev) => ({ ...prev, isAdmin: true }));
      }

      const { data: profile, error: profileError } = await getUserProfile(
        state.user.id,
      );

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        return;
      }

      if (profile) {
        console.log("Profile refreshed successfully:", profile);
        
        // Check for theme preference in user profile and set it in localStorage
        if ('theme_preference' in profile && profile.theme_preference) {
          localStorage.setItem("dashboard-theme", profile.theme_preference as string);
          console.log("Loaded theme preference from profile:", profile.theme_preference);
        }
        
        setState((prev) => ({ ...prev, profile: profile }));

        // Store avatar URL in localStorage as backup
        if (profile.avatar_url) {
          localStorage.setItem("akii-avatar-url", profile.avatar_url);
        }

        // Only set isAdmin from profile if no override
        if (!hasAdminOverride) {
          setState((prev) => ({ ...prev, isAdmin: profile.role === "admin" }));
        }
      } else {
        console.warn("No profile data returned when refreshing user");
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
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
      const { data: updatedProfile, error } = await updateUserProfile(
        state.user.id,
        profileData,
      );

      if (error) throw error;
      if (!updatedProfile)
        throw new Error("Failed to update profile: No data returned");

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
      localStorage.setItem("akii_admin_override", "true");
      localStorage.setItem("akii_admin_override_email", state.user.email);
      localStorage.setItem(
        "akii_admin_override_expiry",
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      );

      setState((prev) => ({ ...prev, isAdmin: true }));
      return true;
    }

    return false;
  }, [state.user]);

  // Update password handler
  const updatePassword = async (password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const { data, error } = await getAuth().updateUser({
        password: password,
      });
      setState((prev) => ({ ...prev, isLoading: false }));
      return { data, error };
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  };

  // Function to manually refresh the session
  const refreshSession = async () => {
    try {
      const { data } = await supabase.auth.refreshSession();
      setState((prev) => ({ ...prev, session: data.session }));
      setState((prev) => ({ ...prev, user: data.session?.user as any || null }));
      
      if (data.session?.user) {
        await checkAdminStatus();
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

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
    signUp,
    signInWithGoogle,
    verifyOtp,
    resetPassword,
    confirmPasswordReset,
    updateProfile,
    refreshUser,
    checkAdminStatus,
    bypassAdminCheck,
    updatePassword,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Add displayName to improve debugging
AuthContext.displayName = "AuthContext";

// Hook for using the auth context
// Named function declaration for Fast Refresh compatibility
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    // Add additional debug info to help diagnose the issue
    console.error(
      "useAuth hook was called outside of the AuthProvider component. " +
      "Check that all components using useAuth are wrapped in AuthProvider."
    );
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
