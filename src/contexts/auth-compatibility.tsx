/**
 * Auth Compatibility Layer
 * 
 * This file provides compatibility between the existing auth interfaces
 * and the new unified auth context. It allows existing components to
 * keep using the same interface while the actual data comes from the unified provider.
 */
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useUnifiedAuth, useDirectAuth as useUnifiedDirectAuth } from './UnifiedAuthContext';

// Create a compatibility layer that simply forwards to the unified auth context
export function useAuth() {
  try {
    // Use the unified auth context directly
    return useUnifiedAuth();
  } catch (e) {
    console.warn("Error using auth context:", e);
    throw e; // Re-throw to ensure errors are propagated
  }
}

// Forward the direct auth hook as well
export function useDirectAuth() {
  return useUnifiedDirectAuth();
}

// Create a compatibility wrapper for components still expecting an AuthProvider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Simply render children since UnifiedAuthProvider should already be at the root
  return <>{children}</>;
};

// Export the standard auth provider as an alias for backward compatibility
export { AuthProvider as StandardAuthProvider };

// Export a combined auth provider that is just an alias
export const CombinedAuthProvider = AuthProvider;

// Export as default for backward compatibility
export default useAuth; 