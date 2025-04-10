import { User } from '@supabase/supabase-js';
import { Database } from "./supabase.tsx";

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
  company_name?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  is_fallback_profile?: boolean;
  subscription_status?: string | null;
  subscription_tier?: string | null;
  is_admin?: boolean;
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
  if (!profile) {
    console.log('[Profile Validation] Profile is null or undefined');
    return false;
  }
  
  // Detailed validation with logging for easier debugging
  const validations = [
    { field: 'id', valid: !!profile.id && typeof profile.id === 'string' },
    { field: 'email', valid: profile.email === undefined || profile.email === null || typeof profile.email === 'string' },
    { field: 'role', valid: !!profile.role && typeof profile.role === 'string' },
    { field: 'status', valid: !!profile.status && typeof profile.status === 'string' }
  ];
  
  const failedChecks = validations.filter(v => !v.valid);
  
  if (failedChecks.length > 0) {
    console.log('[Profile Validation] Invalid profile:', 
      failedChecks.map(f => `${f.field}: ${JSON.stringify(profile[f.field])}`).join(', '));
    return false;
  }
  
  return true;
}; 