import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { EnhancedUser } from '@/types/dashboard';
import { clearAuthStorage } from '@/utils/dashboard';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook for managing dashboard user sessions
 */
export function useDashboardSession() {
  const navigate = useNavigate();
  const { user: authUser, signOut: authSignOut } = useAuth();
  
  // Session state
  const [isLoading, setIsLoading] = useState(true);
  const [typedUser, setTypedUser] = useState<EnhancedUser | null>(null);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  
  /**
   * Sign out from the application
   */
  const handleSignOut = useCallback(async (scope: 'global' | 'local' | 'others' = 'global') => {
    try {
      if (scope === 'global' || scope === 'local') {
        await authSignOut();
        
        // Clear local storage data
        clearAuthStorage();
        
        setTypedUser(null);
        
        // Redirect to home
        navigate('/');
      }
    } catch (error) {
      console.error('Error in handleSignOut:', error);
      toast({
        title: "Sign Out Failed",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
      });
    }
  }, [authSignOut, navigate]);
  
  /**
   * Check authentication with Supabase service
   */
  const checkAuthWithService = useCallback(async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn('No session found during checkAuthWithService');
        return null;
      }
      
      const user = session.user as EnhancedUser;
      setTypedUser(user);
      return user;
    } catch (error) {
      console.error('Error in checkAuthWithService:', error);
      return null;
    }
  }, []);
  
  // Initial effect to set the typed user from auth user
  useEffect(() => {
    if (authUser) {
      setTypedUser(authUser as EnhancedUser);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      checkAuthWithService().finally(() => {
        setIsLoading(false);
      });
    }
  }, [authUser, checkAuthWithService]);
  
  // Set up auth state change listener
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state change: ${event}`);
      
      if (event === 'SIGNED_IN' && session) {
        setTypedUser(session.user as EnhancedUser);
      } else if (event === 'SIGNED_OUT') {
        setTypedUser(null);
        navigate('/');
      }
    });
    
    return () => {
      data.subscription.unsubscribe();
    };
  }, [navigate]);
  
  // Listen for runtime connection errors
  useEffect(() => {
    const handleConnectionError = () => {
      console.warn('Connection error detected');
      setHasConnectionError(true);
      setErrorCount((prev) => prev + 1);
    };
    
    const handleConnectionRestored = () => {
      setHasConnectionError(false);
    };
    
    window.addEventListener('online', handleConnectionRestored);
    window.addEventListener('offline', handleConnectionError);
    
    return () => {
      window.removeEventListener('online', handleConnectionRestored);
      window.removeEventListener('offline', handleConnectionError);
    };
  }, []);
  
  return {
    isLoading,
    typedUser,
    hasConnectionError,
    errorCount,
    signOut: handleSignOut,
    checkAuthWithService
  };
} 