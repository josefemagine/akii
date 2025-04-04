/**
 * Auth Compatibility Layer
 * 
 * This file provides compatibility between the existing auth interfaces
 * and the new direct DB access approach. It allows existing components to
 * keep using the same interface while the actual data comes from direct DB access.
 */
import React, { createContext, useContext, ReactNode } from 'react';
import { useDirectAuth } from './direct-auth-context';

// Create the compatibility context
const AuthCompatibilityContext = createContext<any | undefined>(undefined);

// Create a provider that wraps DirectAuthProvider and provides the same interface
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Get the direct auth context with fallback for when it's not in context
  let directAuthContext: any = {
    user: null,
    profile: null,
    isLoading: false,
    isAdmin: false,
    signOut: async () => ({}),
    refreshAuthState: async () => {},
    directLogin: async () => ({ success: false, error: { message: 'Direct auth not available' } })
  };
  
  try {
    directAuthContext = useDirectAuth();
  } catch (error) {
    console.warn('DirectAuthProvider not found in context, using fallback values', error);
  }

  const {
    user,
    profile,
    isLoading,
    isAdmin,
    signOut,
    refreshAuthState,
    directLogin,
  } = directAuthContext;

  // Create the compatibility value that matches the old interface
  const compatibilityValue = {
    // User-related properties
    user,
    profile,
    isLoading,
    
    // Admin status
    isAdmin,
    
    // Methods
    signOut,
    refreshAuthState,
    
    // Legacy methods with compatibility wrappers
    signInWithPassword: async (credentials: { email: string, password: string }) => {
      return directLogin(credentials.email, credentials.password);
    },
    
    // Additional compatibility methods
    getSession: async () => {
      // Return a mock session object with the user's ID
      return {
        data: {
          session: user ? { 
            user: { 
              id: user.id,
              email: user.email,
            } 
          } : null
        },
        error: null
      };
    },
  };

  return (
    <AuthCompatibilityContext.Provider value={compatibilityValue}>
      {children}
    </AuthCompatibilityContext.Provider>
  );
};

// Export the standard auth provider as an alias for backward compatibility
export { AuthProvider as StandardAuthProvider };

// Export a combined auth provider that is just an alias
export const CombinedAuthProvider = AuthProvider;

// Safe useAuth hook that uses the compatibility context
export function useAuth() {
  try {
    const context = useContext(AuthCompatibilityContext);
    
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
  } catch (e) {
    console.warn("Error using auth context:", e);
    throw e; // Re-throw to ensure errors are propagated
  }
}

// Export as default for backward compatibility
export default useAuth; 