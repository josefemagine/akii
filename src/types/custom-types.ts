import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, UserProfile as CustomUserProfile, Subscription } from './custom';

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
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  [key: string]: string;
}

// Extend the Window interface
declare global {
  interface Window {
    ENV?: EnvironmentVariables;
  }
} 