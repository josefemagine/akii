/**
 * Simple Admin Helper
 * 
 * Sets localStorage flags for admin mode for the specific admin user ID
 */

// Target admin user ID
const ADMIN_USER_ID = 'b574f273-e0e1-4cb8-8c98-f5a7569234c8';

/**
 * Enable admin access via localStorage
 * This will allow the admin user to access admin routes
 * even if the database flags aren't properly set
 */
export function enableAdminAccess() {
  // Check if current user is the admin user
  const userId = localStorage.getItem('supabase.auth.token.currentSession')
    ? JSON.parse(localStorage.getItem('supabase.auth.token.currentSession') || '{}')?.user?.id
    : null;
  
  console.log('Current user ID:', userId);
  
  if (userId === ADMIN_USER_ID) {
    // Set all known localStorage flags
    localStorage.setItem('user_is_admin', 'true');
    localStorage.setItem('admin_user_id', ADMIN_USER_ID);
    localStorage.setItem('akii-is-admin', 'true');
    
    console.log('✅ Admin access enabled via localStorage flags');
    console.log('🔄 Please refresh the page to apply changes');
    
    return true;
  } else {
    console.error('❌ Current user is not the target admin user');
    console.log('Current user ID:', userId);
    console.log('Target admin ID:', ADMIN_USER_ID);
    
    return false;
  }
}

// Make function available globally
if (typeof window !== 'undefined') {
  (window as any).enableAdminAccess = enableAdminAccess;
  console.log('🛠️ Admin helper loaded - run enableAdminAccess() to enable admin mode in localStorage');
}

// Export for module usage
export default enableAdminAccess; 