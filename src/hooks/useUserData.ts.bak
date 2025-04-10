import { useState, useEffect } from "react";
import { safeLocalStorage } from "@/lib/browser-check";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Define enhanced user types to avoid TypeScript errors with the properties we're accessing
export interface EnhancedUser extends Omit<SupabaseUser, 'identities'> {
  _rawData?: {
    user_metadata?: {
      first_name?: string;
      last_name?: string;
      avatar_url?: string;
    };
    raw_user_meta_data?: {
      first_name?: string;
      last_name?: string;
      company?: string;
    }
  };
  raw_user_meta_data?: {
    first_name?: string;
    last_name?: string;
    company?: string;
  };
  identities?: Array<{
    id?: string;
    user_id?: string;
    identity_id?: string;
    provider?: string;
    identity_data?: {
      name?: string;
      full_name?: string;
      given_name?: string;
      family_name?: string;
    };
  }>;
}

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  role?: string;
  [key: string]: any;
}

export interface UserData {
  user: EnhancedUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  hasStorageAuth: boolean;
  forceCheckLocalStorageAuth: () => boolean;
  checkAuthWithService: () => Promise<boolean>;
  saveUserCache: (userData: EnhancedUser) => void;
}

/**
 * Custom hook to load and manage user data
 * Handles auth state, profile fetching, and localStorage fallbacks
 */
export const useUserData = (): UserData => {
  const [user, setUser] = useState<{ user: EnhancedUser } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasStorageAuth, setHasStorageAuth] = useState(false);

  // Function to check for auth tokens in localStorage
  const forceCheckLocalStorageAuth = () => {
    try {
      const hasSupaToken = 
        Boolean(localStorage.getItem('supabase.auth.token')) || 
        Boolean(localStorage.getItem('sb-access-token')) ||
        Boolean(localStorage.getItem('sb-refresh-token'));
      
      setHasStorageAuth(hasSupaToken);
      return hasSupaToken;
    } catch (e) {
      console.error('Error checking localStorage auth:', e);
      return false;
    }
  };

  // Save user data to emergency cache
  const saveUserCache = (userData: EnhancedUser) => {
    try {
      // Set emergency auth for recovery
      localStorage.setItem('akii-auth-emergency', 'true');
      localStorage.setItem('akii-auth-emergency-time', Date.now().toString());
      localStorage.setItem('akii-auth-emergency-email', userData.email || 'unknown-user@example.com');
      
      // Save fallback user data
      const fallbackData = {
        id: userData.id,
        email: userData.email,
        first_name: userData.user_metadata?.first_name || userData.raw_user_meta_data?.first_name,
        last_name: userData.user_metadata?.last_name || userData.raw_user_meta_data?.last_name,
        role: profile?.role || 'user'
      };
      
      localStorage.setItem('akii-auth-fallback-user', JSON.stringify(fallbackData));
    } catch (e) {
      console.error('Error caching user data to localStorage:', e);
    }
  };

  // Try to recover auth state from localStorage
  const tryToRecoverAuth = () => {
    console.log('Attempting to recover auth state from localStorage');
    
    // Check for emergency auth flag
    const hasEmergencyAuth = localStorage.getItem('akii-auth-emergency') === 'true';
    const emergencyEmail = localStorage.getItem('akii-auth-emergency-email');
    const emergencyTime = parseInt(localStorage.getItem('akii-auth-emergency-time') || '0');
    
    // Only use emergency auth if set within the last 30 minutes
    if (hasEmergencyAuth && emergencyEmail && Date.now() - emergencyTime < 30 * 60 * 1000) {
      console.log('Using emergency auth with email:', emergencyEmail);
      
      // Create minimal user object from emergency data with proper type casting
      const emergencyUserData = {
        id: 'emergency-auth-user',
        email: emergencyEmail,
        user_metadata: {
          email: emergencyEmail,
          first_name: 'Emergency',
          last_name: 'User'
        }
      };
      
      // Cast to unknown first, then to EnhancedUser
      const emergencyUser = {
        user: emergencyUserData as unknown as EnhancedUser
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
        
        const fallbackUserData = {
          id: fallbackData.id || 'fallback-user',
          email: fallbackData.email,
          user_metadata: {
            email: fallbackData.email,
            first_name: fallbackData.first_name || 'User',
            last_name: fallbackData.last_name || ''
          }
        };
        
        // Cast to unknown first, then to EnhancedUser
        const fallbackUser = {
          user: fallbackUserData as unknown as EnhancedUser
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
      
      const placeholderUserData = {
        id: 'auth-token-user',
        email: 'authenticated_user@akii.ai',
        user_metadata: {
          email: 'authenticated_user@akii.ai',
          first_name: 'Authenticated',
          last_name: 'User'
        }
      };
      
      // Cast to unknown first, then to EnhancedUser
      const placeholderUser = {
        user: placeholderUserData as unknown as EnhancedUser
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

  // Function to check auth with Supabase service
  const checkAuthWithService = async () => {
    try {
      // Check if authenticated
      const { data: currentUser, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        setError(userError);
        return false;
      }
      
      if (currentUser?.user) {
        console.log('User found:', currentUser.user.id);
        setUser(currentUser as { user: EnhancedUser });
        
        // If we have a valid user, save to emergency cache
        saveUserCache(currentUser.user as EnhancedUser);
        
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
        
        return true;
      }
      
      // No user found
      return false;
    } catch (e) {
      console.error('Error checking auth with service:', e);
      setError(e instanceof Error ? e : new Error(String(e)));
      return false;
    }
  };

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const authOk = await checkAuthWithService();
        
        if (!authOk) {
          // Check session as fallback
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Error getting session:', sessionError);
          } else if (sessionData?.session) {
            console.log('Session found but no user, setting user from session');
            setUser({ user: sessionData.session.user as EnhancedUser });
            
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
    
    loadUserData();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          loadUserData();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return {
    user: user?.user || null,
    profile,
    loading,
    error,
    hasStorageAuth,
    forceCheckLocalStorageAuth,
    checkAuthWithService,
    saveUserCache
  };
};

export default useUserData; 