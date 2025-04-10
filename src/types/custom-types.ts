import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, UserProfile as CustomUserProfile, Subscription } from './custom.ts';

// Re-export the User type from custom.ts
export type { User };

// Define user roles type
export type UserRole = 'admin' | 'user' | 'owner' | 'editor' | null;

// Define user status type
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | null;

// Re-export the UserProfile type, ensuring compatibility
export type UserProfile = CustomUserProfile;

// Environment variables interface
interface EnvironmentVariables {
  VITE_SUPABASE_URL?: string;
  SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_SERVICE_ROLE_KEY?: string; 
  SUPABASE_SERVICE_KEY?: string;
  [key: string]: string | undefined;
}

// Extend the Window interface
declare global {
  interface Window {
    ENV?: EnvironmentVariables;
  }
} 