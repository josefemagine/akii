/**
 * Auth System Diagnostic and Repair Script
 * 
 * This script can be loaded in the browser console to diagnose and fix auth system issues:
 * 
 * 1. Run in console:
 *    const s = document.createElement('script'); 
 *    s.src = '/scripts/auth-diagnostic.js'; 
 *    document.head.appendChild(s);
 * 
 * 2. Wait for script to load, then run:
 *    diagAuth.diagnose();
 */

(function() {
  // Create namespace for utility functions
  window.diagAuth = {};
  
  // Supabase client accessor
  const getSupabase = () => {
    return window.supabase || null;
  };
  
  // Diagnostic information gathering
  const diagnoseCause = () => {
    // Check if it's a circuit breaker issue
    if (window.circuitBroken === true) {
      return 'Circuit breaker is active - too many redirects were detected';
    }
    
    // Check redirect count
    const redirectCount = sessionStorage.getItem('redirect-count');
    if (redirectCount && parseInt(redirectCount) > 2) {
      return `High redirect count detected (${redirectCount})`;
    }
    
    // Check if we have a session but auth state is incorrect
    const supabase = getSupabase();
    if (!supabase) {
      return 'Supabase client not available in window object';
    }
    
    return 'Running advanced diagnostics...';
  };

  // Main diagnosis function
  diagAuth.diagnose = async function() {
    console.log('🔍 Starting Auth System Diagnosis');
    console.log('--------------------------------');
    
    const initialCause = diagnoseCause();
    console.log(`Initial diagnosis: ${initialCause}`);
    
    // Check Supabase client
    const supabase = getSupabase();
    if (!supabase) {
      console.error('❌ Supabase client not found in window object');
      return;
    }
    
    try {
      // Check current session
      console.log('Checking current session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
      } else if (sessionData?.session) {
        console.log('✅ Active session found:', {
          userId: sessionData.session.user.id,
          email: sessionData.session.user.email,
          expiresAt: new Date(sessionData.session.expires_at * 1000).toISOString()
        });
        
        // Check if session is expired
        const expiresAt = sessionData.session.expires_at * 1000;
        if (expiresAt < Date.now()) {
          console.error('❌ Session is expired!');
        } else {
          console.log(`✅ Session expires in ${Math.round((expiresAt - Date.now()) / 1000 / 60)} minutes`);
        }
        
        // Check profile
        console.log('Checking user profile...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single();
          
        if (profileError) {
          console.error('❌ Profile error:', profileError);
          
          // Test RLS policies
          console.log('Testing RLS policies...');
          const { data: testData, error: testError } = await supabase
            .from('profiles')
            .select('count(*)')
            .limit(1);
            
          if (testError) {
            console.error('❌ RLS policy test failed:', testError);
          } else {
            console.log('✅ RLS policy test succeeded');
          }
          
          // Check ensure_profile_exists function
          console.log('Testing ensure_profile_exists function...');
          try {
            const { data: rpcData, error: rpcError } = await supabase
              .rpc('ensure_profile_exists', { user_id_param: sessionData.session.user.id });
              
            if (rpcError) {
              console.error('❌ RPC function error:', rpcError);
            } else if (rpcData) {
              console.log('✅ RPC function returned data:', rpcData);
            } else {
              console.warn('⚠️ RPC function returned no data');
            }
          } catch (e) {
            console.error('❌ RPC function exception:', e);
          }
        } else {
          console.log('✅ Profile found:', profileData);
        }
      } else {
        console.log('⚠️ No active session found');
      }
      
      // Check localStorage
      console.log('Checking localStorage auth tokens...');
      const authItems = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('auth'))) {
          authItems.push(key);
        }
      }
      
      if (authItems.length > 0) {
        console.log('✅ Auth items in localStorage:', authItems);
      } else {
        console.warn('⚠️ No auth items found in localStorage');
      }
      
      // Check sessionStorage
      console.log('Checking sessionStorage...');
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('redirect') || key.includes('auth'))) {
          console.log(`- ${key}: ${sessionStorage.getItem(key)}`);
        }
      }
      
      // Check circuit breaker
      console.log('Checking circuit breaker status...');
      console.log(`Circuit breaker active: ${window.circuitBroken === true ? 'YES' : 'NO'}`);
      
      // Log current path and referrer
      console.log('Current location:', window.location.pathname);
      console.log('Referrer:', document.referrer);
    } catch (error) {
      console.error('❌ Error during diagnosis:', error);
    }
    
    console.log('--------------------------------');
    console.log('🏁 Diagnosis complete');
  };
  
  // Repair function
  diagAuth.repair = async function() {
    console.log('🔧 Starting Auth System Repair');
    console.log('--------------------------------');
    
    // Reset circuit breaker
    window.circuitBroken = false;
    if (window.circuitBreakerTimeout) {
      window.clearTimeout(window.circuitBreakerTimeout);
    }
    console.log('✅ Circuit breaker reset');
    
    // Reset redirect counts
    sessionStorage.setItem('redirect-count', '0');
    sessionStorage.setItem('last-redirect-time', '0');
    console.log('✅ Redirect counters reset');
    
    // Force refresh session if we have one
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('❌ Session refresh error:', error);
        } else if (data?.session) {
          console.log('✅ Session refreshed successfully');
        } else {
          console.log('ℹ️ No session to refresh');
        }
      } catch (e) {
        console.error('❌ Session refresh exception:', e);
      }
    }
    
    console.log('--------------------------------');
    console.log('🏁 Repair complete - Please refresh the page');
  };
  
  // Force profile creation
  diagAuth.createProfile = async function() {
    console.log('👤 Attempting to create profile');
    console.log('--------------------------------');
    
    const supabase = getSupabase();
    if (!supabase) {
      console.error('❌ Supabase client not found');
      return;
    }
    
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error('❌ Error getting current user:', userError);
        return;
      }
      
      const userId = userData.user.id;
      const email = userData.user.email || '';
      
      console.log(`Creating profile for user ${userId} (${email})`);
      
      // Create profile directly with upsert
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email,
          role: 'user',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (profileError) {
        console.error('❌ Error creating profile:', profileError);
        
        // Try an alternative approach
        console.log('Trying alternative approach...');
        const { error: insertError } = await supabase.rpc('force_create_profile', {
          p_user_id: userId,
          p_email: email
        });
        
        if (insertError) {
          console.error('❌ RPC error:', insertError);
        } else {
          console.log('✅ Profile created via RPC');
        }
      } else {
        console.log('✅ Profile created:', profileData);
      }
    } catch (e) {
      console.error('❌ Error in createProfile:', e);
    }
    
    console.log('--------------------------------');
  };
  
  // Function to force sign in
  diagAuth.forceSignIn = async function(email, password) {
    if (!email || !password) {
      console.error('❌ Email and password required');
      return;
    }
    
    console.log(`🔑 Attempting to sign in as ${email}`);
    console.log('--------------------------------');
    
    const supabase = getSupabase();
    if (!supabase) {
      console.error('❌ Supabase client not found');
      return;
    }
    
    try {
      // Sign out first to clear any existing session
      await supabase.auth.signOut();
      console.log('✅ Previous session cleared');
      
      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('❌ Sign in error:', error);
      } else if (data?.user) {
        console.log('✅ Sign in successful:', data.user.email);
        
        // Create profile if needed
        await diagAuth.createProfile();
      }
    } catch (e) {
      console.error('❌ Error in forceSignIn:', e);
    }
    
    console.log('--------------------------------');
    console.log('🏁 Force sign in complete - Please refresh the page');
  };
  
  // Reset all auth state
  diagAuth.resetAuth = function() {
    console.log('🧹 Resetting all auth state');
    console.log('--------------------------------');
    
    // Clear local storage
    const authKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('supabase') || 
        key.includes('sb-') || 
        key.includes('auth') ||
        key.includes('akii')
      )) {
        authKeys.push(key);
        localStorage.removeItem(key);
      }
    }
    
    console.log(`✅ Cleared ${authKeys.length} items from localStorage`);
    
    // Clear session storage
    sessionStorage.clear();
    console.log('✅ Cleared sessionStorage');
    
    // Reset circuit breaker
    window.circuitBroken = false;
    if (window.circuitBreakerTimeout) {
      window.clearTimeout(window.circuitBreakerTimeout);
    }
    console.log('✅ Circuit breaker reset');
    
    console.log('--------------------------------');
    console.log('🏁 Auth reset complete - Please refresh the page');
  };
  
  console.log('🔧 Auth diagnostic utilities loaded');
  console.log('Available commands:');
  console.log('- diagAuth.diagnose() - Run diagnostics');
  console.log('- diagAuth.repair() - Attempt repairs');
  console.log('- diagAuth.createProfile() - Force profile creation');
  console.log('- diagAuth.forceSignIn(email, password) - Force sign in');
  console.log('- diagAuth.resetAuth() - Reset all auth state');
})(); 