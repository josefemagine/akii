/**
 * SUPABASE INDEX MODULE
 * Main entry point for all Supabase-related functionality
 * IMPORTANT: Always import from this file, never from individual modules
 */

// Import directly to fix references
import { getClient, getAdminClient, supabase, supabaseAdmin } from './client';
import { getAuth } from './auth';

// Re-export from client
export { 
  getClient, 
  getAdminClient, 
  supabase, 
  supabaseAdmin 
} from './client';

// Re-export from auth
export {
  getAuth,
  getCurrentUser,
  getCurrentSession,
  getUserProfile,
  updateUserProfile,
  checkUserStatus,
  setUserRole,
  setUserStatus
} from './auth';

// Re-export from admin
export {
  getAllUsers,
  syncUserProfile,
  ensureUserProfile,
  setUserAsAdmin
} from './admin';

// Re-export types
export type {
  UserProfile,
  UserRole,
  UserStatus,
  ApiResponse
} from './types';

// Aliases for backward compatibility
export const supabaseClient = supabase;
export const auth = getAuth(); 