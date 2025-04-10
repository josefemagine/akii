import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabase.tsx";
import { Profile } from '@/types/auth.ts';
import { 
  getStoredSession, 
  saveSession, 
  clearSession,
  getCachedUserProfile,
  fetchUserProfile,
  onAuthStateChange,
  dispatchAuthStateChange,
  dispatchAuthError
} from '@/utils/auth.ts';

// Debug logger
const log = (...args: any[]) => console.log('[useAuthState]', ...args);

interface AuthStateResult {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  hasUser: boolean;
  hasProfile: boolean;
}

/**
 * Custom hook for managing authentication state
 * Handles session tracking, user profile loading, and auth state broadcasting
 */
export function useAuthState(): AuthStateResult {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Refs for state tracking
  const authStateChangeCount = useRef(0);
  const isMounted = useRef(true);
  const profileFetchInProgress = useRef(false);

  // Fetch user profile
  const loadUserProfile = useCallback(async (userId: string) => {
    if (!userId || profileFetchInProgress.current) return null;
    
    try {
      profileFetchInProgress.current = true;
      
      // First try to get from cache
      const cachedProfile = getCachedUserProfile(userId);
      if (cachedProfile) {
        log('Using cached profile for', userId);
        return cachedProfile;
      }
      
      // If not in cache, fetch from database
      const fetchedProfile = await fetchUserProfile(userId);
      
      // Return result (may be null if there was an error)
      return fetchedProfile;
    } catch (err) {
      log('Error loading user profile:', err);
      return null;
    } finally {
      profileFetchInProgress.current = false;
    }
  }, []);

  // Initialize auth state from session and/or localStorage
  const initAuthState = useCallback(async () => {
    try {
      setLoading(true);
      log('Initializing auth state');
      
      // Get the current session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      if (currentSession) {
        log('Found active session');
        // Save session to localStorage for recovery
        saveSession(currentSession);
        
        // Set the user and session state
        setSession(currentSession);
        setUser(currentSession.user);
        
        // Load user profile
        const userProfile = await loadUserProfile(currentSession.user.id);
        setProfile(userProfile);
        
        // Broadcast auth state change
        dispatchAuthStateChange({ 
          authenticated: true,
          userId: currentSession.user.id,
          timestamp: Date.now()
        });
      } else {
        log('No active session found');
        setUser(null);
        setSession(null);
        setProfile(null);
        
        // Broadcast auth state change
        dispatchAuthStateChange({ 
          authenticated: false,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      log('Error initializing auth state:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      dispatchAuthError(error, 'initAuthState');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [loadUserProfile]);

  // Setup auth state change listener
  useEffect(() => {
    log('Setting up auth state change listeners');
    isMounted.current = true;
    
    // Initialize auth state
    initAuthState();
    
    // Subscribe to auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        authStateChangeCount.current += 1;
        const count = authStateChangeCount.current;
        
        log(`Auth state change event (${count}):`, event, !!newSession);
        
        // Handle different auth events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession) {
            saveSession(newSession);
            setSession(newSession);
            setUser(newSession.user);
            
            // Load user profile
            const userProfile = await loadUserProfile(newSession.user.id);
            setProfile(userProfile);
            
            // Broadcast auth state change
            dispatchAuthStateChange({ 
              authenticated: true,
              userId: newSession.user.id,
              event,
              timestamp: Date.now() 
            });
          }
        } 
        else if (event === 'SIGNED_OUT') {
          clearSession();
          setUser(null);
          setSession(null);
          setProfile(null);
          
          // Broadcast auth state change
          dispatchAuthStateChange({ 
            authenticated: false,
            event,
            timestamp: Date.now() 
          });
        }
      }
    );
    
    // Cleanup function
    return () => {
      log('Cleaning up auth state listeners');
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [initAuthState, loadUserProfile]);

  return {
    user,
    session,
    profile,
    loading,
    error,
    hasUser: !!user,
    hasProfile: !!profile
  };
} 