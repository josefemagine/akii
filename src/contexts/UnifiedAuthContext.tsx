/**
 * AuthContext.tsx
 * 
 * A simplified auth provider that works with Supabase and handles profiles reliably
 * Refactored to use the new modular auth hooks
 */

import React, { createContext, useContext, useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { sleep } from '@/lib/utils/sleep';
import { withRequestLock } from '@/lib/request-lock';
import { Database } from "@/types/supabase";
import { 
  AuthContextType,
  Profile,
  isCompleteProfile,
  AUTH_STATE_CHANGE_EVENT,
  AUTH_ERROR_EVENT,
  AUTH_RECOVERY_EVENT
} from "@/types/auth";
import { USER_DATA_ENDPOINT } from "@/lib/api-endpoints";
import { useAuth as useNewAuth } from '@/hooks/useAuth';

// Debug logger
const log = (...args: any[]) => console.log('[UnifiedAuthContext]', ...args);

// Add these helper functions and interface before the AuthProvider component

interface ExtendedProfile extends Profile {
  is_emergency_profile?: boolean;
  is_last_resort?: boolean;
}

// Create a cache for user profiles to avoid excessive fetching
const profileCache = new Map<string, Profile>();

// Clear the entire profile cache
const clearProfileCache = () => {
  profileCache.clear();
  log('Profile cache cleared');
  
  // Also clear session storage cache
  try {
    if (typeof sessionStorage !== 'undefined') {
      const profileKeys = Object.keys(sessionStorage).filter(key => key.startsWith('profile-'));
      profileKeys.forEach(key => sessionStorage.removeItem(key));
      log(`Cleared ${profileKeys.length} cached profiles from session storage`);
    }
  } catch (e) {
    console.error('Error clearing profile cache from session storage:', e);
  }
};

// Clear a specific user's cached profile
const clearCachedUserProfile = (userId: string) => {
  if (userId && profileCache.has(userId)) {
    profileCache.delete(userId);
    log(`Cleared cached profile for user ${userId}`);
    
    // Also clear from session storage
    try {
      if (typeof sessionStorage !== 'undefined') {
        const cacheKey = `profile-${userId}`;
        sessionStorage.removeItem(cacheKey);
      }
    } catch (e) {
      console.error('Error clearing cached profile from session storage:', e);
    }
  }
};

// Helper function to check if an email belongs to an admin
// This should only be used as a fallback when profile role isn't available
const isAdminEmail = (email: string): boolean => {
  if (!email) return false;
  
  // For production, we should rely only on database roles
  // This is just an emergency fallback for edge cases
  log(`Email based admin detection should not be used in production`);
  return false; // Never determine admin status by email in production
};

// Helper function to cache user profile
const cacheUserProfile = (userId: string, profile: Profile): void => {
  if (!userId || !profile) return;
  
  // Add to in-memory cache
  profileCache.set(userId, profile);
  
  // Also cache in session storage for persistence between page refreshes
  try {
    if (typeof sessionStorage !== 'undefined') {
      const cacheKey = `profile-${userId}`;
      sessionStorage.setItem(cacheKey, JSON.stringify({
        profile,
        timestamp: Date.now()
      }));
    }
  } catch (e) {
    console.error('Error caching profile:', e);
  }
};

// Helper function to get cached user profile from Map or session storage
const getCachedUserProfile = (userId: string): Profile | null => {
  if (!userId) return null;
  
  // First check in-memory cache (fastest)
  if (profileCache.has(userId)) {
    return profileCache.get(userId) || null;
  }
  
  // Then check session storage (persists between page refreshes)
  try {
    if (typeof sessionStorage !== 'undefined') {
      const cacheKey = `profile-${userId}`;
      const cachedProfileStr = sessionStorage.getItem(cacheKey);
      if (cachedProfileStr) {
        const { profile, timestamp } = JSON.parse(cachedProfileStr);
        // Use cache if it's less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          // Also update the in-memory cache
          profileCache.set(userId, profile);
          return profile;
        }
      }
    }
  } catch (e) {
    console.error('Error reading cached profile:', e);
  }
  return null;
};

// Add this interface with the EdgeFunctionUserData before the AuthProvider
interface EdgeFunctionUserData extends Profile {
  is_super_admin?: boolean;
}

// Default context - this is preserved to ensure compatibility
const defaultContext: AuthContextType = {
  user: null,
  profile: null,
  hasUser: false,
  hasProfile: false,
  isValidProfile: () => false,
  isAdmin: false,
  isSuperAdmin: false,
  isDeveloper: false,
  authLoading: true,
  isLoading: true,
  refreshAuthState: async () => {},
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshProfile: async () => null,
  updateProfile: async () => false,
  setUserAsAdmin: async () => false,
  checkSuperAdminStatus: async () => false
};

// Create context
export const AuthContext = createContext<AuthContextType>(defaultContext);

/**
 * Provider component that uses the new hook-based auth system
 * This maintains compatibility with the existing API
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Use our new combined auth hook
  const {
    // Auth state
    user,
    profile,
    hasUser,
    hasProfile,
    isLoading,
    authError,
    
    // Auth actions
    signIn: newSignIn,
    signUp: newSignUp,
    signOut: newSignOut,
    
    // Profile operations
    refreshProfile,
    updateProfile,
    isValidProfile,
    
    // Admin/permissions
    isAdmin,
    isSuperAdmin,
    checkAdminStatus,
    setUserAsAdmin
  } = useNewAuth();
  
  // Function adaptors to ensure API compatibility with existing code
  const signIn = async (email: string, password: string): Promise<void> => {
    log('Legacy signIn called with email', email);
    await newSignIn({ email, password });
  };
  
  const signUp = async (email: string, password: string, metadata?: any): Promise<void> => {
    log('Legacy signUp called with email', email);
    await newSignUp({ email, password, metadata });
  };
  
  const signOut = async (): Promise<void> => {
    log('Legacy signOut called');
    await newSignOut();
  };
  
  // Simple wrapper to maintain API compatibility
  const refreshAuthState = async (): Promise<void> => {
    log('Legacy refreshAuthState called');
    await refreshProfile();
  };
  
  // Compatibility wrapper
  const checkSuperAdminStatus = async (): Promise<boolean> => {
    return isSuperAdmin;
  };
  
  // isDeveloper is a special computed property for this context
  const isDeveloper = !!(profile && ['admin', 'developer'].includes(profile.role));
  
  // Create the context value with the same shape as the original
  const contextValue: AuthContextType = {
    user,
    profile,
    hasUser,
    hasProfile,
    isValidProfile,
    isAdmin,
    isSuperAdmin,
    isDeveloper,
    authLoading: isLoading,
    isLoading,
    refreshAuthState,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfile,
    setUserAsAdmin,
    checkSuperAdminStatus
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// For compatibility: re-export as alias
export { useAuth as useAuthContext };
export { AuthContext as UnifiedAuthContext };
export { AuthProvider as UnifiedAuthProvider };