import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  supabase,
  getCurrentSession,
  handleHashRedirect,
  checkSessionPersistence,
  isBrowser,
} from "@/lib/supabase";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  clearStoredAuth,
  generateSecureState,
  getReturnPath,
  getStoredTokens,
  refreshAccessToken,
  securelyStoreTokens,
  storeReturnPath,
} from "@/lib/auth-helpers";
import { Database } from "@/types/supabase";

export type UserRole = "user" | "admin" | "team_member";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpsert = Database["public"]["Tables"]["profiles"]["Insert"];
type SubscriptionUpsert =
  Database["public"]["Tables"]["subscriptions"]["Insert"];

// Explicitly define the ProfileInsert type with required fields
interface ProfileInsert {
  id: string;
  email: string;
  updated_at: string;
}

// Update the Subscription type to match the database schema
interface Subscription {
  id: string;
  user_id: string;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "inactive" | "trial" | "cancelled" | "expired";
  message_limit: number;
  messages_used: number;
  trial_ends_at: string | null;
  renews_at: string | null;
  addons: Record<string, any>;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

// Create a separate type for our extended user
export interface ExtendedUser {
  id: string;
  email: string;
  role: UserRole;
  subscription: Subscription;
  created_at: string;
  updated_at: string;
  aud: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
}

// Update the User type to be our ExtendedUser
export type User = ExtendedUser;

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  userRole: UserRole | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null;
    data: { user: User | null } | null;
  }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null;
    data: { user: User | null } | null;
  }>;
  signInWithGoogle: () => Promise<void>;
  verifyOtp: (
    email: string,
    token: string,
  ) => Promise<{
    error: Error | null;
    data: { user: User | null } | null;
  }>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
  confirmPasswordReset: (
    email: string,
    token: string,
    newPassword: string,
  ) => Promise<{
    error: Error | null;
    data: any;
  }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the hook directly as a named function declaration
// for better Fast Refresh compatibility
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Update the upsertProfile function
const upsertProfile = async (userId: string, email: string) => {
  // First, upsert the profile
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: email,
      role: "user",
      updated_at: new Date().toISOString(),
    } as any,
    {
      onConflict: "id",
    },
  );

  if (profileError) {
    console.error("Error upserting profile:", profileError);
    return { error: profileError };
  }

  // Then, upsert the subscription
  const { error: subscriptionError } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        plan: "free",
        status: "active",
        message_limit: 1000,
        messages_used: 0,
        trial_ends_at: null,
        renews_at: null,
        addons: {},
        payment_method: null,
        updated_at: new Date().toISOString(),
      } as any,
      {
        onConflict: "user_id",
      },
    );

  return { error: subscriptionError };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Create default user function
  const createDefaultUser = (sessionUser: SupabaseUser): User => {
    const defaultSubscription: Subscription = {
      id: sessionUser.id,
      user_id: sessionUser.id,
      plan: "free",
      status: "active",
      message_limit: 1000,
      messages_used: 0,
      trial_ends_at: null,
      renews_at: null,
      addons: {},
      payment_method: null,
      created_at: sessionUser.created_at,
      updated_at: sessionUser.updated_at,
    };

    const user: User = {
      id: sessionUser.id,
      email: sessionUser.email || "",
      role: "user" as UserRole,
      subscription: defaultSubscription,
      created_at: sessionUser.created_at,
      updated_at: sessionUser.updated_at,
      aud: sessionUser.aud,
      app_metadata: sessionUser.app_metadata,
      user_metadata: sessionUser.user_metadata,
    };

    return user;
  };

  // Initialize auth state when component mounts
  useEffect(() => {
    const initializeAuthState = async () => {
      console.log("Initializing auth state...");
      setIsLoading(true);

      try {
        // [EXTENDED FIX] Handle potential connection errors by wrapping critical auth operations
        const getSessionWithFallback = async () => {
          try {
            // Try to get session normally first
            const sessionResult = await supabase.auth.getSession();

            if (sessionResult.error) {
              throw sessionResult.error;
            }

            return sessionResult;
          } catch (initialError) {
            console.error(
              "[EXTENDED FIX] Error in primary session check, trying fallback:",
              initialError,
            );

            // Check localStorage for fallback authentication data
            try {
              const fallbackData = localStorage.getItem(
                "akii-auth-fallback-user",
              );
              const recentSuccessTime = localStorage.getItem(
                "akii-auth-success-time",
              );

              if (fallbackData) {
                const userData = JSON.parse(fallbackData);
                const timestamp = userData.timestamp || 0;
                const isRecent = Date.now() - timestamp < 3600000; // Less than 1 hour old

                // If we have recent auth success, use the fallback data
                if (isRecent || recentSuccessTime) {
                  console.log(
                    "[EXTENDED FIX] Using fallback auth data:",
                    userData.email,
                  );

                  // Try one more time with a different approach
                  try {
                    return await supabase.auth.getSession();
                  } catch (finalError) {
                    console.error(
                      "[EXTENDED FIX] Final session check failed:",
                      finalError,
                    );

                    // Return a synthetic session to prevent UI issues
                    return {
                      data: { session: null },
                      error: new Error(
                        "Using fallback auth mechanism - limited functionality",
                      ),
                    };
                  }
                }
              }

              // If no valid fallback, re-throw the original error
              throw initialError;
            } catch (fallbackError) {
              console.error(
                "[EXTENDED FIX] Fallback auth check failed:",
                fallbackError,
              );
              throw initialError; // Re-throw original error
            }
          }
        };

        // Use our enhanced session getter
        const {
          data: { session: currentSession },
          error,
        } = await getSessionWithFallback();

        if (error && !currentSession) {
          console.error(
            "[EXTENDED FIX] Error getting session during initialization:",
            error,
          );
          throw error;
        }

        // CRITICAL FIX: Synchronously process session if it exists
        if (currentSession) {
          console.log("Found existing session during initialization", {
            userId: currentSession.user.id,
            email: currentSession.user.email,
          });

          // Set session immediately
          setSession(currentSession);

          try {
            // Get user profile directly with a synchronous approach to avoid race conditions
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", currentSession.user.id)
              .single();

            // Create user object with profile data
            const userWithProfile = {
              ...createDefaultUser(currentSession.user),
              role: profile?.role || "user",
            };

            console.log("Setting authenticated user state with profile:", {
              id: userWithProfile.id,
              email: userWithProfile.email,
              role: userWithProfile.role,
            });

            // Use function updaters to guarantee state update
            setUser(() => userWithProfile);
            setUserRole(() => userWithProfile.role as UserRole);

            // Store tokens securely
            securelyStoreTokens({
              access_token: currentSession.access_token,
              refresh_token: currentSession.refresh_token,
            });

            // Force redirect to dashboard if on homepage
            if (location.pathname === "/") {
              console.log(
                "[AUTH_FIX] Logged in user on homepage, will redirect to dashboard",
              );
              setTimeout(() => {
                navigate("/dashboard");
              }, 200);
            }
          } catch (profileError) {
            console.error(
              "Error getting profile for authenticated user:",
              profileError,
            );

            // Even without profile, still set the user
            const defaultUser = createDefaultUser(currentSession.user);
            setUser(() => defaultUser);
            setUserRole(() => defaultUser.role as UserRole);
          }
        } else {
          console.log("No valid session found during initialization...");
          // Try to restore from stored refresh token
          const storedTokens = getStoredTokens();
          if (storedTokens.refresh_token) {
            console.log(
              "Found stored refresh token, attempting to restore session",
            );
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              // Session restored - get a fresh session instead of calling refreshSession
              const { data: refreshData } = await supabase.auth.getSession();
              if (refreshData.session) {
                setSession(refreshData.session);

                // Get profile data
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", refreshData.session.user.id)
                  .single();

                // Create user object with profile data
                const userWithProfile = {
                  ...createDefaultUser(refreshData.session.user),
                  role: profile?.role || "user",
                };

                // Update state
                setUser(userWithProfile);
                setUserRole(userWithProfile.role);
              }
            } else {
              clearStoredAuth();
            }
          }
        }
      } catch (error) {
        console.error("Error in initializeAuthState:", error);
        // Clear state on error
        setUser(null);
        setSession(null);
        setUserRole(null);
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initializeAuthState();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);

        if (event === "SIGNED_IN" && session) {
          console.log("User signed in, updating session");

          // CRITICAL FIX: Immediately update session state before any async operations
          setSession(() => session);

          try {
            // Same approach as initialization to avoid race conditions
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            // Create user object with profile data
            const userWithProfile = {
              ...createDefaultUser(session.user),
              role: profile?.role || "user",
            };

            console.log(
              "[CRITICAL FIX] Setting authenticated user state after signin:",
              {
                id: userWithProfile.id,
                email: userWithProfile.email,
                role: userWithProfile.role,
              },
            );

            // Use function updaters for guaranteed state updates
            setUser(() => userWithProfile);
            setUserRole(() => userWithProfile.role as UserRole);

            // Store tokens securely
            securelyStoreTokens({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            });

            // Clear loading state
            setIsLoading(false);

            // Redirect to dashboard if on homepage
            if (location.pathname === "/") {
              navigate("/dashboard");
            }
          } catch (error) {
            console.error("[CRITICAL FIX] Error updating user profile:", error);
            // Even on error, still set basic user info
            const defaultUser = createDefaultUser(session.user);
            setUser(() => defaultUser);
            setUserRole(() => defaultUser.role);
            setIsLoading(false);
          }
        } else if (event === "SIGNED_OUT") {
          console.log("Session cleared in auth state change...");
          setUser(null);
          setSession(null);
          setUserRole(null);
          clearStoredAuth();
        } else if (event === "TOKEN_REFRESHED" && session) {
          console.log("Token refreshed, updating session");
          setSession(session);

          // Store tokens securely
          securelyStoreTokens({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
        }
      },
    );

    // Cleanup function to remove auth listener
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  // Check and clear any stale auth states that might be stuck
  useEffect(() => {
    // If auth-in-progress is set but no active flow for more than 5 minutes, clear it
    const authInProgressTime = localStorage.getItem("auth-in-progress-time");
    if (
      localStorage.getItem("auth-in-progress") === "true" &&
      authInProgressTime
    ) {
      const timeElapsed = Date.now() - parseInt(authInProgressTime);
      // If more than 5 minutes, clear it
      if (timeElapsed > 300000) {
        console.log("[Auth] Clearing stale auth-in-progress state");
        localStorage.removeItem("auth-in-progress");
        localStorage.removeItem("auth-in-progress-time");
      }
    }
  }, []);

  // Force auth loading to complete after timeout
  useEffect(() => {
    let forceTimeoutId: number;

    if (isLoading) {
      console.log("[AuthContext] Auth loading started");

      // Force loading to end after 8 seconds
      forceTimeoutId = window.setTimeout(() => {
        console.log(
          "[AuthContext] Force timeout reached - ending loading state",
        );
        setIsLoading(false);
      }, 8000);
    }

    return () => {
      if (forceTimeoutId) window.clearTimeout(forceTimeoutId);
    };
  }, [isLoading]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("[Email Auth] Starting email sign-in process for:", email);
      setIsLoading(true);

      // CRITICAL FIX: Store forced auth state in localStorage BEFORE the auth attempt
      localStorage.setItem("force-auth-login", "true");
      localStorage.setItem("force-auth-email", email);
      localStorage.setItem("force-auth-timestamp", Date.now().toString());

      // Clear any existing auth data
      localStorage.removeItem("auth-in-progress");
      localStorage.removeItem("auth-in-progress-time");

      // Set auth in progress with timestamp
      localStorage.setItem("auth-in-progress", "true");
      localStorage.setItem("auth-in-progress-time", Date.now().toString());

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[Email Auth] Sign-in error:", error);
        toast({
          title: "Sign In Error",
          description: error.message,
          variant: "destructive",
        });
        return { data: { user: null }, error };
      }

      if (data?.user) {
        console.log("[Email Auth] Sign-in successful for:", email);
        console.log("[Email Auth] Session data:", {
          hasSession: !!data.session,
          userId: data.user.id,
          email: data.user.email,
        });

        // Immediately update session and user in state
        if (data.session) {
          console.log("[Email Auth] Updating session and user in state");

          // Instead of using forceUpdateUserState, implement the logic directly
          try {
            // Set session immediately
            setSession(data.session);

            // Get user profile directly
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.user.id)
              .single();

            // Create full user object
            const userWithProfile = {
              ...createDefaultUser(data.user),
              role: profile?.role || "user",
            };

            console.log("[Email Auth] User profile loaded:", {
              id: userWithProfile.id,
              email: userWithProfile.email,
              role: userWithProfile.role,
            });

            // Update user state with function updaters for reliability
            setUser(() => userWithProfile);
            setUserRole(() => userWithProfile.role as UserRole);

            // Store tokens securely
            securelyStoreTokens({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            });

            // Handle redirection after state is updated
            setTimeout(() => {
              // Store the return path (use dashboard as default)
              const returnPath =
                localStorage.getItem("auth-return-path") || "/dashboard";
              localStorage.removeItem("auth-return-path");

              console.log("[Email Auth] Force redirecting to:", returnPath);
              window.location.href = returnPath;
            }, 500);
          } catch (error) {
            console.error("[Email Auth] Error updating user profile:", error);

            // Even on error, we want to redirect to dashboard
            setTimeout(() => {
              const returnPath =
                localStorage.getItem("auth-return-path") || "/dashboard";
              localStorage.removeItem("auth-return-path");
              window.location.href = returnPath;
            }, 500);
          }
        } else {
          console.error(
            "[Email Auth] No session data received after successful auth",
          );
          toast({
            title: "Sign In Error",
            description:
              "Authentication successful but session data is missing. Please try again.",
            variant: "destructive",
          });
        }

        // Create extended user for return value
        const userWithRole = createDefaultUser(data.user);
        return { data: { user: userWithRole }, error: null };
      } else {
        const errorMsg = "No user data returned after sign in";
        console.error("[Email Auth] Error:", errorMsg);
        return { data: { user: null }, error: new Error(errorMsg) };
      }
    } catch (error) {
      console.error("[Email Auth] Sign-in error:", error);
      toast({
        title: "Sign In Error",
        description:
          error instanceof Error
            ? error.message
            : "There was a problem signing in. Please try again.",
        variant: "destructive",
      });
      return { data: { user: null }, error: error as Error };
    } finally {
      console.log(
        "[Email Auth] Sign-in process completed, clearing auth-in-progress",
      );
      localStorage.removeItem("auth-in-progress");
      localStorage.removeItem("auth-in-progress-time");
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (result.data.user) {
        // User created but needs email verification
        const userWithRole = createDefaultUser(result.data.user);
        return { data: { user: userWithRole }, error: result.error };
      }

      return { data: { user: null }, error: result.error };
    } catch (error) {
      return { data: { user: null }, error: error as Error };
    }
  };

  // Direct Google Sign-In implementation
  const signInWithGoogle = async () => {
    try {
      console.log("[Google Auth] Starting Google sign-in process");

      // Clear any existing auth state that might be stuck
      clearStoredAuth();

      // Store current path to return to after login
      storeReturnPath(
        location.pathname === "/" ? "/dashboard" : location.pathname,
      );

      // Set auth in progress with timestamp
      localStorage.setItem("auth-in-progress", "true");
      localStorage.setItem("auth-in-progress-time", Date.now().toString());

      // Determine redirect URL based on environment
      const currentHost = window.location.hostname;
      const isProduction = currentHost === "www.akii.com";
      const redirectUrl = isProduction
        ? "https://www.akii.com/auth/callback"
        : `${window.location.origin}/auth/callback`;

      console.log(`[Google Auth] Using redirect URL: ${redirectUrl}`);

      // Use Supabase's OAuth with dynamic URL
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
            scope: "email profile", // Explicitly request these scopes
          },
          skipBrowserRedirect: false, // Ensure browser redirects to OAuth provider
        },
      });

      if (error) {
        console.error(
          "[Google Auth] Error starting Google sign-in flow:",
          error,
        );
        localStorage.removeItem("auth-in-progress");
        localStorage.removeItem("auth-in-progress-time");
        throw error;
      }

      if (data?.url) {
        console.log("[Google Auth] Redirecting to:", data.url);
        // Use replace for security
        window.location.replace(data.url);
      } else {
        console.error("[Google Auth] No redirect URL returned from Supabase");
        throw new Error("Authentication service did not return a redirect URL");
      }
    } catch (error) {
      console.error("[Google Auth] Sign-in error:", error);
      // Clear auth in progress if there's an error
      localStorage.removeItem("auth-in-progress");
      localStorage.removeItem("auth-in-progress-time");

      toast({
        title: "Sign In Error",
        description:
          "There was a problem signing in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      const result = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (result.data.user) {
        const userWithRole = createDefaultUser(result.data.user);
        return { data: { user: userWithRole }, error: result.error };
      }

      return { data: { user: null }, error: result.error };
    } catch (error) {
      return { data: { user: null }, error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      return { error, data: null };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const confirmPasswordReset = async (
    email: string,
    token: string,
    newPassword: string,
  ) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      return { error, data: null };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out user...");

      // Sign out with Supabase (global scope to remove all devices)
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) {
        console.error("Error signing out with Supabase:", error);
        throw error;
      }

      // Clear all local auth data
      clearStoredAuth();

      // Clear state
      setUser(null);
      setSession(null);
      setUserRole(null);

      console.log("Sign out successful, redirecting to home");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign Out Error",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isAdmin = userRole === "admin";

  const value = {
    user,
    session,
    isLoading,
    setIsLoading,
    userRole,
    isAdmin,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signInWithGoogle,
    verifyOtp,
    resetPassword,
    confirmPasswordReset,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
