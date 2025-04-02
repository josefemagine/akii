/**
 * Auth Compatibility Layer
 * 
 * This file provides compatibility between the different auth contexts
 * in the application.
 */
import React, { ReactNode } from 'react';

// Only import the StandardAuthContext
import { AuthProvider as StandardAuthProvider, useAuth as useStandardAuth } from './StandardAuthContext';

// Re-export StandardAuthProvider
export { StandardAuthProvider };

// Safe useAuth hook that now only uses the StandardAuthContext
export function useAuth() {
  try {
    return useStandardAuth();
  } catch (e) {
    console.warn("Error using auth context:", e);
    throw e; // Re-throw to ensure errors are propagated
  }
}

// Export the CombinedAuthProvider as just a wrapper for StandardAuthProvider
export function CombinedAuthProvider({ children }: { children: ReactNode }) {
  return (
    <StandardAuthProvider>
      {children}
    </StandardAuthProvider>
  );
}

// Default export is the useAuth hook
export default useAuth; 