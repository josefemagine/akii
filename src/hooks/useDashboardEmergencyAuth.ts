import { useState, useCallback } from 'react';
import { recoverAuthFromLocalStorage, checkLocalStorageAuth } from '@/utils/dashboard.ts';
import { toast } from '@/components/ui/use-toast.ts';

/**
 * Hook for managing emergency authentication fallbacks
 */
export function useDashboardEmergencyAuth() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isEmergencyAuth, setIsEmergencyAuth] = useState(false);
  
  /**
   * Try to recover authentication from localStorage if session is missing
   */
  const tryToRecoverAuth = useCallback(async () => {
    try {
      setIsAuthenticating(true);
      
      const { user, profile } = await recoverAuthFromLocalStorage();
      
      if (user) {
        setIsEmergencyAuth(true);
        return { user, profile };
      }
      
      return { user: null, profile: null };
    } catch (error) {
      console.error('Error in tryToRecoverAuth:', error);
      return { user: null, profile: null };
    } finally {
      setIsAuthenticating(false);
    }
  }, []);
  
  /**
   * Check for locally cached auth data
   */
  const checkLocalAuth = useCallback(() => {
    try {
      const { user, profile } = checkLocalStorageAuth();
      if (user) {
        setIsEmergencyAuth(true);
        return { user, profile };
      }
      return { user: null, profile: null };
    } catch (error) {
      console.error('Error in checkLocalAuth:', error);
      return { user: null, profile: null };
    }
  }, []);
  
  /**
   * Force check localStorage auth (for manual calls)
   */
  const forceCheckLocalAuth = useCallback(() => {
    const { user, profile } = checkLocalAuth();
    if (user) {
      toast({
        title: "Emergency Authentication",
        description: "Using cached authentication. Some features may be limited.",
        variant: "destructive",
      });
    }
    return { user, profile };
  }, [checkLocalAuth]);
  
  return {
    isAuthenticating,
    isEmergencyAuth,
    tryToRecoverAuth,
    checkLocalAuth,
    forceCheckLocalAuth
  };
} 