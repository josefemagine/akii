// Re-export all auth utilities for easy import
export * from './auth-events.ts';
export * from './auth-api.ts';
export * from './profile-cache.ts';
export * from './profile-utils.ts';
export * from './session-manager.ts';

// Export a helpful message for debugging
import { Session } from '@supabase/supabase-js';
import { getStoredSession, isSessionExpired } from './session-manager.ts';

/**
 * Debug function to get current auth state
 */
export const getAuthDebugInfo = () => {
  const session = getStoredSession();
  
  return {
    hasSession: !!session,
    isExpired: isSessionExpired(),
    sessionExpiresIn: session ? new Date(session.expires_at! * 1000).toLocaleString() : 'N/A',
    userId: session?.user.id || null,
    email: session?.user.email || null,
    lastAuthAt: session?.user.last_sign_in_at || null,
  };
}; 