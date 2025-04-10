import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase.tsx";
import { safeLocalStorage, safeSessionStorage } from "@/lib/browser-check.ts";
import { toast } from "@/components/ui/use-toast.ts";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Define the interface for user that may include additional fields
export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  avatar_url?: string;
  team_id?: string;
  is_team_owner?: boolean;
  is_admin?: boolean;
}

// Simple type for the wrapper object that holds the user
interface UserWrapper {
  user: SupabaseUser;
}

interface AuthState {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  hasStorageAuth: boolean;
  connectionError: Error | null;
  isAdmin: boolean;
  isTeamOwner: boolean;
}

interface AuthActions {
  handleSignOut: (scope?: 'global' | 'local' | 'others') => Promise<void>;
  getData: () => UserDisplayData;
  loadUserData: () => Promise<void>;
  tryToRecoverAuth: () => boolean;
}

interface UserDisplayData {
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isAuthenticated?: boolean;
}

export default function useDashboardLayoutAuth(): AuthState & AuthActions {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserWrapper | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasStorageAuth, setHasStorageAuth] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);

  // Check if user has valid token in localStorage
  const forceCheckLocalStorageAuth = () => {
    try {
      // Look for any auth-related tokens in localStorage
      const hasAuthTokens = Object.keys(localStorage).some(key => {
        return (
          key.includes('supabase.auth.token') ||
          key.includes('sb-') ||
          key.includes('akii-auth') ||
          key.includes('token')
        );
      });
      return hasAuthTokens;
    } catch (e) {
      console.error('Error checking localStorage auth:', e);
      return false;
    }
  };

  // Load user data from Supabase
  const loadUserData = async () => {
    setLoading(true);
    try {
      console.log('Loading user data');
      const { data: currentUser, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
      } else if (currentUser?.user) {
        console.log('User found:', currentUser.user.id);
        setUser(currentUser as UserWrapper);
        
        // Get user profile
        if (currentUser.user.id) {
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.user.id)
            .single();
          
          if (profileError) {
            console.error('Error getting user profile:', profileError);
          } else if (userProfile) {
            console.log('Profile found for user:', userProfile.id);
            setProfile(userProfile);
          }
        }
      } else {
        // No user from getUser, check session directly
        console.log('No user found from getUser, checking session');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
        } else if (sessionData?.session) {
          console.log('Session found but no user, setting user from session');
          setUser({ user: sessionData.session.user });
          
          // Get user profile from session
          if (sessionData.session.user.id) {
            const { data: userProfile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', sessionData.session.user.id)
              .single();
            
            if (profileError) {
              console.error('Error getting user profile from session:', profileError);
            } else if (userProfile) {
              console.log('Profile found for session user:', userProfile.id);
              setProfile(userProfile);
            }
          }
        } else {
          // No session either, try emergency auth
          tryToRecoverAuth();
        }
      }
    } catch (error) {
      console.error('Exception loading user data:', error);
      // Try to recover using localStorage
      tryToRecoverAuth();
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to try to recover auth state from localStorage
  const tryToRecoverAuth = () => {
    console.log('Attempting to recover auth state from localStorage');
    
    // Check for emergency auth flag
    const hasEmergencyAuth = localStorage.getItem('akii-auth-emergency') === 'true';
    const emergencyEmail = localStorage.getItem('akii-auth-emergency-email');
    const emergencyTime = parseInt(localStorage.getItem('akii-auth-emergency-time') || '0');
    
    // Only use emergency auth if set within the last 30 minutes
    if (hasEmergencyAuth && emergencyEmail && Date.now() - emergencyTime < 30 * 60 * 1000) {
      console.log('Using emergency auth with email:', emergencyEmail);
      
      // Create minimal user object from emergency data
      const emergencyUser = {
        user: {
          id: 'emergency-auth-user',
          email: emergencyEmail,
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          user_metadata: {
            email: emergencyEmail,
            first_name: 'Emergency',
            last_name: 'User'
          }
        } as SupabaseUser
      };
      
      setUser(emergencyUser);
      
      // Create minimal profile
      const emergencyProfile = {
        id: 'emergency-auth-user',
        email: emergencyEmail,
        first_name: 'Emergency',
        last_name: 'User',
        role: 'user'
      };
      
      setProfile(emergencyProfile);
      return true;
    }
    
    // Look for fallback user data
    const fallbackUserStr = localStorage.getItem('akii-auth-fallback-user');
    if (fallbackUserStr) {
      try {
        const fallbackData = JSON.parse(fallbackUserStr);
        console.log('Using fallback user data:', fallbackData);
        
        const fallbackUser = {
          user: {
            id: fallbackData.id || 'fallback-user',
            email: fallbackData.email,
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            user_metadata: {
              email: fallbackData.email,
              first_name: fallbackData.first_name || 'User',
              last_name: fallbackData.last_name || ''
            }
          } as SupabaseUser
        };
        
        setUser(fallbackUser);
        
        // Create profile from fallback data
        const fallbackProfile = {
          id: fallbackData.id || 'fallback-user',
          email: fallbackData.email,
          first_name: fallbackData.first_name || 'User',
          last_name: fallbackData.last_name || '',
          role: fallbackData.role || 'user'
        };
        
        setProfile(fallbackProfile);
        return true;
      } catch (e) {
        console.error('Error parsing fallback user data:', e);
      }
    }
    
    // Check for any auth tokens as last resort
    const hasAuthTokens = forceCheckLocalStorageAuth();
    if (hasAuthTokens) {
      console.log('Found auth tokens but no user data, using minimal placeholder');
      
      const placeholderUser = {
        user: {
          id: 'auth-token-user',
          email: 'authenticated_user@akii.ai',
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          user_metadata: {
            email: 'authenticated_user@akii.ai',
            first_name: 'Authenticated',
            last_name: 'User'
          }
        } as SupabaseUser
      };
      
      setUser(placeholderUser);
      
      // Create minimal profile
      const placeholderProfile = {
        id: 'auth-token-user',
        email: 'authenticated_user@akii.ai',
        first_name: 'Authenticated',
        last_name: 'User',
        role: 'user'
      };
      
      setProfile(placeholderProfile);
      return true;
    }
    
    return false;
  };

  // Sign out function with enhanced cleanup
  const handleSignOut = async (scope: 'global' | 'local' | 'others' = 'global') => {
    try {
      console.log(`Signing out with scope: ${scope}`);
      
      // First, import the signOut function directly to ensure consistency
      const { signOut: authSignOut, clearAuthTokens } = await import('@/lib/supabase-auth');
      
      // Call the enhanced signOut function with scope
      const { error } = await authSignOut(scope);
      
      if (error) {
        console.error("Error signing out:", error);
      }
      
      // Clear local state
      setUser(null);
      setProfile(null);
      
      // Perform additional token cleanup as fallback
      try {
        clearAuthTokens();
        
        // Double check with any additional token clearing code needed
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || 
              key.includes('sb-') || 
              key.includes('akii-auth') || 
              key.includes('token') || 
              key.includes('auth') ||
              key.startsWith('auth-')) {
            safeLocalStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.error("Error during token cleanup:", e);
      }
      
      // Force reload the page to ensure a clean state
      window.location.href = "/?force_logout=true";
    } catch (error) {
      console.error("Exception during logout:", error);
      
      // Fallback - try to remove tokens and redirect even if there's an error
      try {
        const { clearAuthTokens } = await import('@/lib/supabase-auth');
        clearAuthTokens();
      } catch (e) {
        console.error("Error in fallback token cleanup:", e);
      }
      
      // Redirect to home page with force logout parameter
      window.location.href = "/?force_logout=true";
    }
  };

  // Function to get user data from various sources
  const getData = () => {
    const defaultData: UserDisplayData = {
      isAuthenticated: false
    };
    
    // Type assertion for user to avoid TypeScript errors
    const typedUser = user?.user as SupabaseUser | undefined;
    
    // First check if we have user or profile data from auth context
    if (typedUser || profile) {
      console.log("Getting data from authenticated user");
      
      // Construct user data from profile and user objects
      const userData: UserDisplayData = {
        email: typedUser?.email || profile?.email,
        firstName: profile?.first_name || 
                  typedUser?.user_metadata?.first_name,
        lastName: profile?.last_name || 
                 typedUser?.user_metadata?.last_name,
        avatarUrl: profile?.avatar_url || typedUser?.user_metadata?.avatar_url,
        isAuthenticated: true
      };
      
      return userData;
    }
    
    // If no authenticated user, try to get data from localStorage
    if (hasStorageAuth) {
      console.log("Looking for user data in localStorage");
      
      try {
        // First check for fallback user data
        const fallbackUserStr = localStorage.getItem('akii-auth-fallback-user');
        if (fallbackUserStr) {
          try {
            const fallbackUser = JSON.parse(fallbackUserStr);
            console.log("Found fallback user data:", fallbackUser);
            
            if (fallbackUser) {
              return {
                email: fallbackUser.email,
                firstName: fallbackUser.first_name,
                lastName: fallbackUser.last_name,
                avatarUrl: fallbackUser.avatar_url,
                isAuthenticated: true
              };
            }
          } catch (e) {
            console.error("Error parsing fallback user data:", e);
          }
        }
        
        // Try to find other user data in localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          
          if (key.includes('user_data') || key.includes('user-data') || key.includes('akii-user')) {
            try {
              const userDataStr = localStorage.getItem(key);
              if (!userDataStr) continue;
              
              const localUserData = JSON.parse(userDataStr);
              console.log(`Found user data in localStorage key ${key}:`, localUserData);
              
              if (localUserData) {
                return {
                  email: localUserData.email,
                  firstName: localUserData.first_name || localUserData.firstName,
                  lastName: localUserData.last_name || localUserData.lastName,
                  avatarUrl: localUserData.avatar_url || localUserData.avatarUrl,
                  isAuthenticated: true
                };
              }
            } catch (e) {
              console.error(`Error parsing ${key}:`, e);
            }
          }
        }
        
        // If we couldn't get user data from the standard sources,
        // try to extract email from auth-related localStorage keys
        const emailKeys = [
          'akii-auth-user-email',
          'akii-auth-robust-email',
          'akii_admin_override_email'
        ];
        
        for (const key of emailKeys) {
          const email = localStorage.getItem(key);
          if (email) {
            console.log(`Found email in localStorage key ${key}: ${email}`);
            
            const userData: UserDisplayData = {
              email: email,
              isAuthenticated: true
            };
            
            // Extract a name from the email if possible
            if (email.includes('@')) {
              const username = email.split('@')[0];
              // Convert username to a name format (e.g., "john.doe" -> "John")
              const formattedName = username
                .split(/[._-]/) // Split by common username separators
                .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                .join(' ');
              
              userData.firstName = formattedName;
            }
            
            return userData;
          }
        }
        
        // As a last resort, generate placeholder data if we have tokens but no user info
        if (Object.keys(localStorage).some(key => 
          key.includes('token') || 
          key.includes('supabase') || 
          key.includes('auth') || 
          key.includes('sb-')
        )) {
          console.log("Found auth tokens but no user data - creating placeholder");
          return {
            firstName: "Account",
            email: "authenticated_user@akii.ai",
            isAuthenticated: true
          };
        }
      } catch (e) {
        console.error("Error looking for user data in localStorage:", e);
      }
    }
    
    return defaultData;
  };

  // Subscribe to auth changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed in DashboardLayout: ${event}`);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          loadUserData();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          // Navigate away from dashboard on sign out
          window.location.href = '/';
        }
      }
    );
    
    // Check auth with standard service
    const checkAuthWithService = async () => {
      try {
        console.log("Checking authentication with standard Supabase auth");
        
        // Import our auth helpers
        const { getCurrentUser, getCurrentSession } = await import('@/lib/auth-helpers');
        
        // Check if user is authenticated
        const { data: session } = await getCurrentSession();
        
        if (session) {
          console.log("User is authenticated with a valid session");
          setHasStorageAuth(true);
          
          // Get current user
          const { data: user } = await getCurrentUser();
          
          if (user) {
            console.log("User found:", user.id);
            // Create a fallback user in localStorage for other components
            localStorage.setItem('akii-auth-fallback-user', JSON.stringify({
              id: user.id,
              email: user.email,
              first_name: user.user_metadata?.first_name,
              last_name: user.user_metadata?.last_name,
              role: user.app_metadata?.role
            }));
          }
        }
      } catch (error) {
        console.error("Error checking auth with standard service:", error);
      }
    };
    
    checkAuthWithService();
    loadUserData();
    
    // Handle runtime connection errors
    const originalOnError = window.onerror;
    
    window.onerror = function(message, source, lineno, colno, error) {
      // Check if it's the specific connection error we're looking for
      if (message && message.toString().includes("Could not establish connection")) {
        console.log("Suppressing Chrome extension connection error:", message);
        setConnectionError(error || new Error(message.toString()));
        // Return true to prevent the error from propagating to the console
        return true;
      }
      
      // Call the original handler for other errors
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };
    
    return () => {
      authListener?.subscription.unsubscribe();
      window.onerror = originalOnError;
    };
  }, []);

  // User role calculations
  const isAdmin = Boolean(
    profile?.is_admin || 
    profile?.role === 'admin'
  );
  
  const isTeamOwner = Boolean(
    profile?.is_team_owner
  );

  return {
    user: user?.user || null,
    profile,
    loading,
    hasStorageAuth,
    connectionError,
    isAdmin,
    isTeamOwner,
    handleSignOut,
    getData,
    loadUserData,
    tryToRecoverAuth
  };
} 