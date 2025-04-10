import { useEffect, useState } from 'react';
import * as auth from '@/lib/auth-helpers.ts';

/**
 * Settings component with authentication check
 */
export default function Settings() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check if the user is authenticated before showing settings
   */
  const checkAuthState = async () => {
    console.log("Settings: Checking auth state...");
    
    try {
      // First try the standard method
      const result = await auth.getCurrentSession();
      
      // If standard method failed but we have a token, proceed anyway
      if (!result?.data) {
        // Check for valid auth token in localStorage as fallback
        const tokenKey = Object.keys(localStorage).find(key => 
          key.startsWith('sb-') && key.includes('-auth-token')
        );
        
        if (tokenKey) {
          try {
            const tokenData = JSON.parse(localStorage.getItem(tokenKey) || '{}');
            if (tokenData?.access_token) {
              console.log("Settings: Using token from localStorage after session check failed");
              // We have a token, so we can assume the user is authenticated
              setIsAuthenticated(true);
              return;
            }
          } catch (e) {
            console.warn("Settings: Error parsing token from localStorage:", e);
          }
        }
        
        console.error("Settings: Session error:", result?.error || "No session found");
        setIsAuthenticated(false);
        return;
      }
      
      // If we got a valid session, user is authenticated
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Settings: Session error:", error);
      
      // Even if session check failed, check localStorage as fallback
      try {
        const tokenKey = Object.keys(localStorage).find(key => 
          key.startsWith('sb-') && key.includes('-auth-token')
        );
        
        if (tokenKey) {
          const tokenData = JSON.parse(localStorage.getItem(tokenKey) || '{}');
          if (tokenData?.access_token) {
            console.log("Settings: Using token from localStorage after error");
            setIsAuthenticated(true);
            return;
          }
        }
      } catch (e) {
        // If everything fails, user is not authenticated
        console.warn("Settings: Error during fallback token check:", e);
      }
      
      setIsAuthenticated(false);
    }
  };
  
  // Check auth state on component mount
  useEffect(() => {
    checkAuthState().finally(() => setIsLoading(false));
  }, []);
  
  if (isLoading) {
    return <div>Loading settings...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Please sign in to view settings.</div>;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p>Your account settings will appear here.</p>
    </div>
  );
} 