/**
 * Admin utility functions to ensure reliable admin access and page loading
 */

import { supabase } from './supabase';

/**
 * Checks all possible admin indicators to determine admin status
 * This is a fast, synchronous check that uses localStorage and other client-side indicators
 */
export const getClientSideAdminStatus = (): boolean => {
  // Admin status is now determined solely from database records
  console.log('[Admin Utils] Admin status is determined by database roles only');
  return false;
};

/**
 * Forces admin status in localStorage for the current session
 * This prevents auth flicker during page navigation
 */
export const forceAdminStatus = (email?: string): void => {
  console.log('Admin status is now determined solely from database roles');
  // Clear any localStorage admin overrides to ensure consistent behavior
  localStorage.removeItem('akii-is-admin');
  localStorage.removeItem('akii_admin_override');
};

/**
 * Check admin status directly in the database
 * This is a server-side check that should be used sparingly
 */
export const checkAdminStatusInDatabase = async (userId: string): Promise<boolean> => {
  try {
    // First check if we've checked recently to avoid excessive queries
    const lastCheck = parseInt(localStorage.getItem('akii-last-db-admin-check') || '0');
    const now = Date.now();
    
    // Only check every 60 seconds at most
    if (now - lastCheck < 60000) {
      return getClientSideAdminStatus();
    }
    
    // Update last check time
    localStorage.setItem('akii-last-db-admin-check', now.toString());
    
    // Query the database
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error checking admin status in database:', error);
      return false;
    }
    
    const isAdmin = data?.role === 'admin';
    
    // If admin, update localStorage
    if (isAdmin) {
      forceAdminStatus();
    }
    
    return isAdmin;
  } catch (error) {
    console.error('Exception checking admin status in database:', error);
    return false;
  }
};

/**
 * Initialize admin page - should be called at the top of each admin component
 * This ensures that admin state is properly set up before rendering
 */
export const initializeAdminPage = (): void => {
  const isAdmin = getClientSideAdminStatus();
  
  if (isAdmin) {
    // Refresh admin status in localStorage
    forceAdminStatus();
    
    // Log for debugging
    console.log('[Admin] Page initialized with admin access');
  } else {
    console.log('[Admin] Page initialized without admin access');
  }
};

/**
 * Utility to force admin status in development mode for testing
 * This should only be used in development
 */
export const enableDevAdminMode = (): void => {
  if (import.meta.env.DEV) {
    forceAdminStatus('admin@akii.com');
    console.log('[Admin] Development admin mode enabled');
  }
}; 