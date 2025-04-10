import { supabase } from '@/lib/supabase';

/**
 * Admin functionality is now determined by database roles only
 */
export const forceAdminStatus = () => {
  console.log('Admin status is now determined solely from database roles');
  // Remove any localStorage overrides
  localStorage.removeItem('akii-is-admin');
  return false;
};

/**
 * Set admin mode from database only
 * @param enable Ignored - kept for backward compatibility
 */
export const enableDevAdminMode = (enable: boolean) => {
  console.log(`Admin status is now always determined from database roles`);
  // Remove any localStorage overrides to ensure we only use database roles
  localStorage.removeItem('akii-is-admin');
  return false; // Always return false to indicate operation is no longer supported
};

/**
 * Diagnose admin permission issues by checking user status
 * This is a utility function for debugging purposes
 */
export const diagnoseAdminIssues = async (): Promise<Record<string, any>> => {
  // Only run in development mode
  if (!import.meta.env.DEV) {
    console.warn('diagnoseAdminIssues can only be used in development mode');
    return { error: 'Can only run in development mode' };
  }
  
  try {
    console.log('Running admin permission diagnostic...');
    
    // Check if admin mode is enabled in localStorage
    const localStorageAdmin = localStorage.getItem('akii-is-admin') === 'true';
    console.log('Admin mode in localStorage:', localStorageAdmin);
    
    // Get user info from supabase
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    
    if (!userId) {
      return {
        error: 'No authenticated user found',
        localStorageAdmin
      };
    }
    
    // Get user profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    // Get admin status from users table
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();
    
    const diagnosticData = {
      userId,
      profile: profileData || null,
      user_table: userData || null,
      client_checks: {
        localStorage_admin: localStorageAdmin,
        browser: navigator.userAgent,
        window_location: window.location.href,
      }
    };
    
    console.log('Admin permission check results:', diagnosticData);
    return diagnosticData;
    
  } catch (err) {
    console.error('Admin diagnostic error:', err);
    return {
      error: err instanceof Error ? err.message : String(err),
      localStorageAdmin: localStorage.getItem('akii-is-admin') === 'true'
    };
  }
};

// For backward compatibility, keep the old function name 
export const diagnoseSuperAdminIssues = diagnoseAdminIssues; 