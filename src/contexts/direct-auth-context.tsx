import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getProfileDirectly,
  ensureProfileExists,
  setLoggedIn,
  setLoggedOut,
  isLoggedIn,
  isAdmin as checkIsAdmin,
  refreshSession,
  getMinimalUser
} from '@/lib/direct-db-access';
import { useNavigate, useLocation } from 'react-router-dom';

// Hardcoded user ID for development
const HARDCODED_USER_ID = 'b574f273-e0e1-4cb8-8c98-f5a7569234c8';

// Add type for login function
interface LoginResult {
  success: boolean;
  error?: {
    message: string;
  };
}

// Define the context type
interface DirectAuthContextType {
  user: any | null;
  profile: any | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
  directLogin: (email: string, password: string) => Promise<LoginResult>;
}

// Create the context with a default value
const DirectAuthContext = createContext<DirectAuthContextType | undefined>(undefined);

// Create a provider component for the context
export const DirectAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Set admin status
  const setAdminStatus = (isAdmin: boolean) => {
    setIsAdmin(isAdmin);
    if (isAdmin) {
      localStorage.setItem('akii-is-admin', 'true');
    } else {
      localStorage.removeItem('akii-is-admin');
    }
  };
  
  // Sign out function
  const signOut = async () => {
    try {
      console.log('DirectAuth: Signing out user');
      
      // Create a list of all keys to clear from localStorage
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
      
      // Clear all keys from localStorage
      localStorageKeysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`DirectAuth: Failed to remove ${key} from localStorage`, e);
        }
      });
      
      // Clear any supabase related keys we might have missed
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || 
            key.includes('sb-') || 
            key.includes('akii-') || 
            key.includes('token') || 
            key.includes('auth')) {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.warn(`DirectAuth: Failed to remove ${key} from localStorage`, e);
          }
        }
      });
      
      // Create a list of all keys to clear from sessionStorage
      const sessionStorageKeysToRemove = [
        'akii-profile',
        'akii-is-logged-in',
        'akii-auth-user-id',
        'akii-direct-profile',
      ];
      
      // Clear all keys from sessionStorage
      sessionStorageKeysToRemove.forEach(key => {
        try {
          sessionStorage.removeItem(key);
        } catch (e) {
          console.warn(`DirectAuth: Failed to remove ${key} from sessionStorage`, e);
        }
      });
      
      // Remove all akii- prefixed keys from sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('akii-') || key.includes('supabase')) {
          try {
            sessionStorage.removeItem(key);
          } catch (e) {
            console.warn(`DirectAuth: Failed to remove ${key} from sessionStorage`, e);
          }
        }
      });
      
      // Reset state
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      
      // Notify via event
      const logoutEvent = new CustomEvent('akii-login-state-changed', { 
        detail: { isLoggedIn: false } 
      });
      window.dispatchEvent(logoutEvent);
      
      console.log('DirectAuth: User signed out');
      
      // Force a full page reload to clear any in-memory state
      window.location.href = '/';
    } catch (error: unknown) {
      console.error('DirectAuth: Error during sign out', error);
      if (error instanceof Error) {
        console.error('DirectAuth: Error details:', error.message);
      }
      
      // Force logout state even if there was an error clearing storage
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      
      // Force a complete reload to address persistience issues
      window.location.href = '/';
    }
  };
  
  // Refresh authentication state
  const refreshAuthState = async () => {
    try {
      setIsLoading(true);
      console.log('DirectAuth: Refreshing auth state');
      
      // Dynamically import required functions
      const { isLoggedIn, getProfileDirectly, ensureProfileExists, getMinimalUser } = await import('@/lib/direct-db-access');
      
      // First check if user is logged in according to localStorage
      const isLoggedInState = isLoggedIn();
      console.log('DirectAuth: isLoggedIn check result:', isLoggedInState);
      
      // If not logged in, clear state and return
      if (!isLoggedInState) {
        console.log('DirectAuth: User is not logged in according to localStorage, clearing state');
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      
      // Get user ID from localStorage
      const userId = localStorage.getItem('akii-auth-user-id');
      if (!userId) {
        console.error('DirectAuth: User ID not found in localStorage despite isLoggedIn returning true');
        setIsLoading(false);
        return;
      }
      
      // Create minimal user object for immediate UI feedback
      const minimalUser = {
        id: userId,
        email: localStorage.getItem('akii-auth-user-email') || 'unknown@example.com',
        role: 'user',
        app_metadata: { provider: 'email' },
        user_metadata: {},
        created_at: new Date().toISOString()
      };
      
      // Update state with minimal user data
      setUser(minimalUser);
      
      // Try to load profile from database
      console.log('DirectAuth: Loading profile data from database');
      const profileResult = await getProfileDirectly();
      const profileData = profileResult.data;
      
      if (!profileData) {
        console.warn('DirectAuth: Profile not found in database, attempting to create one');
        
        // Try to create a profile
        const createResult = await ensureProfileExists();
        const createdProfile = createResult.data;
        
        if (!createdProfile) {
          console.error('DirectAuth: Failed to create profile');
          setIsLoading(false);
          return;
        }
        
        // Update state with created profile
        console.log('DirectAuth: Profile created successfully:', createdProfile);
        setProfile(createdProfile);
        setUser({
          ...minimalUser,
          email: createdProfile.email || minimalUser.email,
          role: createdProfile.role || 'user'
        });
        setIsAdmin(createdProfile.role === 'admin');
      } else {
        // Update state with fetched profile
        console.log('DirectAuth: Profile loaded successfully:', profileData);
        setProfile(profileData);
        setUser({
          ...minimalUser,
          email: profileData.email || minimalUser.email,
          role: profileData.role || 'user'
        });
        setIsAdmin(profileData.role === 'admin');
      }
      
      // Log final authentication state
      console.log('DirectAuth: Auth state refreshed successfully', {
        user: {
          id: user?.id,
          email: user?.email,
          role: user?.role
        },
        profile: !!profile,
        isAdmin
      });
    } catch (error: unknown) {
      console.error('DirectAuth: Error refreshing auth state', error);
      if (error instanceof Error) {
        console.error('DirectAuth: Error details:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Login with credentials
  const directLogin = async (email: string, password: string): Promise<LoginResult> => {
    try {
      setIsLoading(true);
      console.log('DirectAuth: Attempting login with email:', email);
      
      // For development mode only
      if (import.meta.env.DEV) {
        const userId = HARDCODED_USER_ID;
        
        // Step 1: Set the login state in localStorage with explicit timestamps
        console.log('DirectAuth: Setting login state in localStorage');
        
        // Clear any stale login state first to avoid conflict
        localStorage.removeItem('akii-is-logged-in');
        localStorage.removeItem('akii-auth-user-id');
        localStorage.removeItem('akii-login-timestamp');
        localStorage.removeItem('akii-session-duration');
        localStorage.removeItem('akii-session-expiry');
        
        // CRITICAL FIX: Set a flag to indicate that we're in the login process
        localStorage.setItem('akii-login-in-progress', 'true');
        
        // Short delay to ensure browser has processed the removals
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Get the current timestamp
        const timestamp = Date.now();
        const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
        const expiryTimestamp = timestamp + sessionDuration;
        
        // Log values before setting
        console.log('DirectAuth: Login values to be set:', {
          userId,
          email,
          timestamp,
          sessionDuration,
          expiryTimestamp
        });
        
        // CRITICAL: Direct synchronized setting to ensure values are set properly
        localStorage.setItem('akii-is-logged-in', 'true');
        localStorage.setItem('akii-auth-user-id', userId);
        localStorage.setItem('akii-login-timestamp', timestamp.toString());
        localStorage.setItem('akii-session-duration', sessionDuration.toString());
        localStorage.setItem('akii-session-expiry', expiryTimestamp.toString());
        localStorage.setItem('akii-auth-user-email', email);
        
        // Use sessionStorage for faster access
        sessionStorage.setItem('akii-is-logged-in', 'true');
        sessionStorage.setItem('akii-auth-user-id', userId);
        
        // Now call the setLoggedIn function as a backup
        try {
          const { setLoggedIn } = await import('@/lib/direct-db-access');
          setLoggedIn(userId, email);
        } catch (error) {
          console.error('DirectAuth: Error in setLoggedIn', error);
          // Continue anyway since we already set values directly
        }
        
        // Short delay to ensure browser has processed all storage operations
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify values were set correctly
        const verifyLogin = localStorage.getItem('akii-is-logged-in');
        const verifyUserId = localStorage.getItem('akii-auth-user-id');
        const verifyTimestamp = localStorage.getItem('akii-login-timestamp');
        
        console.log('DirectAuth: Login localStorage values after set:', {
          isLoggedIn: verifyLogin,
          userId: verifyUserId,
          timestamp: verifyTimestamp
        });
        
        if (verifyLogin !== 'true' || !verifyUserId || !verifyTimestamp) {
          console.error('DirectAuth: Critical error - localStorage values were not set correctly');
          console.log('DirectAuth: Attempting manual set as fallback');
          
          // Last-ditch attempt - set values directly again
          localStorage.setItem('akii-is-logged-in', 'true');
          localStorage.setItem('akii-auth-user-id', userId);
          localStorage.setItem('akii-login-timestamp', timestamp.toString());
          localStorage.setItem('akii-session-duration', sessionDuration.toString());
          localStorage.setItem('akii-session-expiry', expiryTimestamp.toString());
          
          // Verify again
          const secondVerifyLogin = localStorage.getItem('akii-is-logged-in');
          
          if (secondVerifyLogin !== 'true') {
            console.error('DirectAuth: CRITICAL - localStorage values still not correct after fallback');
            setIsLoading(false);
            return { success: false, error: { message: 'Login state could not be set in localStorage' } };
          }
        }
        
        // Remove the in-progress flag
        localStorage.removeItem('akii-login-in-progress');
        
        // Step 2: Create or update the user profile in the database
        console.log('DirectAuth: Ensuring user profile exists in database');
        const { ensureProfileExists } = await import('@/lib/direct-db-access');
        const profileResult = await ensureProfileExists(email);
        if (profileResult.error) {
          console.error('DirectAuth: Failed to ensure profile exists', profileResult.error);
          setIsLoading(false);
          return { 
            success: false, 
            error: { message: profileResult.error.message || 'Failed to create or update user profile' } 
          };
        }
        
        const profileData = profileResult.data;
        console.log('DirectAuth: Profile data', profileData);
        
        // Step 3: Update auth context state
        console.log('DirectAuth: Updating context state with user and profile data');
        const userObj = {
          id: userId,
          email: profileData?.email || email,
          role: profileData?.role || 'user',
          app_metadata: { provider: 'email' },
          user_metadata: {},
          created_at: profileData?.created_at || new Date().toISOString()
        };
        
        setUser(userObj);
        setProfile(profileData);
        setIsAdmin(profileData?.role === 'admin' || false);
        
        // Step 4: Verify the authentication state is consistent
        console.log('DirectAuth: Verifying login state is consistent');
        const isLoggedInState = isLoggedIn();
        if (!isLoggedInState) {
          console.warn('DirectAuth: Login state verification failed, applying final fix');
          // Set values one more time directly
          localStorage.setItem('akii-is-logged-in', 'true');
          localStorage.setItem('akii-auth-user-id', userId);
          localStorage.setItem('akii-login-timestamp', Date.now().toString());
          
          // Check again
          const finalCheck = isLoggedIn();
          console.log('DirectAuth: Final login check result:', finalCheck);
          
          if (!finalCheck) {
            // One last emergency attempt
            console.error('DirectAuth: EMERGENCY - Setting all login values with highest priority');
            const emergencyTimestamp = Date.now();
            localStorage.setItem('akii-is-logged-in', 'true');
            localStorage.setItem('akii-auth-user-id', userId);
            localStorage.setItem('akii-login-timestamp', emergencyTimestamp.toString());
            localStorage.setItem('akii-auth-emergency', 'true');
            localStorage.setItem('akii-auth-emergency-time', emergencyTimestamp.toString());
            
            // Store a fallback user object
            localStorage.setItem('akii-auth-fallback-user', JSON.stringify({
              id: userId,
              email: email || 'dev@example.com',
              name: '',
              role: 'user',
              timestamp: emergencyTimestamp
            }));
          }
        }
        
        // Step 5: Notify other components of the authentication change
        console.log('DirectAuth: Dispatching login state change event');
        const loginEvent = new CustomEvent('akii-login-state-changed', { 
          detail: { isLoggedIn: true, userId } 
        });
        window.dispatchEvent(loginEvent);
        
        // Final state check
        console.log('DirectAuth: Login process completed. Final state:', {
          localStorage: {
            isLoggedIn: localStorage.getItem('akii-is-logged-in'),
            userId: localStorage.getItem('akii-auth-user-id'),
            timestamp: localStorage.getItem('akii-login-timestamp')
          },
          user: userObj.id,
          hasProfile: !!profileData
        });
        
        setIsLoading(false);
        return { success: true };
      }
      
      // Production login would go here
      console.error('DirectAuth: Production login not implemented');
      setIsLoading(false);
      return { success: false, error: { message: 'Login not implemented for production' } };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during login process';
      console.error('DirectAuth: Critical error during login process', error);
      setIsLoading(false);
      return { success: false, error: { message: errorMessage } };
    }
  };
  
  // Initialize auth state on mount
  useEffect(() => {
    // Add debounce protection to prevent multiple calls
    const lastInitTime = parseInt(sessionStorage.getItem('auth-init-timestamp') || '0');
    const currentTime = Date.now();
    const MIN_INIT_INTERVAL = 2000; // 2 seconds minimum between init attempts
    
    if (currentTime - lastInitTime < MIN_INIT_INTERVAL) {
      console.log('DirectAuth: Skipping initialization - too soon since last attempt', {
        timeSinceLastInit: currentTime - lastInitTime,
        minInterval: MIN_INIT_INTERVAL
      });
      return;
    }
    
    // Mark this initialization attempt
    sessionStorage.setItem('auth-init-timestamp', currentTime.toString());
    
    const initAuth = async () => {
      console.log('DirectAuth: Initializing authentication state');
      setIsLoading(true);
      
      try {
        // Force initialize localStorage with default values
        const { initializeLocalStorage, isLoggedIn, getMinimalUser, getProfileDirectly } = await import('@/lib/direct-db-access');
        initializeLocalStorage();
        
        // Check local storage for session data first
        const storedUserId = localStorage.getItem('akii-auth-user-id');
        const isLoggedInState = isLoggedIn();
        
        console.log('DirectAuth: Initial stored state:', { 
          storedUserId, 
          isLoggedInState,
          localStorage: {
            isLoggedIn: localStorage.getItem('akii-is-logged-in'),
            userId: localStorage.getItem('akii-auth-user-id'),
            loginTimestamp: localStorage.getItem('akii-login-timestamp'),
            sessionExpiry: localStorage.getItem('akii-session-expiry'),
            sessionDuration: localStorage.getItem('akii-session-duration')
          },
          currentUrl: window.location.href,
          serverPort: window.location.port
        });
        
        // Check for potential redirect loops
        const redirectCount = parseInt(sessionStorage.getItem('redirect-count') || '0');
        const dashboardRedirectTime = parseInt(sessionStorage.getItem('dashboard-redirect-time') || '0');
        const isInPotentialLoop = redirectCount >= 2 || (currentTime - dashboardRedirectTime < 3000);
        
        // If in a potential loop, don't automatically redirect
        if (isInPotentialLoop) {
          console.warn('DirectAuth: Potential redirect loop detected, skipping automatic redirects');
          
          // Show user even if technically not logged in, to break loop
          if (storedUserId) {
            const minimalUser = getMinimalUser();
            setUser(minimalUser);
          }
          
          setIsLoading(false);
          return;
        }
        
        // If looking at a login page that's not our current server port, fix it
        if (window.location.pathname === '/login' && 
            window.location.port === '5187' && 
            isLoggedInState) {
          console.log('DirectAuth: Port mismatch detected on login page');
          
          // Get the target port from localStorage if available
          const runningInstances = localStorage.getItem('akii-dev-ports');
          const targetPort = runningInstances ? JSON.parse(runningInstances)[0] : '5188';
          
          console.log(`DirectAuth: Redirecting from port ${window.location.port} to port ${targetPort}`);
          
          // Create the correct dashboard URL
          const correctUrl = `${window.location.protocol}//${window.location.hostname}:${targetPort}/dashboard`;
          console.log('DirectAuth: Redirecting to:', correctUrl);
          
          // Set the last known good port
          localStorage.setItem('akii-dev-ports', JSON.stringify([targetPort]));
          
          // Redirect to the dashboard
          window.location.href = correctUrl;
          return;
        }
        
        // If we're already logged in but got redirected to login, go to dashboard
        if (window.location.pathname === '/' && isLoggedInState) {
          // Check for potential redirect loops first
          const loginPageVisits = parseInt(sessionStorage.getItem('login-page-visits') || '0') + 1;
          sessionStorage.setItem('login-page-visits', loginPageVisits.toString());
          
          // If we've been to login page too many times, don't auto-redirect
          if (loginPageVisits >= 3) {
            console.warn('DirectAuth: Multiple homepage visits detected, stopping auto-redirect to prevent loops');
            setIsLoading(false);
            return;
          }
          
          console.log('DirectAuth: Already logged in but on homepage, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
          return;
        }
        
        if (isLoggedInState) {
          console.log('DirectAuth: User is logged in according to local storage');
          
          // Create a minimal user object first for immediate UI feedback
          const minimalUser = getMinimalUser();
          setUser(minimalUser);
          
          // Then load the full profile
          const profileResult = await getProfileDirectly();
          const profileData = profileResult.data;
          
          if (profileData) {
            console.log('DirectAuth: Profile loaded', profileData);
            
            // Update the state with the full data
            setProfile(profileData);
            setUser({
              ...minimalUser,
              email: profileData.email,
              role: profileData.role
            });
            setAdminStatus(profileData.role === 'admin');
          } else {
            console.warn('DirectAuth: Failed to load profile, using minimal user');
          }
        } else {
          console.log('DirectAuth: User is not logged in');
        }
      } catch (error: unknown) {
        console.error('DirectAuth: Error during initialization', error);
        if (error instanceof Error) {
          console.error('DirectAuth: Error details:', error.message, error.stack);
        }
      } finally {
        setIsLoading(false);
        console.log('DirectAuth [Initialization complete]:', {
          hasUser: !!user,
          userId: user?.id || null,
          hasProfile: !!profile,
          isAdmin,
          isLoading: false
        });
      }
    };
    
    initAuth();
    
    // Listen for auth state changes in authState effect
    const handleAuthStateChange = async (event: CustomEvent) => {
      console.log('DirectAuth: Received auth state change event', event.detail);
      
      // Force immediate auth state refresh
      const syncWithSupabaseAuth = async () => {
        // Dynamically import required functions
        const { getProfileDirectly, ensureProfileExists } = await import('@/lib/direct-db-access');
        
        if (event.detail?.isLoggedIn) {
          const userId = event.detail.userId;
          if (userId) {
            console.log('DirectAuth: Syncing with Supabase auth, userId:', userId);
            
            // Create minimal user object
            const minimalUser = {
              id: userId,
              email: localStorage.getItem('akii-auth-user-email') || 'unknown@example.com',
              role: 'user',
              app_metadata: { provider: 'email' },
              user_metadata: {},
              created_at: new Date().toISOString()
            };
            
            // Update state with minimal user
            setUser(minimalUser);
            
            // Then load profile from database
            console.log('DirectAuth: Loading profile after auth sync');
            const profileResult = await getProfileDirectly();
            const profileData = profileResult.data;
            
            if (profileData) {
              console.log('DirectAuth: Profile loaded during sync', profileData);
              
              // Update state with full data
              setProfile(profileData);
              setUser({
                ...minimalUser,
                email: profileData.email,
                role: profileData.role
              });
              setAdminStatus(profileData.role === 'admin');
            } else {
              console.warn('DirectAuth: Failed to load profile during sync, creating one');
              
              // Try to create profile
              const createResult = await ensureProfileExists();
              if (createResult.data) {
                console.log('DirectAuth: Created profile during sync', createResult.data);
                setProfile(createResult.data);
                setUser({
                  ...minimalUser,
                  email: createResult.data.email,
                  role: createResult.data.role
                });
                setAdminStatus(createResult.data.role === 'admin');
              }
            }
          }
        } else {
          // Handle logout
          console.log('DirectAuth: Syncing logout state');
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      };
      
      // Execute sync
      syncWithSupabaseAuth();
    };
    
    // Add event listener for auth state changes from Supabase
    window.addEventListener('akii-login-state-changed', handleAuthStateChange as EventListener);
    
    return () => {
      window.removeEventListener('akii-login-state-changed', handleAuthStateChange as EventListener);
    };
  }, [navigate]);
  
  const contextValue = {
    user,
    profile,
    isAdmin,
    isLoading,
    directLogin,
    signOut,
    refreshAuthState,
  };
  
  return (
    <DirectAuthContext.Provider value={contextValue}>
      {children}
    </DirectAuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useDirectAuth = () => {
  const context = useContext(DirectAuthContext);
  
  if (context === undefined) {
    throw new Error('useDirectAuth must be used within a DirectAuthProvider');
  }
  
  return context;
};

// Custom hook to use auth state changes
export const useAuthStateChanged = (callback: (user: any | null) => void) => {
  const { user } = useDirectAuth();
  
  useEffect(() => {
    callback(user);
  }, [user, callback]);
};

// Export as default for easy importing
export default DirectAuthContext; 