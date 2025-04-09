import { User } from '@supabase/supabase-js';
import { Database } from './supabase';

/**
 * Standard User Profile interface
 * Used throughout the application for consistent typing
 */
export interface Profile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  username?: string;
  avatar_url?: string;
  display_name?: string;
  company?: string;
  is_fallback_profile?: boolean;
  subscription_status?: string | null;
  subscription_tier?: string | null;
}

/**
 * Auth state change event interface
 * Used for broadcasting authentication state changes
 */
export interface AuthStateChangeEvent {
  authenticated: boolean;
  userId?: string;
  timestamp: number;
}

/**
 * Main Auth Context interface
 * Provides typing for the UnifiedAuthContext
 */
export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  hasUser: boolean;
  hasProfile: boolean;
  isValidProfile: (p: Profile | null) => boolean;
  isAdmin: boolean;
  isDeveloper: boolean;
  authLoading: boolean;
  isLoading: boolean;
  refreshAuthState: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
  setUserAsAdmin: () => Promise<boolean>;
}

// Auth-related event names
export const AUTH_STATE_CHANGE_EVENT = 'akii:auth:stateChange';
export const AUTH_ERROR_EVENT = 'akii:auth:error';
export const AUTH_RECOVERY_EVENT = 'akii:auth:recovery';

// Auth roles
export const AUTH_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  DEVELOPER: 'developer',
} as const;

// Auth status
export const AUTH_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
} as const;

// Profile validation helpers
export const isCompleteProfile = (profile: any): profile is Profile => {
  return profile && 
    typeof profile.id === 'string' && 
    typeof profile.email === 'string' && 
    typeof profile.role === 'string' && 
    typeof profile.status === 'string';
}; 