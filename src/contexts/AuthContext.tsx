import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { isExtensionContext } from "@/lib/browser-check";
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
  AuthResponse,
} from "@/lib/auth-helpers";
import type { Session } from "@supabase/supabase-js";
import type { User } from "@/types/custom";

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
  ) => Promise<{ data: any | null; error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    metadata?: any,
  ) => Promise<{ data: any | null; error: Error | null }>;
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
}

const AdminEmailList = [
  "josef@holm.com",
  // Add more admin emails as needed
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to check admin override
function checkAdminOverride(user: User | null): boolean {
  if (!user || !user.email) return false;

  // Special case for Josef - always grant admin access
  const isJosef = user.email === "josef@holm.com";
  if (isJosef) {
    // If it's Josef, always set the override
    try {
      localStorage.setItem("akii_admin_override", "true");
      localStorage.setItem("akii_admin_override_email", "josef@holm.com");
      localStorage.setItem(
        "akii_admin_override_expiry",
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      );

      // Also set legacy format for maximum compatibility
      localStorage.setItem("admin_override", "true");
      localStorage.setItem("admin_override_email", "josef@holm.com");
      localStorage.setItem("admin_override_time", Date.now().toString());

      // Additional admin flags
      localStorage.setItem("auth-user-role", "admin");
      localStorage.setItem("user-role", "admin");
      localStorage.setItem("akii-auth-role", "admin");

      console.log("Admin override set for Josef");

      // Only attempt to send chrome messages if in extension context
      if (
        isExtensionContext() &&
        chrome &&
        chrome.runtime &&
        chrome.runtime.sendMessage
      ) {
        try {
          chrome.runtime.sendMessage({
            action: "admin_override",
            email: "josef@holm.com",
          });
        } catch (err) {
          console.warn(
            "Failed to send admin override message to extension",
            err,
          );
        }
      }
    } catch (error) {
      console.error("Error setting admin override for Josef:", error);
    }
    return true;
  }

  // Check for current format
  const adminOverride = localStorage.getItem("akii_admin_override") === "true";
  const adminEmail = localStorage.getItem("akii_admin_override_email");
  const adminExpiry = localStorage.getItem("akii_admin_override_expiry");

  // Check for legacy format
  const legacyOverride = localStorage.getItem("admin_override") === "true";
  const legacyEmail = localStorage.getItem("admin_override_email");

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
        const { data: currentSession, error: sessionError } =
          await getCurrentSession();

        if (sessionError) {
          console.error("Session error during initialization:", sessionError);
          // Try to recover from backup data
          const backupEmail = localStorage.getItem("akii-auth-user-email");
          const backupId = localStorage.getItem("akii-auth-user-id");
          const backupTimestamp = localStorage.getItem("akii-auth-timestamp");

          if (backupEmail && backupId && backupTimestamp) {
            const timestamp = parseInt(backupTimestamp);
            const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000; // 24 hours

            if (isRecent) {
              console.log("Recovering from backup auth data for:", backupEmail);
              // Create a synthetic user object
              const syntheticUser = {
                id: backupId,
                email: backupEmail,
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                created_at: new Date(timestamp).toISOString(),
              };

              if (isMounted) {
                setState((prev) => ({
                  ...prev,
                  user: syntheticUser as User,
                  isAdmin:
                    backupEmail === "josef@holm.com" ||
                    checkAdminOverride(syntheticUser as User),
                }));

                // Try to get or create profile
                try {
                  const { data: profile } = await getUserProfile(backupId);
                  if (profile && isMounted) {
                    setState((prev) => ({ ...prev, profile }));
                  }
                } catch (profileError) {
                  console.error(
                    "Error getting profile from backup:",
                    profileError,
                  );
                }
              }
            }
          }
        } else if (isMounted) {
          setState((prev) => ({ ...prev, session: currentSession }));
        }

        if (currentSession) {
          // Get user
          const { data: currentUser, error: userError } =
            await getCurrentUser();

          if (userError) throw userError;

          if (isMounted) {
            setState((prev) => ({ ...prev, user: currentUser }));

            // Check for admin override
            const hasAdminOverride = checkAdminOverride(currentUser);

            if (hasAdminOverride) {
              console.log("Admin override active for", currentUser.email);
              setState((prev) => ({ ...prev, isAdmin: true }));
            }

            // Store backup data
            try {
              if (currentUser.email) {
                localStorage.setItem("akii-auth-user-email", currentUser.email);
                localStorage.setItem("akii-auth-user-id", currentUser.id);
                localStorage.setItem(
                  "akii-auth-timestamp",
                  Date.now().toString(),
                );
              }
            } catch (storageError) {
              console.error("Failed to store backup auth data:", storageError);
            }
          }

          if (currentUser) {
            // Get user profile
            const { data: profile, error: profileError } = await getUserProfile(
              currentUser.id,
            );

            if (profileError) {
              // If no profile exists, create one
              const { data: newProfile, error: createError } =
                await ensureUserProfile(currentUser);

              if (createError) throw createError;

              if (isMounted && newProfile) {
                setState((prev) => ({ ...prev, profile: newProfile }));

                // Only set isAdmin from profile if no override
                if (!checkAdminOverride(currentUser)) {
                  setState((prev) => ({
                    ...prev,
                    isAdmin: newProfile.role === "admin",
                  }));
                }
              }
            } else if (isMounted && profile) {
              setState((prev) => ({ ...prev, profile: profile }));

              // Only set isAdmin from profile if no override
              if (!checkAdminOverride(currentUser)) {
                setState((prev) => ({
                  ...prev,
                  isAdmin: profile.role === "admin",
                }));
              }
            }

            // Log auth status
            console.log("Auth initialized:", {
              user: currentUser.email,
              role: profile?.role || "user",
              admin:
                state.isAdmin ||
                profile?.role === "admin" ||
                checkAdminOverride(currentUser),
            });
          }
        } else {
          // No session, try backup data before clearing state
          const backupEmail = localStorage.getItem("akii-auth-user-email");
          const backupId = localStorage.getItem("akii-auth-user-id");
          const backupTimestamp = localStorage.getItem("akii-auth-timestamp");

          if (backupEmail && backupId && backupTimestamp) {
            const timestamp = parseInt(backupTimestamp);
            const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000; // 24 hours

            if (isRecent) {
              console.log(
                "No active session but found backup data for:",
                backupEmail,
              );
              // Create a synthetic user object
              const syntheticUser = {
                id: backupId,
                email: backupEmail,
                app_metadata: {},
                user_metadata: {},
                aud: "authenticated",
                created_at: new Date(timestamp).toISOString(),
              };

              if (isMounted) {
                setState((prev) => ({
                  ...prev,
                  user: syntheticUser as User,
                  isAdmin:
                    backupEmail === "josef@holm.com" ||
                    checkAdminOverride(syntheticUser as User),
                }));

                // Try to get or create profile
                try {
                  const { data: profile } = await getUserProfile(backupId);
                  if (profile && isMounted) {
                    setState((prev) => ({ ...prev, profile }));
                  }
                } catch (profileError) {
                  console.error(
                    "Error getting profile from backup:",
                    profileError,
                  );
                }

                return; // Skip clearing state
              }
            }
          }

          // If we get here, no valid backup was found
          if (isMounted) {
            setState((prev) => ({
              ...prev,
              user: null,
              profile: null,
              isAdmin: false,
            }));
          }
          console.log("No active session found");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Try to recover from backup data
        const backupEmail = localStorage.getItem("akii-auth-user-email");
        const backupId = localStorage.getItem("akii-auth-user-id");

        if (backupEmail && backupId && backupEmail === "josef@holm.com") {
          console.log(
            "Critical error but recovering for admin user:",
            backupEmail,
          );
          // Force admin override
          localStorage.setItem("akii_admin_override", "true");
          localStorage.setItem("akii_admin_override_email", "josef@holm.com");
          localStorage.setItem(
            "akii_admin_override_expiry",
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          );
          sessionStorage.setItem("admin_override", "true");
          sessionStorage.setItem("admin_override_email", "josef@holm.com");
        }
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

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (isMounted) {
            setState((prev) => ({ ...prev, session: currentSession }));

            if (currentSession?.user) {
              setState((prev) => ({ ...prev, user: currentSession.user }));

              // Check for admin override
              const hasAdminOverride = checkAdminOverride(currentSession.user);
              if (hasAdminOverride) {
                console.log("Admin override detected on auth change");
                setState((prev) => ({ ...prev, isAdmin: true }));
              }

              // Store backup data
              try {
                if (currentSession.user.email) {
                  localStorage.setItem(
                    "akii-auth-user-email",
                    currentSession.user.email,
                  );
                  localStorage.setItem(
                    "akii-auth-user-id",
                    currentSession.user.id,
                  );
                  localStorage.setItem(
                    "akii-auth-timestamp",
                    Date.now().toString(),
                  );
                }
              } catch (storageError) {
                console.error(
                  "Failed to store backup auth data:",
                  storageError,
                );
              }

              // Get or create profile
              const { data: profile } = await getUserProfile(
                currentSession.user.id,
              );

              if (isMounted && profile) {
                setState((prev) => ({ ...prev, profile: profile }));

                // Only set isAdmin from profile if no override
                if (!hasAdminOverride) {
                  setState((prev) => ({
                    ...prev,
                    isAdmin: profile.role === "admin",
                  }));
                }
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

            // Clear backup data
            localStorage.removeItem("akii-auth-user-email");
            localStorage.removeItem("akii-auth-user-id");
            localStorage.removeItem("akii-auth-timestamp");
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
    const pathRequiresAuth =
      location.pathname.startsWith("/dashboard") ||
      location.pathname.startsWith("/admin");

    const pathRequiresAdmin = location.pathname.startsWith("/admin");

    // Special case for Josef
    const isJosef = state.user?.email === "josef@holm.com";

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
        if (!isJosef) {
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
      // Return proper format with null data and the error
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

  // Verify OTP handler
  const verifyOtp = async (
    email: string,
    token: string,
  ): Promise<{ data: any | null; error: Error | null }> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { data, error } = await supabaseClient.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });

      setState((prev) => ({ ...prev, isLoading: false }));

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("OTP verification error:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  };

  // Reset password handler
  const resetPassword = async (
    email: string,
  ): Promise<{ data: any | null; error: Error | null }> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { data, error } = await supabaseClient.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        },
      );

      setState((prev) => ({ ...prev, isLoading: false }));

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Password reset error:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  };

  // Confirm password reset handler
  const confirmPasswordReset = async (
    email: string,
    token: string,
    password: string,
  ): Promise<{ data: any | null; error: Error | null }> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // First verify the token
      const { error: verifyError } = await supabaseClient.auth.verifyOtp({
        email,
        token,
        type: "recovery",
      });

      if (verifyError) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return { data: null, error: verifyError };
      }

      // Then update the password
      const { data, error } = await supabaseClient.auth.updateUser({
        password,
      });

      setState((prev) => ({ ...prev, isLoading: false }));

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Password reset confirmation error:", error);
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
        console.log("Admin override detected on profile refresh");
        setState((prev) => ({ ...prev, isAdmin: true }));
      }

      const { data: profile } = await getUserProfile(state.user.id);

      if (profile) {
        setState((prev) => ({ ...prev, profile: profile }));
        // Only set isAdmin from profile if no override
        if (!hasAdminOverride) {
          setState((prev) => ({ ...prev, isAdmin: profile.role === "admin" }));
        }
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for using the auth context
// Named function declaration is required for Fast Refresh compatibility
// Do not convert to arrow function
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
