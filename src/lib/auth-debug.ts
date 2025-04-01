import { supabase, auth } from './supabase-singleton';

export async function checkAuthState() {
  console.log('---------- AUTH DEBUG ----------');
  
  // Check localStorage
  try {
    console.log('LocalStorage auth keys:');
    const keys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') || 
      key.includes('auth') || 
      key.includes('akii')
    );
    
    keys.forEach(key => {
      console.log(`- ${key}: ${localStorage.getItem(key)?.substring(0, 20)}...`);
    });
  } catch (e) {
    console.log('Error accessing localStorage:', e);
  }
  
  // Check session
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('Current session:', data?.session ? 'EXISTS' : 'NONE');
    if (error) console.error('Session error:', error);
    
    // Print expiry if exists
    if (data?.session) {
      const expiresAt = new Date(data.session.expires_at * 1000).toISOString();
      console.log(`Session expires: ${expiresAt}`);
      console.log(`Session expired: ${Date.now() > data.session.expires_at * 1000}`);
    }
  } catch (e) {
    console.log('Error checking session:', e);
  }
  
  // Check user
  try {
    const { data, error } = await auth.getUser();
    console.log('Current user:', data?.user ? `ID: ${data.user.id}` : 'NONE');
    if (error) console.error('User error:', error);
  } catch (e) {
    console.log('Error checking user:', e);
  }
  
  console.log('-------------------------------');
}

// Export a function to fix common auth issues
export async function repairAuthState() {
  try {
    // Check if we have a token but no session
    const accessToken = localStorage.getItem('sb-access-token');
    const refreshToken = localStorage.getItem('sb-refresh-token');
    
    if (accessToken && refreshToken) {
      console.log('Found tokens, attempting to restore session...');
      
      // Try to recreate session
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (error) {
        console.error('Error restoring session:', error);
        return false;
      }
      
      console.log('Session restored successfully');
      return true;
    }
    
    console.log('No tokens found to restore');
    return false;
  } catch (e) {
    console.error('Error repairing auth state:', e);
    return false;
  }
} 