import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  signInWithOAuth,
  resetPasswordForEmail,
  updatePassword as updateUserPassword,
  getCurrentSession,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  ensureUserProfile,
  type User,
  type Session,
  type UserProfile,
  type AuthResponse
} from "@/lib/supabase-auth";
import {
  getUserSafely,
  getSessionSafely,
  signInWithEmailSafely,
  signUpSafely,
  signOutSafely,
  withAuthLock,
  cleanupAuthLocks,
  forceSessionCheck
} from '@/lib/auth-lock-fix';
import { useDirectAuth } from './direct-auth-context';
import { getProfileDirectly, ensureProfileExists } from '@/lib/direct-db-access';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<AuthResponse<any>>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<AuthResponse<any>>;
  signOut: (scope?: 'global' | 'local' | 'others') => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<AuthResponse<any>>;
  signInWithGithub: () => Promise<AuthResponse<any>>;
  resetPassword: (email: string) => Promise<AuthResponse<any>>;
  updatePassword: (password: string) => Promise<AuthResponse<any>>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<AuthResponse<UserProfile>>;
  refreshAuthState: () => Promise<void>;
  updateSession: (session: Session) => Promise<void>;
}

const defaultAuthState: AuthState = {
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAdmin: false
};

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultAuthState);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Add refs for tracking refresh state
  const lastRefreshTimeRef = useRef<number>(0);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initializationCompleteRef = useRef<boolean>(false);
  const refreshAttemptsRef = useRef<number>(0);
  const lockMonitorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimeoutTimeRef = useRef<number>(0);
  
  // Clear any pending timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Refresh authentication state with debouncing and caching
  const refreshAuthState = useCallback(async () => {
    try {
      // Check if we already have a refresh in progress
      const now = Date.now();
      if (refreshPromiseRef.current && now - lastRefreshTimeRef.current < 2000) {
        // Return existing promise if it's recent enough (2s debounce)
        return refreshPromiseRef.current;
      }
      
      // Update the last refresh time and increase attempt counter
      lastRefreshTimeRef.current = now;
      refreshAttemptsRef.current++;
      
      // Clear any existing timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      
      // Only update loading state if not already loading
      if (!state.isLoading) {
      setState(prev => ({ ...prev, isLoading: true }));
      }
      
      // Create a safety timeout that decreases with each attempt, but with higher base value
      const timeoutDuration = Math.max(8000 - (refreshAttemptsRef.current * 500), 3000);
      
      const safetyTimeout = new Promise<void>(resolve => {
        refreshTimeoutRef.current = setTimeout(() => {
          // Only log the timeout warning if it's not a subsequent attempt within a short period
          const timeSinceLastTimeout = now - (lastTimeoutTimeRef.current || 0);
          if (timeSinceLastTimeout > 10000) { // Only log timeout warnings once every 10 seconds
            console.warn(`Auth refresh safety timeout triggered (${timeoutDuration}ms)`);
          }
          lastTimeoutTimeRef.current = now;
          
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            // Keep existing user/session data if available
            user: prev.user || null,
            session: prev.session || null,
            profile: prev.profile || null
          }));
          resolve();
          refreshPromiseRef.current = null;
        }, timeoutDuration);
      });
      
      // Create the main auth refresh promise
      const refreshOperation = (async () => {
        try {
      // Get current session using lock-safe method
      const sessionResult = await getSessionSafely();
      
      if (sessionResult.error) {
        console.error("Error getting session:", sessionResult.error);
        setState({
          ...defaultAuthState,
          isLoading: false
        });
        return;
      }
      
      const session = sessionResult.data.session;
      
      // If no session, user is definitely logged out
      if (!session) {
        setState({
          ...defaultAuthState,
          isLoading: false
        });
        return;
      }
      
      // Get current user using lock-safe method
      const userResult = await getUserSafely();
      
      if (userResult.error || !userResult.data.user) {
        console.error("Error getting user:", userResult.error);
        setState({
          ...defaultAuthState,
          isLoading: false
        });
        return;
      }
      
      const user = userResult.data.user;
      
          // Get basic user info from token or localStorage recovery data
          const userId = localStorage.getItem('akii-auth-user-id') || 'unknown';
          const email = localStorage.getItem('akii-auth-user-email') || '';
          
          // Create minimal user object to allow application to function
          const tempUser = {
            id: userId,
            email,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: ''
          };
          
          // Get or create user profile with direct DB access as fallback
          const getProfileWithFallback = async (user: any) => {
            try {
              // First check admin status directly from DB using userId
              let isAdminFromDb = false;
              try {
                // Import dynamically to avoid circular dependencies
                const { checkIsAdmin } = await import('@/lib/supabase-auth');
                isAdminFromDb = await checkIsAdmin(user.id);
                console.log(`Direct admin check for user ${user.id}: ${isAdminFromDb}`);
              } catch (adminCheckError) {
                console.warn("Error checking admin status directly:", adminCheckError);
              }
              
              // Try normal profile retrieval first
              const { data: profile, error } = await ensureUserProfile(user);
              
              if (profile) {
                // If we got a profile but it doesn't have admin status and direct check says user is admin,
                // fix the profile's role field
                if (profile.role !== 'admin' && isAdminFromDb) {
                  console.log("Correcting profile admin status based on direct DB check");
                  profile.role = 'admin';
                  
                  // Try to update the profile in background
                  try {
                    const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
                    if (error) {
                      console.error("Failed to update profile admin status:", error);
                    } else {
                      console.log("Profile admin status updated in DB");
                    }
                  } catch (e) {
                    console.error("Failed to update profile admin status:", e);
                  }
                }
                
                return { data: profile, error: null };
              }
              
              if (error) {
                console.warn("Error retrieving profile with ensureUserProfile, trying direct DB query:", error);
                
                // If standard retrieval fails, try a direct DB query
                const { data: dbProfile, error: dbError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', user.id)
                  .single();
                
                if (dbError) {
                  console.error("Failed to get profile from DB:", dbError);
                  
                  // If we can't get the profile but we know admin status, create minimal profile with correct role
                  if (isAdminFromDb) {
                    return { 
                      data: { 
                        id: user.id,
                        email: user.email,
                        role: 'admin', // Use admin status from direct check
                        display_name: user.email ? user.email.split('@')[0] : 'Admin',
                        avatar_url: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      }, 
                      error: null 
                    };
                  }
                  
                  return { data: null, error: dbError };
                }
                
                if (dbProfile) {
                  // We found a profile in the database but check if admin status is correct
                  if (dbProfile.role !== 'admin' && isAdminFromDb) {
                    console.log("Correcting DB profile admin status based on direct check");
                    dbProfile.role = 'admin';
                    
                    // Try to update the profile in background
                    try {
                      const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
                      if (error) {
                        console.error("Failed to update profile admin status:", error);
                      } else {
                        console.log("Profile admin status updated in DB");
                      }
                    } catch (e) {
                      console.error("Failed to update profile admin status:", e);
                    }
                  }
                  
                  console.log("Successfully retrieved profile directly from DB");
                  return { data: dbProfile, error: null };
                }
              }
              
              // If we still don't have a profile, create a minimal one
              return { 
                data: { 
                  id: user.id,
                  email: user.email,
                  // Use admin status from direct check if available, otherwise use heuristic
                  role: isAdminFromDb ? 'admin' : (user.id.includes('admin') ? 'admin' : 'user'),
                  display_name: user.email ? user.email.split('@')[0] : 'User',
                  avatar_url: null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }, 
                error: null 
              };
            } catch (e) {
              console.error("Error in getProfileWithFallback:", e);
              return { data: null, error: e as Error };
            }
          };
          
          // Get profile with our robust fallback method
          const { data: profile, error: profileError } = await getProfileWithFallback(tempUser);
      
      if (profileError) {
            console.error("All profile retrieval methods failed:", profileError);
            
            // Create a minimal default profile as last resort
            const fallbackProfile = {
              id: userId,
              email: email,
              role: 'user',
              display_name: email.split('@')[0] || 'User',
              avatar_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            const isAdmin = false; // Default to non-admin for safety
            
            // Update state with recovered data but minimal profile
        setState({
              user: tempUser,
              profile: fallbackProfile,
          session,
          isLoading: false,
              isAdmin
        });
          } else {
      const isAdmin = profile?.role === 'admin';
      
            // Log successful profile recovery for debugging
            console.log("Profile recovery successful:", { 
              displayName: profile?.display_name, 
              role: profile?.role,
              isAdmin 
            });
            
            // Update state with recovered data and retrieved profile
      setState({
              user: tempUser,
              profile: profile || null,
        session,
        isLoading: false,
        isAdmin
      });
          }
          
          // Reset attempt counter after successful refresh
          refreshAttemptsRef.current = 0;
      
      // Store basic user info for auth recovery
      try {
        localStorage.setItem('akii-auth-user-id', user.id);
        localStorage.setItem('akii-auth-user-email', user.email || '');
      } catch (e) {
        console.error("Error saving user data to localStorage:", e);
      }
        } finally {
          // Always clean up timeout
          if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
            refreshTimeoutRef.current = null;
          }
        }
      })();
      
      // Create and store the refresh promise
      refreshPromiseRef.current = Promise.race([refreshOperation, safetyTimeout]);
      
      // Wait for the refresh to complete
      await refreshPromiseRef.current;
      
      // Clear the promise reference after a short delay to allow batching
      setTimeout(() => {
        refreshPromiseRef.current = null;
      }, 100);
    } catch (error) {
      console.error("Error refreshing auth state:", error);
      setState({
        ...defaultAuthState,
        isLoading: false
      });
      
      // Clear the promise reference on error
      refreshPromiseRef.current = null;
    }
  }, [state.isLoading]);
  
  // Monitor for stale auth locks and clear them
  useEffect(() => {
    // Need to create a reference to updateSession for closure
    const handleSessionUpdate = (session: Session) => {
      if (session) {
        // Update state with force-checked session
        setState(prev => ({
          ...prev,
          session,
          isLoading: false
        }));
      } else {
        // Just clear loading state if no session found
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    // Set up lock monitoring
    const monitorAuthLocks = () => {
      // Check if there are any auth operations that have been waiting too long
      const authLocksDiv = document.getElementById('__AUTH_LOCKS_DEBUG');
      if (authLocksDiv) {
        const lockText = authLocksDiv.textContent || '';
        
        // If we detect a lock that's been held for more than 10 seconds, clear it
        if (lockText.includes('lockHolder') && lockText.includes('seconds ago')) {
          const secondsMatch = lockText.match(/(\d+) seconds ago/);
          if (secondsMatch && parseInt(secondsMatch[1], 10) > 10) {
            console.warn('Detected stale auth lock, clearing:', lockText);
            cleanupAuthLocks();
            
            // Force a session check to restore state
            if (state.isLoading) {
              forceSessionCheck().then(result => {
                if (result.data?.session) {
                  handleSessionUpdate(result.data.session);
                } else {
                  // Just clear loading state if no session found
                  setState(prev => ({ ...prev, isLoading: false }));
                }
              }).catch(() => {
                // Ensure loading state is cleared on error
                setState(prev => ({ ...prev, isLoading: false }));
              });
            }
          }
        }
      }
    };
    
    // Check for stale locks every 5 seconds
    lockMonitorIntervalRef.current = setInterval(monitorAuthLocks, 5000);
    
    // Handle online/offline status
    const handleOnline = () => {
      console.log('Network connection restored, refreshing auth state');
      
      // When coming back online, verify session immediately
      forceSessionCheck().then(result => {
        if (result.data.session) {
          console.log('Session found after reconnection, refreshing full auth state');
          refreshAuthState(); // Add immediate full refresh after connection restored
        } else {
          console.log('No valid session found after reconnection');
        }
      }).catch(err => {
        console.error('Error checking session after reconnection:', err);
      });
    };
    
    // Add network event listeners
    window.addEventListener('online', handleOnline);
    
    // Clean up on unmount
    return () => {
      if (lockMonitorIntervalRef.current) {
        clearInterval(lockMonitorIntervalRef.current);
      }
      window.removeEventListener('online', handleOnline);
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [state.isLoading, refreshAuthState]);

  // Initialize authentication state
  useEffect(() => {
    // Check for auth code in URL (PKCE flow)
    const checkUrlForAuthCode = async () => {
      try {
        // Skip if already initialized
        if (initializationCompleteRef.current) return;
        
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        
        if (code) {
          console.log("Found auth code in URL, exchanging for session");
          try {
            // Exchange code for session (PKCE flow) with lock protection
            const result = await withAuthLock(
              () => supabase.auth.exchangeCodeForSession(code),
              'exchangeCodeForSession'
            );
            
            const error = (result as any).error;
            const data = (result as any).data;
            
            if (error) {
              console.error("Error exchanging code for session:", error);
              return;
            }
            
            if (data?.session) {
              console.log("Successfully exchanged code for session");
              // Clean up URL
              window.history.replaceState({}, document.title, window.location.pathname);
              await refreshAuthState();
            }
          } catch (exchangeError) {
            console.error("Error in code exchange:", exchangeError);
          }
        }
      } catch (urlError) {
        console.error("Error parsing URL:", urlError);
      }
    };
    
    // Initial auth state load
    const initializeAuth = async () => {
      if (initializationCompleteRef.current) return;
      initializationCompleteRef.current = true;
      
      // Add safety timeout to prevent getting stuck during initialization
      const initTimeoutId = setTimeout(() => {
        console.warn('Auth initialization safety timeout triggered');
        // If we're still loading after timeout, force state to not loading
        setState(prev => {
          if (prev.isLoading) {
            return { ...prev, isLoading: false };
          }
          return prev;
        });
      }, 15000); // 15 second safety timeout (increased from 7s)
      
      try {
      await checkUrlForAuthCode();
      await refreshAuthState();
      } catch (e) {
        console.error('Error during auth initialization:', e);
        setState(prev => ({ ...prev, isLoading: false }));
      } finally {
        clearTimeout(initTimeoutId);
      }
    };
    
    initializeAuth();
    
    // Track the last event time to prevent excessive auth state changes
    let lastEventTime = 0;
    const EVENT_THROTTLE_MS = 1000; // Minimum 1 second between events
    
    // Set up auth state listener with throttling
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Throttle events to prevent excessive refreshes
        const now = Date.now();
        if (now - lastEventTime < EVENT_THROTTLE_MS) {
          console.log(`Auth event ${event} throttled (too frequent)`);
          return;
        }
        
        lastEventTime = now;
        console.log(`Auth state changed: ${event}`);
        
        // For SIGNED_IN and TOKEN_REFRESHED events, update state directly if possible
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          try {
            // Set loading state if we're not already loading
            if (!state.isLoading) {
              setState(prev => ({ ...prev, isLoading: true }));
            }
            
            // If session exists but no user, try to get user directly from token
            if (session) {
              // Store session immediately to ensure it's available
              setState(prev => ({
                ...prev,
                session,
                isLoading: true // Keep loading until we get the user
              }));
              
              // Get current user - try with safe method first
              const { data: user, error: userError } = await getUserSafely();
              
              if (userError || !user?.user) {
                console.warn("Error getting user after auth change, trying direct token check");
                
                // Check for valid auth token in localStorage as fallback
                const tokenKey = Object.keys(localStorage).find(key => 
                  key.startsWith('sb-') && key.includes('-auth-token')
                );
                
                if (tokenKey) {
                  try {
                    const tokenData = JSON.parse(localStorage.getItem(tokenKey) || '{}');
                    if (tokenData?.access_token && session?.access_token) {
                      // Get user profile if we have a valid session
                      try {
                        // Get basic user info from token or localStorage recovery data
                        const userId = localStorage.getItem('akii-auth-user-id') || 'unknown';
                        const email = localStorage.getItem('akii-auth-user-email') || '';
                        
                        // Create minimal user object to allow application to function
                        const tempUser = {
                          id: userId,
                          email,
                          app_metadata: {},
                          user_metadata: {},
                          aud: 'authenticated',
                          created_at: ''
                        };
                        
                        // Get or create user profile with direct DB access as fallback
                        const getProfileWithFallback = async (user: any) => {
                          try {
                            // First check admin status directly from DB using userId
                            let isAdminFromDb = false;
                            try {
                              // Import dynamically to avoid circular dependencies
                              const { checkIsAdmin } = await import('@/lib/supabase-auth');
                              isAdminFromDb = await checkIsAdmin(user.id);
                              console.log(`Direct admin check for user ${user.id}: ${isAdminFromDb}`);
                            } catch (adminCheckError) {
                              console.warn("Error checking admin status directly:", adminCheckError);
                            }
                            
                            // Try normal profile retrieval first
                            const { data: profile, error } = await ensureUserProfile(user);
                            
                            if (profile) {
                              // If we got a profile but it doesn't have admin status and direct check says user is admin,
                              // fix the profile's role field
                              if (profile.role !== 'admin' && isAdminFromDb) {
                                console.log("Correcting profile admin status based on direct DB check");
                                profile.role = 'admin';
                                
                                // Try to update the profile in background
                                try {
                                  const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
                                  if (error) {
                                    console.error("Failed to update profile admin status:", error);
                                  } else {
                                    console.log("Profile admin status updated in DB");
                                  }
                                } catch (e) {
                                  console.error("Failed to update profile admin status:", e);
                                }
                              }
                              
                              return { data: profile, error: null };
                            }
                            
                            if (error) {
                              console.warn("Error retrieving profile with ensureUserProfile, trying direct DB query:", error);
                              
                              // If standard retrieval fails, try a direct DB query
                              const { data: dbProfile, error: dbError } = await supabase
                                .from('profiles')
                                .select('*')
                                .eq('id', user.id)
                                .single();
                              
                              if (dbError) {
                                console.error("Failed to get profile from DB:", dbError);
                                
                                // If we can't get the profile but we know admin status, create minimal profile with correct role
                                if (isAdminFromDb) {
                                  return { 
                                    data: { 
                                      id: user.id,
                                      email: user.email,
                                      role: 'admin', // Use admin status from direct check
                                      display_name: user.email ? user.email.split('@')[0] : 'Admin',
                                      avatar_url: null,
                                      created_at: new Date().toISOString(),
                                      updated_at: new Date().toISOString()
                                    }, 
                                    error: null 
                                  };
                                }
                                
                                return { data: null, error: dbError };
                              }
                              
                              if (dbProfile) {
                                // We found a profile in the database but check if admin status is correct
                                if (dbProfile.role !== 'admin' && isAdminFromDb) {
                                  console.log("Correcting DB profile admin status based on direct check");
                                  dbProfile.role = 'admin';
                                  
                                  // Try to update the profile in background
                                  try {
                                    const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
                                    if (error) {
                                      console.error("Failed to update profile admin status:", error);
                                    } else {
                                      console.log("Profile admin status updated in DB");
                                    }
                                  } catch (e) {
                                    console.error("Failed to update profile admin status:", e);
                                  }
                                }
                                
                                console.log("Successfully retrieved profile directly from DB");
                                return { data: dbProfile, error: null };
                              }
                            }
                            
                            // If we still don't have a profile, create a minimal one
                            return { 
                              data: { 
                                id: user.id,
                                email: user.email,
                                // Use admin status from direct check if available, otherwise use heuristic
                                role: isAdminFromDb ? 'admin' : (user.id.includes('admin') ? 'admin' : 'user'),
                                display_name: user.email ? user.email.split('@')[0] : 'User',
                                avatar_url: null,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                              }, 
                              error: null 
                            };
                          } catch (e) {
                            console.error("Error in getProfileWithFallback:", e);
                            return { data: null, error: e as Error };
                          }
                        };
                        
                        // Get profile with our robust fallback method
                        const { data: profile, error: profileError } = await getProfileWithFallback(tempUser);
                        
                        if (profileError) {
                          console.error("All profile retrieval methods failed:", profileError);
                          
                          // Create a minimal default profile as last resort
                          const fallbackProfile = {
                            id: userId,
                            email: email,
                            role: 'user',
                            display_name: email.split('@')[0] || 'User',
                            avatar_url: null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                          };
                          
                          const isAdmin = false; // Default to non-admin for safety
                          
                          // Update state with recovered data but minimal profile
              setState({
                            user: tempUser,
                            profile: fallbackProfile,
                            session,
                            isLoading: false,
                            isAdmin
                          });
                        } else {
                          const isAdmin = profile?.role === 'admin';
                          
                          // Log successful profile recovery for debugging
                          console.log("Profile recovery successful:", { 
                            displayName: profile?.display_name, 
                            role: profile?.role,
                            isAdmin 
                          });
                          
                          // Update state with recovered data and retrieved profile
                          setState({
                            user: tempUser,
                            profile: profile || null,
                            session,
                            isLoading: false,
                            isAdmin
                          });
                        }
                        
                        // Attempt background refresh for complete data
                        setTimeout(() => {
                          refreshAuthState().catch(e => {
                            console.warn("Background refresh failed:", e);
                          });
                        }, 1000);
                        
                        return;
                      } catch (profileError) {
                        console.error("Error creating profile from token data:", profileError);
                      }
                    }
                  } catch (e) {
                    console.warn("Error parsing token from localStorage:", e);
                  }
                }
                
                // If token recovery failed, indicate no user but preserve session
                setState(prev => ({
                  ...prev,
                  session,
                  isLoading: false
                }));
                
              return;
            }
            
            // Get or create user profile
              const { data: profile, error: profileError } = await ensureUserProfile(user.user);
            
            // Determine admin status - use existing profile if available
            const isAdmin = profile?.role === 'admin';
            
            // Update state with user and session
            setState({
                user: user.user,
              profile: profile || null,
              session,
              isLoading: false,
              isAdmin
            });
            
            // Store user ID for emergency recovery
            try {
                localStorage.setItem('akii-auth-user-id', user.user.id);
                localStorage.setItem('akii-auth-user-email', user.user.email || '');
            } catch (e) {
              console.error("Error saving user data to localStorage:", e);
            }
            } else {
              // Just update loading state if no session provided
              setState(prev => ({ ...prev, isLoading: false }));
            }
          } catch (error) {
            console.error("Error handling auth state change:", error);
            setState(prev => ({ ...prev, isLoading: false }));
          }
        } else if (event === 'SIGNED_OUT') {
          // For SIGNED_OUT, just reset the state
          setState({
            ...defaultAuthState,
            isLoading: false
          });
          
          // Clear stored user info
          try {
            localStorage.removeItem('akii-auth-user-id');
            localStorage.removeItem('akii-auth-user-email');
          } catch (e) {
            console.error("Error removing user data from localStorage:", e);
          }
        } else if (event === 'INITIAL_SESSION') {
          // For INITIAL_SESSION, only refresh if we don't already have a user
          if (!state.user && !state.isLoading) {
            await refreshAuthState();
          }
        } else {
          // For other events, refresh the entire auth state only if needed
          if (!state.isLoading && !refreshPromiseRef.current) {
          await refreshAuthState();
          }
        }
      }
    );

    // Cleanup
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [refreshAuthState, state.isLoading, state.user, state.session]);

  // Sign in handler
  const signIn = async (email: string, password: string): Promise<AuthResponse<any>> => {
    // Only update loading state if not already loading
    if (!state.isLoading) {
    setState(prev => ({ ...prev, isLoading: true }));
    }
    
    try {
      // Use lock-safe sign in method
      const result = await signInWithEmailSafely(email, password);
      
      // Convert to expected AuthResponse format
      const response: AuthResponse<any> = {
        data: (result as any).data,
        error: (result as any).error
      };
      
      if (response.error) {
        // Don't show toast for network errors - they're likely transient
        if (!response.error.message.includes('network') && 
            !response.error.message.includes('timeout')) {
        toast({
          title: "Sign in failed",
          description: response.error.message,
          variant: "destructive",
        });
        } else {
          console.warn("Sign in network error:", response.error.message);
        }
      } else {
        toast({
          title: "Signed in successfully",
          variant: "default",
        });
        
        // Update state immediately with the returned session and user if available
        if (response.data?.session && response.data?.user) {
          const session = response.data.session;
          const user = response.data.user;
          
          try {
            // Get or create user profile
            const { data: profile } = await ensureUserProfile(user);
            const isAdmin = profile?.role === 'admin';
            
            // Update state with new user and session
            setState({
              user,
              profile: profile || null,
              session,
              isLoading: false,
              isAdmin
            });
            
            // Store user ID for emergency recovery
            try {
              localStorage.setItem('akii-auth-user-id', user.id);
              localStorage.setItem('akii-auth-user-email', user.email || '');
            } catch (e) {
              console.error("Error saving user data to localStorage:", e);
            }
            
            return response;
          } catch (profileError) {
            console.error("Error getting user profile after sign in:", profileError);
          }
        }
        
        // If we couldn't update immediately, fall back to refresh
        await refreshAuthState();
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
      return response;
    } catch (error) {
      console.error("Sign in error:", error);
      setState(prev => ({ ...prev, isLoading: false }));
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Sign in error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { data: null, error: error as Error };
    }
  };

  // Sign up handler
  const signUp = async (email: string, password: string, metadata?: Record<string, any>): Promise<AuthResponse<any>> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Use lock-safe sign up method
      const result = await signUpSafely(email, password, metadata);
      
      // Convert to expected AuthResponse format
      const response: AuthResponse<any> = {
        data: (result as any).data,
        error: (result as any).error
      };
      
      if (response.error) {
        toast({
          title: "Sign up failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign up successful",
          description: "Please check your email to confirm your account",
          variant: "default",
        });
        
        // Refresh auth state after successful sign up
        await refreshAuthState();
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
      return response;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Sign up error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { data: null, error: error as Error };
    }
  };

  // Sign out handler
  const signOut = async (scope: 'global' | 'local' | 'others' = 'global'): Promise<{ error: Error | null }> => {
    try {
      // Reset auth state immediately before API call
      setState({
        ...defaultAuthState,
        isLoading: true
      });
      
      // Use the lock-safe signOut function
      const result = await signOutSafely({ scope });
      const response = { error: (result as any).error };
      
      if (response.error) {
        console.error("Sign out error:", response.error);
        toast({
          title: "Sign out failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out successfully",
          variant: "default",
        });
      }
      
      // Ensure auth state is reset regardless of API response
      setState({
        ...defaultAuthState,
        isLoading: false
      });
      
      // For a clean reload, navigate to home page
      window.location.href = '/';
      
      return response;
    } catch (error) {
      console.error("Exception during sign out:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Sign out error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Even in case of exception, make sure state is cleared
      setState({
        ...defaultAuthState,
        isLoading: false
      });
      
      // Force page reload for a clean state
      window.location.href = '/';
      
      return { error: error as Error };
    }
  };

  // OAuth handlers
  const signInWithGoogle = () => signInWithOAuth('google');
  const signInWithGithub = () => signInWithOAuth('github');

  // Password reset
  const resetPassword = async (email: string) => {
    try {
      const response = await resetPasswordForEmail(email);
      
      if (response.error) {
        toast({
          title: "Password reset failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password reset email sent",
          description: "Please check your email for the reset link",
          variant: "default",
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Password reset error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { data: null, error: error as Error };
    }
  };

  // Update password handler
  const updatePassword = async (password: string) => {
    try {
      const response = await updateUserPassword(password);
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
        
        // Refresh auth state after password update
        await refreshAuthState();
      }
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Password update error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: error as Error };
    }
  };

  // Update profile
  const updateProfileHandler = async (profile: Partial<UserProfile>) => {
    try {
      const response = await updateUserProfile(profile);
      
      if (response.error) {
        toast({
          title: "Profile update failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile updated successfully",
          variant: "default",
        });
        
        // Update local state
        if (response.data) {
          setState(prev => ({ 
            ...prev, 
            profile: response.data,
            isAdmin: response.data.role === 'admin'
          }));
        }
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Profile update error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { data: null, error: error as Error };
    }
  };

  // Add a new method for updating the session directly
  const updateSession = useCallback(async (session: Session) => {
    if (!session) {
      console.warn("Attempted to update with null session");
      return;
    }
    
    try {
      // Set loading state if not already loading
      if (!state.isLoading) {
        setState(prev => ({ ...prev, isLoading: true }));
      }
      
      // If we have the same user and only the session needs updating, do it directly
      if (state.user) {
        setState(prev => ({
          ...prev,
          session,
          isLoading: false
        }));
      } else {
        // If we need to get the user, use refreshAuthState
        await refreshAuthState();
      }
    } catch (error) {
      console.error("Error updating session:", error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isLoading, state.user, refreshAuthState]);

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGithub,
    resetPassword,
    updatePassword,
    updateProfile: updateProfileHandler,
    refreshAuthState,
    updateSession
  };

  // Simply pass through the direct auth context
  const directAuth = useDirectAuth();

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 