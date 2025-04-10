/**
 * Dashboard and authentication types
 */
import { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * Extended user interface to include additional data from Supabase
 */
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

/**
 * User display data for UI
 */
export interface UserDisplayData {
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isAuthenticated?: boolean;
}

/**
 * Profile data from the database
 */
export interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  team_id?: string;
  company?: string;
}

/**
 * Dashboard authentication state
 */
export interface DashboardAuthState {
  isLoading: boolean;
  isAuthenticating: boolean;
  typedUser: EnhancedUser | null;
  userProfile: UserProfile | null;
  displayData: UserDisplayData;
  hasConnectionError: boolean;
  errorCount: number;
  needsProfileCreation: boolean;
  isEmergencyAuth: boolean;
} 