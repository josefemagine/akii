import { supabase } from '@/lib/supabase';

/**
 * Force the admin status to true for development testing purposes
 */
export const forceAdminStatus = () => {
  if (import.meta.env.DEV) {
    console.log('Forcing admin status in development mode');
    localStorage.setItem('akii-is-admin', 'true');
    return true;
  }
  return false;
};

/**
 * Set development admin mode
 * @param enable Whether to enable or disable admin mode
 */
export const enableDevAdminMode = (enable: boolean) => {
  if (import.meta.env.DEV) {
    console.log(`${enable ? 'Enabling' : 'Disabling'} dev admin mode`);
    if (enable) {
      localStorage.setItem('akii-is-admin', 'true');
    } else {
      localStorage.removeItem('akii-is-admin');
    }
    return true;
  }
  return false;
};

/**
 * Diagnose super admin issues by checking user status in various tables
 * This is a utility function for debugging purposes
 */
export const diagnoseSuperAdminIssues = async (): Promise<Record<string, any>> => {
  // Only run in development mode
  if (!import.meta.env.DEV) {
    console.warn('diagnoseSuperAdminIssues can only be used in development mode');
    return { error: 'Can only run in development mode' };
  }
  
  try {
    console.log('Running super admin diagnostic...');
    
    // Check if admin mode is enabled in localStorage
    const localStorageAdmin = localStorage.getItem('akii-is-admin') === 'true';
    console.log('Admin mode in localStorage:', localStorageAdmin);
    
    // Call the super admin check function
    const { data, error } = await supabase.functions.invoke('super_admin_check');
    
    if (error) {
      console.error('Error running super admin check:', error);
      return {
        error: error.message,
        localStorageAdmin
      };
    }
    
    // Enhance the data with client-side information
    if (data && typeof data === 'object') {
      data.client_checks = {
        ...data.client_checks,
        localStorage_admin: localStorageAdmin,
        browser: navigator.userAgent,
        window_location: window.location.href,
      };
    }
    
    console.log('Super admin check results:', data);
    
    // Now also check normal is_super_admin function for comparison
    try {
      const { data: superAdminData, error: superAdminError } = await supabase.functions.invoke('is_super_admin');
      console.log('Regular is_super_admin check:', { data: superAdminData, error: superAdminError });
      
      if (data) {
        data.is_super_admin_check = {
          data: superAdminData,
          error: superAdminError ? superAdminError.message : null
        };
      }
    } catch (err) {
      console.error('Error checking is_super_admin:', err);
      if (data) {
        data.is_super_admin_check = {
          error: err instanceof Error ? err.message : String(err)
        };
      }
    }
    
    return data || { error: 'No data returned from super admin check' };
    
  } catch (err) {
    console.error('Admin diagnostic error:', err);
    return {
      error: err instanceof Error ? err.message : String(err),
      localStorageAdmin: localStorage.getItem('akii-is-admin') === 'true'
    };
  }
}; 