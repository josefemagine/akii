import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
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
  syncUserProfile,
  ensureJosefAdmin,
  UserProfile,
  UserRole,
  UserStatus,
} from "@/lib/auth-simple";
import type { Session } from "@supabase/supabase-js";
import type { User } from "@/types/custom";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  error: Error | null;
}

export interface AuthContextType {
  // State
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  error: Error | null;

  // Actions
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ data: any | null; error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    metadata?: any,
  ) => Promise<{ data: any | null; error: Error | null }>;
  signInWithGoogle: () => Promise<{ data: any | null; error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updatePassword: (
    password: string,
  ) => Promise<{ data: any | null; error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isAdmin: false,
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
        const { data: currentSession, error: sessionError } =
          await getCurrentSession();

        if (sessionError) {
          console.error("Session error during initialization:", sessionError);
          if (isMounted) {
            setState((prev) => ({ ...prev, isLoading: false }));
          }
          return;
        }

        if (isMounted) {
          setState((prev) => ({ ...prev, session: currentSession }));
        }

        if (currentSession) {
          // Get user
          const { data: currentUser, error: userError } =
            await getCurrentUser();

          if (userError) {
            console.error("User error during initialization:", userError);
            if (isMounted) {
              setState((prev) => ({ ...prev, isLoading: false }));
            }
            return;
          }

          if (isMounted) {
            setState((prev) => ({ ...prev, user: currentUser }));
          }

          if (currentUser) {
            // Special handling for Josef
            if (currentUser.email === "josef@holm.com") {
              await ensureJosefAdmin();
            }

            // Get user profile
            const { data: profile, error: profileError } = await getUserProfile(
              currentUser.id,
            );

            if (profileError) {
              console.error(
                "Profile error during initialization:",
                profileError,
              );
              if (isMounted) {
                setState((prev) => ({ ...prev, isLoading: false }));
              }
              return;
            }

            if (isMounted && profile) {
              setState((prev) => ({
                ...prev,
                profile: profile,
                isAdmin: profile.role === "admin",
                isLoading: false,
              }));
            }
          } else {
            if (isMounted) {
              setState((prev) => ({ ...prev, isLoading: false }));
            }
          }
        } else {
          if (isMounted) {
            setState((prev) => ({
              ...prev,
              user: null,
              profile: null,
              isAdmin: false,
              isLoading: false,
            }));
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          }));
        }
      }
    }

    // Set up auth state change listener
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log(`Auth state changed: ${event}`);

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (isMounted) {
            setState((prev) => ({ ...prev, session: currentSession }));

            if (currentSession?.user) {
              setState((prev) => ({ ...prev, user: currentSession.user }));

              // Special handling for Josef
              if (currentSession.user.email === "josef@holm.com") {
                await ensureJosefAdmin();
              }

              // Get or create profile
              const { data: profile } = await getUserProfile(
                currentSession.user.id,
              );

              if (isMounted && profile) {
                setState((prev) => ({
                  ...prev,
                  profile: profile,
                  isAdmin: profile.role === "admin",
                }));
              }
            }
          }
        } else if (event === "SIGNED_OUT") {
          if (isMounted) {
            setState((prev) => ({
              ...prev,
              user: null,
              session: null,
              profile: null,
              isAdmin: false,
            }));
          }
        }
      },
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
    const pathRequiresAuth = location.pathname.startsWith("/dashboard");
    const pathRequiresAdmin = location.pathname.startsWith("/dashboard/admin");

    if (pathRequiresAuth && !state.isLoading && !state.user) {
      // Redirect to login if auth required
      navigate("/", { replace: true });
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this page.",
        variant: "destructive",
      });
    } else if (pathRequiresAdmin && !state.isLoading && !state.isAdmin) {
      // Redirect to dashboard if admin required but user is not admin
      if (state.user) {
        // Special case for Josef
        if (state.user.email !== "josef@holm.com") {
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
  }, [
    location.pathname,
    state.isLoading,
    state.user,
    state.isAdmin,
    navigate,
    toast,
  ]);

  // Sign-in handler
  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ data: any | null; error: Error | null }> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const response = await authSignIn(email, password);

      if (response.error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.error,
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
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  };

  // Sign-up handler
  const signUp = async (
    email: string,
    password: string,
    metadata?: any,
  ): Promise<{ data: any | null; error: Error | null }> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });

      setState((prev) => ({ ...prev, isLoading: false }));

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Sign-up error:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  };

  // Google sign-in handler
  const signInWithGoogle = async (): Promise<{
    data: any | null;
    error: Error | null;
  }> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { data, error } = await supabaseClient.auth.signInWithOAuth({
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

  // Sign-out handler
  const signOut = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await authSignOut();

      // Clear state
      setState((prev) => ({
        ...prev,
        user: null,
        session: null,
        profile: null,
        isAdmin: false,
        isLoading: false,
      }));

      // Redirect to home
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);

      toast({
        title: "Sign out error",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });

      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Refresh user profile
  const refreshUser = async () => {
    if (!state.user) return;

    try {
      const { data: profile } = await getUserProfile(state.user.id);

      if (profile) {
        setState((prev) => ({
          ...prev,
          profile: profile,
          isAdmin: profile.role === "admin",
        }));
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  };

  // Update password handler
  const updatePassword = async (password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const { data, error } = await supabaseClient.auth.updateUser({
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

  // Create context value
  const value = {
    user: state.user,
    profile: state.profile,
    session: state.session,
    isLoading: state.isLoading,
    isAdmin: state.isAdmin,
    error: state.error,
    signIn,
    signOut,
    signUp,
    signInWithGoogle,
    refreshUser,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
