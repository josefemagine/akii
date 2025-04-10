/**
 * Main dashboard authentication hook
 * 
 * This hook combines the functionality of specialized hooks for session, profile, and emergency auth.
 * It maintains the same API as the original hook for backward compatibility.
 */
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.ts';
import { supabase } from "@/lib/supabase.tsx";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { safeLocalStorage, safeSessionStorage } from '@/lib/browser-check.ts';
import { toast } from '@/components/ui/use-toast.ts';
import { useDashboardSession } from './useDashboardSession.ts';
import { useDashboardProfile } from './useDashboardProfile.ts';
import { useDashboardEmergencyAuth } from './useDashboardEmergencyAuth.ts';
import { EnhancedUser, UserProfile, UserDisplayData } from '@/types/dashboard.ts';

/**
 * Main dashboard authentication hook
 */
export function useDashboardAuth() {
  const navigate = useNavigate();
  
  // Use specialized hooks
  const {
    isLoading: isSessionLoading,
    typedUser,
    hasConnectionError,
    errorCount,
    signOut,
    checkAuthWithService
  } = useDashboardSession();
  
  const {
    userProfile,
    displayData,
    needsProfileCreation,
    isLoadingProfile,
    loadUserProfile,
    createProfile,
    refreshProfile
  } = useDashboardProfile(typedUser);
  
  const {
    isAuthenticating,
    isEmergencyAuth,
    tryToRecoverAuth,
    checkLocalAuth,
    forceCheckLocalAuth
  } = useDashboardEmergencyAuth();
  
  // Combined loading state
  const isLoading = isSessionLoading || isLoadingProfile;
  
  // Effects
  
  // Load user profile when typedUser changes
  useEffect(() => {
    if (typedUser && !userProfile && !isLoadingProfile) {
      loadUserProfile();
    }
  }, [typedUser, userProfile, isLoadingProfile, loadUserProfile]);
  
  // Try to recover auth if there's a connection error and no user
  useEffect(() => {
    if (hasConnectionError && !typedUser && errorCount === 1) {
      const checkFallbackAuth = async () => {
        await tryToRecoverAuth();
      };
      
      checkFallbackAuth();
    }
  }, [hasConnectionError, errorCount, typedUser, tryToRecoverAuth]);
  
  return {
    // State
    isLoading,
    isAuthenticating,
    typedUser,
    userProfile,
    displayData,
    hasConnectionError,
    errorCount,
    needsProfileCreation,
    isEmergencyAuth,
    
    // Methods
    loadUserData: loadUserProfile,
    tryToRecoverAuth,
    checkAuthWithService,
    checkLocalStorageAuth: checkLocalAuth,
    forceCheckLocalStorageAuth: forceCheckLocalAuth,
    createUserProfile: createProfile,
    fetchUserProfileDirectly: refreshProfile,
    handleSignOut: signOut,
    getData: useCallback(() => displayData, [displayData])
  };
} 