import { useEffect } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext.tsx';
import { AUTH_STATE_CHANGE_EVENT, AuthStateChangeEvent } from '@/types/auth.ts';

/**
 * This component monitors auth state and broadcasts changes via custom events
 * to help coordinate UI state across components (especially modals)
 */
export default function AuthStateManager() {
  const { user } = useAuth();
  
  // Monitor auth state and dispatch events when it changes
  useEffect(() => {
    const isAuthenticated = !!user;
    
    console.log('[Auth State Manager] Auth state changed:', {
      authenticated: isAuthenticated,
      userId: user?.id,
      email: user?.email
    });
    
    // Dispatch a custom event that other components can listen for
    const event = new CustomEvent<AuthStateChangeEvent>(AUTH_STATE_CHANGE_EVENT, {
      detail: {
        authenticated: isAuthenticated,
        userId: user?.id,
        timestamp: Date.now()
      }
    });
    
    document.dispatchEvent(event);
    
    // Force close any auth modals by adding a class to the body that CSS can target
    if (isAuthenticated) {
      document.body.classList.add('auth-authenticated');
      
      // Also check for and close any open modals using the DOM
      const dialogBackdrops = document.querySelectorAll('[data-radix-dialog-overlay]');
      const dialogContents = document.querySelectorAll('[data-radix-dialog-content]');
      
      // If any dialogs are open, attempt to close them
      if (dialogBackdrops.length > 0 || dialogContents.length > 0) {
        console.log('[Auth State Manager] Found open dialogs, attempting to force close');
        
        // Try to find and click close buttons
        document.querySelectorAll('[data-radix-dialog-close]').forEach(button => {
          (button as HTMLElement).click();
        });
        
        // As a fallback, try to click outside the dialog (on the backdrop)
        dialogBackdrops.forEach(backdrop => {
          (backdrop as HTMLElement).click();
        });
      }
    } else {
      document.body.classList.remove('auth-authenticated');
    }
  }, [user]);
  
  // This component doesn't render anything
  return null;
} 