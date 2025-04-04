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

// Import all core authentication functionality from the consolidated module
import {
  // Types
  User,
  Session,
  UserRole,
  UserStatus,
  SupabaseResponse,
  
  // Clients
  auth,
  supabase,
  
  // Core functions
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
  verifyConnection
} from "@/lib/auth-core";
import { UserProfile } from "@/lib/auth-helpers";

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
        console.log("Setting loading state to false due to user fetch error");
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
        console.log("No user found, setting loading state to false");
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
      
      console.log("User authenticated, attempting to load or create profile", { 
        userId: user.id, 
        email: user.email,
        hasRawUserMetaData: !!(user as any)._rawData?.raw_user_meta_data || !!(user as any).raw_user_meta_data,
        hasUserMetadata: !!user.user_metadata,
        userMetadataKeys: user.user_metadata ? Object.keys(user.user_metadata) : []
      });
      
      // Retrieve stored metadata if available
      let storedMetadata: Record<string, any> | null = null;
      try {
        const metadataString = localStorage.getItem("signup-metadata");
        const storedEmail = localStorage.getItem("signup-email");
        
        if (metadataString && storedEmail === user.email) {
          storedMetadata = JSON.parse(metadataString);
          console.log("Retrieved stored metadata for profile creation:", storedMetadata);
          
          // Update user metadata for profile creation
          if (storedMetadata) {
            user.user_metadata = {
              ...user.user_metadata,
              ...storedMetadata
            };
          }
        }
        
        // Also check backup storage location
        const backupKey = `akii-signup-${user.email?.replace(/[^a-zA-Z0-9]/g, "") || ''}`;
        const backupData = sessionStorage.getItem(backupKey);
        if (backupData && (!storedMetadata || Object.keys(storedMetadata).length === 0)) {
          try {
            const parsedBackup = JSON.parse(backupData);
            console.log("Retrieved backup metadata for profile creation:", parsedBackup.metadata);
            
            if (parsedBackup.metadata) {
              storedMetadata = parsedBackup.metadata;
              user.user_metadata = {
                ...user.user_metadata,
                ...parsedBackup.metadata
              };
            }
          } catch (e) {
            console.warn("Failed to parse backup metadata:", e);
          }
        }
      } catch (error) {
        console.error("Error retrieving stored metadata:", error);
      }
      
      // Ensure profile exists - this will create it if needed
      let retryCount = 0;
      let userProfile: UserProfile | null = null;
      let profileError: Error | null = null;
      const MAX_RETRIES = 3;
      
      // Create a timeout for just the profile loading portion
      const profileLoadingTimeout = setTimeout(() => {
        if (!userProfile) {
          console.warn("Profile loading taking too long, will continue with limited functionality");
          profileError = new Error("Profile loading timed out");
          
          // Cache the user data for emergency recovery
          if (user) {
            try {
              localStorage.setItem('akii-user-emergency', JSON.stringify(user));
            } catch (e) {
              console.warn("Failed to cache emergency user data:", e);
            }
          }
        }
      }, 5000); // 5 second timeout just for profile loading
      
      while (!userProfile && retryCount < MAX_RETRIES) {
        try {
          // Try to get user info from database
          console.log(`Attempt ${retryCount + 1}/${MAX_RETRIES} to get user profile`);
          
          if (retryCount > 0) {
            // Wait before retry with exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 500));
          }
          
          // Ensure profile exists - this will create it if needed
          const { data: profile, error: fetchedProfileError } = await ensureUserProfile(user.id);
          
          userProfile = profile;
          profileError = fetchedProfileError;
          
          if (fetchedProfileError) {
            console.error(`Profile fetch attempt ${retryCount + 1} failed:`, fetchedProfileError);
            retryCount++;
          } else if (!userProfile) {
            console.warn(`Profile fetch attempt ${retryCount + 1} returned null profile`);
            retryCount++;
          } else {
            break; // Success, exit loop
          }
        } catch (error) {
          console.error(`Unexpected error in profile fetch attempt ${retryCount + 1}:`, error);
          profileError = error instanceof Error ? error : new Error(String(error));
          retryCount++;
        }
      }
      
      // Clear the profile loading timeout since we've completed that step
      clearTimeout(profileLoadingTimeout);
      
      // Force profile creation if still no profile
      if (!userProfile && retryCount >= MAX_RETRIES) {
        console.warn("Creating fallback profile after max retries");
        
        // Create a minimal profile directly
        userProfile = {
          id: user.id,
          email: user.email || "",
          first_name: user.user_metadata?.first_name || "",
          last_name: user.user_metadata?.last_name || "",
          role: "user",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Try to persist this profile to cache
        try {
          // Store in local cache
          const cachedProfiles = JSON.parse(localStorage.getItem('akii-profile-cache') || '{}');
          cachedProfiles[user.id] = {
            ...userProfile,
            cached_at: new Date().toISOString()
          };
          localStorage.setItem('akii-profile-cache', JSON.stringify(cachedProfiles));
          
          console.log("Stored fallback profile in cache");
        } catch (cacheError) {
          console.error("Failed to store fallback profile in cache:", cacheError);
        }
      }
      
      // If we have a user but no profile, proceed with user only
      if (!userProfile) {
        console.warn("No profile available, proceeding with user only");
      }
      
      // Determine if user is admin
      const isAdmin = userProfile?.role === "admin" || hasValidAdminOverride(user.email || "");
      const userRole = userProfile?.role || null;
      
      // Set state with user, profile and session
      setState({
        user,
        profile: userProfile as UserProfile | null,
        session,
        isLoading: false,
        isAdmin,
        userRole: userRole as UserRole | null,
        error: null
      });
      
      // Clean up stored metadata once profile is loaded or created
      try {
        localStorage.removeItem("signup-metadata");
        localStorage.removeItem("signup-email");
        localStorage.removeItem("signup-timestamp");
      } catch (error) {
        console.error("Error cleaning up stored metadata:", error);
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      
      // Attempt to recover if there's a saved user ID
      try {
        const savedUserId = localStorage.getItem("akii-auth-user-id");
        const savedEmail = localStorage.getItem("akii-auth-user-email");
        
        if (savedUserId && savedEmail) {
          console.log("Attempting recovery with saved user ID:", savedUserId);
          
          // Create minimal user and profile objects
          const recoveryUser = {
            id: savedUserId,
            email: savedEmail,
            user_metadata: {}
          } as User;
          
          const recoveryProfile = {
            id: savedUserId,
            email: savedEmail,
            role: "user" as UserRole,
            status: "active" as UserStatus,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Set state with recovery data
          setState({
            user: recoveryUser,
            profile: recoveryProfile,
            session: null, 
            isLoading: false,
            isAdmin: false,
            userRole: "user",
            error: error as Error
          });
          
          // Show toast for recovery
          toast({
            title: "Session Recovery",
            description: "Your session needed recovery. Some features may require you to sign in again.",
            variant: "destructive"
          });
          
          return;
        }
      } catch (recoveryError) {
        console.error("Recovery attempt failed:", recoveryError);
      }
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error as Error,
        user: null,
        profile: null,
        session: null,
        isAdmin: false,
        userRole: null
      }));
    }
  }, [toast]);

  // Effect to initialize auth and handle auth changes
  useEffect(() => {
    if (!isBrowser) return;
    
    console.log("AuthProvider mounted, starting initialization");
    
    // Add a safety timeout to ensure loading state completes even if something gets stuck
    const safetyTimer = setTimeout(() => {
      console.warn("Auth loading safety timeout triggered after 20 seconds");
      // Check if we're still loading and if so, complete it
      setState(prev => {
        if (prev.isLoading) {
          console.warn("Forcing loading state to complete after timeout");
          
          // Try to get user data directly from local storage as emergency fallback
          let emergencyUser: User | null = null;
          let emergencyProfile: UserProfile | null = null;
          try {
            // Try to get session data
            const sessionStr = localStorage.getItem('supabase.auth.token');
            if (sessionStr) {
              const sessionData = JSON.parse(sessionStr);
              console.log("Emergency: Found session data in localStorage");
              
              if (sessionData?.currentSession?.user) {
                emergencyUser = sessionData.currentSession.user;
                console.log("Emergency: Retrieved user from localStorage", emergencyUser);
                
                // Try to retrieve cached profile if it exists
                const cachedProfileStr = localStorage.getItem(`akii-profile-${emergencyUser.id}`);
                if (cachedProfileStr) {
                  try {
                    emergencyProfile = JSON.parse(cachedProfileStr);
                    console.log("Emergency: Retrieved cached profile", emergencyProfile);
                  } catch (e) {
                    console.error("Emergency: Failed to parse cached profile", e);
                  }
                }
                
                // Check if we can try a direct profile fetch
                if (emergencyUser.id && !emergencyProfile) {
                  // Perform an immediate fetch of the profile
                  supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', emergencyUser.id)
                    .single()
                    .then(({ data, error }: { data: UserProfile | null; error: Error | null }) => {
                      if (data && !error) {
                        console.log("Emergency: Direct profile fetch successful", data);
                        // Store this profile for future use
                        localStorage.setItem(`akii-profile-${emergencyUser.id}`, JSON.stringify(data));
                        
                        // Update the state with the fetched profile
                        setState(currentState => {
                          if (currentState.user?.id === emergencyUser.id) {
                            return {
                              ...currentState,
                              profile: data,
                              isAdmin: data.role === 'admin',
                              userRole: data.role || null
                            };
                          }
                          return currentState;
                        });
                      } else {
                        console.error("Emergency: Failed to fetch profile directly", error);
                      }
                    });
                }
              }
            }
          } catch (e) {
            console.error("Emergency recovery failed:", e);
          }
          
          // If we have emergency user data, use it along with any profile data we found
          if (emergencyUser) {
            return { 
              ...prev, 
              isLoading: false,
              user: emergencyUser,
              profile: emergencyProfile || prev.profile,
              isAdmin: emergencyProfile?.role === 'admin' || prev.isAdmin,
              userRole: emergencyProfile?.role || prev.userRole,
              error: new Error("Profile loading timed out, using emergency recovery data")
            };
          }
          
          // Otherwise just stop loading
          return { 
            ...prev, 
            isLoading: false, 
            error: new Error("Authentication initialization timed out. Please refresh the page.")
          };
        }
        return prev;
      });
    }, 10000); // 10 second timeout (increased from 5)
    
    // Initialize auth with error handling
    initializeAuth().catch(err => {
      console.error("Unhandled error during auth initialization:", err);
      // Force loading to complete even with errors
      setState(prev => ({ ...prev, isLoading: false, error: err }));
    });
    
    // Set up auth listener
    const { data: authListener } = auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth event: ${event}`, session);
      
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        try {
          // Check for redirect flags
          const loginInProgress = localStorage.getItem("akii-login-in-progress") === "true";
          let redirectTarget = localStorage.getItem("akii-auth-redirect");
          
          // Fix typo in redirect target if present
          if (redirectTarget && redirectTarget.includes('/ddashboard')) {
            console.log("Fixing typo in redirect target:", redirectTarget);
            redirectTarget = redirectTarget.replace('/ddashboard', '/dashboard');
            localStorage.setItem("akii-auth-redirect", redirectTarget);
          }
          
          const shouldRedirect = loginInProgress || redirectTarget;
          
          if (shouldRedirect) {
            console.log("Auth state changed with redirect flags, preparing for dashboard redirect");
          }
          
          // Get latest user data
          const { data: user, error: userError } = await getCurrentUser();
          
          if (userError) {
            console.error("Error getting user during auth state change:", userError);
            return;
          }
          
          if (!user) {
            console.warn("No user data during auth state change");
            return;
          }
          
          // Get or create profile with error handling
          const { data: profile, error: profileError } = await ensureUserProfile(user.id);
          
          // Log detailed information about the profile result
          console.log("Profile loading result:", { 
            hasProfile: !!profile, 
            hasError: !!profileError,
            errorMessage: profileError?.message,
            profileKeys: profile ? Object.keys(profile) : []
          });
          
          // Even if there's a profile error, we might still have a fallback profile
          if (profile) {
            // Check admin status
            const isUserAdmin = (profile.role === "admin") || hasValidAdminOverride(user.email || "");
            
            // Update state with user, profile and session
            console.log("Setting loading state to false with profile data");

            // Cache the profile data for emergency recovery in the future
            if (profile && user) {
              try {
                localStorage.setItem(`akii-profile-${user.id}`, JSON.stringify(profile));
                console.log("Cached profile data for future emergency recovery");
              } catch (e) {
                console.warn("Failed to cache profile data:", e);
              }
            }

            setState(prev => ({
              ...prev,
              user,
              profile,
              session,
              isLoading: false,
              isAdmin: isUserAdmin,
              userRole: profile.role || null,
              error: profileError, // May be null or an error that was handled
            }));
            
            // If there was a profile error but we're using a fallback, show a toast
            if (profileError) {
              console.warn("Using fallback profile due to error:", profileError);
              toast({
                title: "Limited Profile Access",
                description: "We're using local profile data. Some features may be limited.",
                variant: "default",
              });
            }
          } else {
            console.error("Failed to get or create profile during auth state change");
            // Update state with just user and session, but crucially set isLoading to false
            console.log("Setting loading state to false despite profile failure");
            setState(prev => ({
              ...prev,
              user,
              session,
              isLoading: false,
              error: profileError,
            }));
            
            toast({
              title: "Profile Error",
              description: "There was an error loading your profile. Some features may be limited.",
              variant: "destructive",
            });
          }
          
          // Handle redirect if we were in the middle of login flow
          if (shouldRedirect) {
            console.log("Auth state updated successfully, redirecting to dashboard");
            // Clean up flags
            localStorage.removeItem("akii-login-in-progress");
            localStorage.removeItem("akii-auth-redirect");
            localStorage.removeItem("akii-login-time");
            localStorage.removeItem("akii-login-method");
            
            // Small delay to ensure state is updated
            setTimeout(() => {
              // Ensure we're using the correct path
              let dashboardPath = redirectTarget || "/dashboard";
              
              // Double-check for typos in the path
              if (dashboardPath.includes('/ddashboard')) {
                console.log("Fixing typo in dashboard path right before redirect:", dashboardPath);
                dashboardPath = dashboardPath.replace('/ddashboard', '/dashboard');
              }
              
              window.location.href = dashboardPath;
            }, 100);
          }
        } catch (error) {
          console.error("Error handling auth state change:", error);
          console.log("Setting loading state to false due to caught error");
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: error as Error
          }));
          
          // Clean up flags even on error
          localStorage.removeItem("akii-login-in-progress");
          localStorage.removeItem("akii-auth-redirect");
        }
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
      console.log("AuthProvider unmounting, cleaning up");
      clearTimeout(safetyTimer);
      authListener?.subscription.unsubscribe();
    };
  }, [initializeAuth, toast]);

  // Sign in function
  const signIn = async (
    email: string,
    password: string,
  ): Promise<SupabaseResponse<User>> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Set a flag in localStorage to indicate we're in the middle of login
      localStorage.setItem("akii-login-in-progress", "true");
      localStorage.setItem("akii-login-time", Date.now().toString());
      localStorage.setItem("akii-login-method", "email");
      
      const response = await authSignIn(email, password);
      
      if (response.error) {
        toast({
          title: "Sign in failed",
          description: response.error.message,
          variant: "destructive",
        });
        
        // Clear login in progress flag on error
        localStorage.removeItem("akii-login-in-progress");
      } else {
        toast({
          title: "Signed in successfully",
          variant: "default",
        });
        
        // Auth state will be updated by the onAuthStateChange listener
        
        // Clear the login in progress flag
        localStorage.removeItem("akii-login-in-progress");
        
        // Always force a redirect to dashboard
        console.log("Sign-in successful, redirecting to dashboard immediately");
        
        // Use a synchronous redirect for maximum reliability
        const dashboardPath = "/dashboard";
        window.location.replace(dashboardPath);
      }
      
      // Return the response in the SupabaseResponse format
      return {
        data: response.data?.user || null,
        error: response.error
      };
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      
      // Clear login in progress flag on error
      localStorage.removeItem("akii-login-in-progress");
      
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error(String(error)) 
      };
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
      
      // Log the metadata being sent
      console.log("SignUp metadata:", metadata);
      
      const response = await authSignUp(email, password, metadata);
      
      if (response.error) {
        toast({
          title: "Sign up failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else {
        // Store metadata in local storage to use it when the user confirms their email
        if (metadata) {
          try {
            localStorage.setItem("signup-metadata", JSON.stringify(metadata));
            localStorage.setItem("signup-email", email);
            localStorage.setItem("signup-timestamp", Date.now().toString());
          } catch (err) {
            console.error("Error storing signup metadata:", err);
          }
        }
        
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
      
      // Set a flag in localStorage to indicate we're in the middle of login
      localStorage.setItem("akii-login-in-progress", "true");
      localStorage.setItem("akii-login-time", Date.now().toString());
      localStorage.setItem("akii-login-method", "google");
      
      const response = await signInWithOAuth("google");
      
      if (response.error) {
        toast({
          title: "Google sign in failed",
          description: response.error.message,
          variant: "destructive",
        });
        
        // Clear login in progress flag on error
        localStorage.removeItem("akii-login-in-progress");
      } else {
        // Note: The Google sign-in flow will redirect the user, so most of this 
        // code won't execute until they return from the OAuth flow
        
        // Clear login in progress flag
        localStorage.removeItem("akii-login-in-progress");
        
        // Ensure redirection happens for cases where the OAuth redirect doesn't work
        console.log("Google sign-in started, will redirect to dashboard when complete");
        
        // Store redirect target for when user returns from OAuth
        const redirectPath = "/dashboard";
        localStorage.setItem("akii-auth-redirect", redirectPath);
        
        // Also check if any other localStorage entries have typos
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
              const value = localStorage.getItem(key);
              if (value && value.includes('/ddashboard')) {
                console.log(`[ConsolidatedAuthContext] Found typo in ${key}, fixing it`);
                localStorage.setItem(key, value.replace('/ddashboard', '/dashboard'));
              }
            }
          }
        } catch (e) {
          console.error("[ConsolidatedAuthContext] Error fixing localStorage typos:", e);
        }
      }
      
      return response;
    } catch (error) {
      console.error("Google sign in error:", error);
      toast({
        title: "Google sign in error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      
      // Clear login in progress flag on error
      localStorage.removeItem("akii-login-in-progress");
      
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
      
      // Transform response to match SupabaseResponse<boolean>
      return {
        data: response.error ? null : true,
        error: response.error
      };
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Reset password error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error(String(error)) 
      };
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
      
      return {
        data: response.data,
        error: response.error
      };
    } catch (error) {
      console.error("Password update error:", error);
      toast({
        title: "Password update error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error(String(error)) 
      };
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
      
      return {
        data: response.error ? null : true,
        error: response.error
      };
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error(String(error)) 
      };
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
          userRole: profile.role || null,
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
  const checkConnection = async () => {
    return await verifyConnection();
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
    verifyConnection: checkConnection,
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