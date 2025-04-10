import { useContext, useMemo } from 'react';
import { AuthContext } from '@/contexts/UnifiedAuthContext.tsx';
import { Profile } from '@/types/auth.ts';
import { isCompleteProfile } from '@/types/auth.ts';
import { isAdmin, isTeamOwner } from '@/utils/auth.ts';

/**
 * Enhanced hook for using auth context with extra computed properties
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  const { user, profile } = context;
  
  // Computed properties that don't need to be stored in state
  // These are memoized to avoid recalculating on every render
  const isUserAdmin = useMemo(() => isAdmin(profile), [profile]);
  const isUserTeamOwner = useMemo(() => isTeamOwner(profile), [profile]);
  const hasValidProfile = useMemo(() => !!profile && isCompleteProfile(profile), [profile]);
  
  // Compute display name from profile or fallback to email
  const displayName = useMemo(() => {
    if (!profile) return user?.email?.split('@')[0] || 'User';
    
    // Try to use display_name if available
    if (profile.display_name) return profile.display_name;
    
    // Otherwise use first and last name if available
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    
    // Use username if available
    if (profile.username) return profile.username;
    
    // Fall back to email without domain or user ID
    return profile.email?.split('@')[0] || user?.email?.split('@')[0] || 'User';
  }, [profile, user]);
  
  // Return extended context with computed values
  return {
    ...context,
    isAdmin: isUserAdmin,
    isTeamOwner: isUserTeamOwner,
    hasValidProfile,
    displayName,
  };
} 