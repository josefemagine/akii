/**
 * Auth System Test Script
 * 
 * This script can be run in the browser console to verify the authentication system.
 * It tests various authentication functions and checks for error conditions.
 */

async function testAuthSystem() {
  console.log('🧪 STARTING AUTH SYSTEM TEST');
  console.log('--------------------------');
  
  // Import Supabase client
  const supabase = window.supabase;
  
  if (!supabase) {
    console.error('❌ Supabase client not found in window object');
    return;
  }
  
  console.log('📋 Test Plan:');
  console.log('1. Get current session');
  console.log('2. Get current user');
  console.log('3. Sign out (if logged in)');
  console.log('4. Sign in with test credentials');
  console.log('5. Verify profile exists');
  console.log('6. Test session refresh');
  console.log('7. Sign out');
  console.log('--------------------------');
  
  try {
    // Step 1: Get current session
    console.log('🔍 Step 1: Getting current session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error getting session:', sessionError);
    } else {
      console.log('✅ Session data retrieved:', sessionData);
    }
    
    // Step 2: Get current user
    console.log('🔍 Step 2: Getting current user...');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error getting user:', userError);
    } else {
      console.log('✅ User data retrieved:', userData);
    }
    
    // Step 3: Sign out if logged in
    if (sessionData?.session) {
      console.log('🔍 Step 3: Signing out current user...');
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error('❌ Error signing out:', signOutError);
      } else {
        console.log('✅ User signed out successfully');
      }
    } else {
      console.log('🔍 Step 3: No active session, skipping sign out');
    }
    
    // Step 4: Sign in with test credentials
    console.log('🔍 Step 4: Signing in with test credentials...');
    console.log('   (Using admin@example.com / Admin123!)');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'Admin123!'
    });
    
    if (signInError) {
      console.error('❌ Error signing in:', signInError);
      console.log('   This is expected if you haven\'t run reset-supabase.sh to create the test user');
    } else {
      console.log('✅ Sign in successful:', signInData.user.email);
      
      // Step 5: Verify profile exists
      console.log('🔍 Step 5: Verifying profile exists...');
      
      try {
        // First try the RPC function
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('ensure_profile_exists', { user_id_param: signInData.user.id });
        
        if (rpcError) {
          console.warn('⚠️ RPC ensure_profile_exists failed:', rpcError);
          console.log('   Falling back to direct profile query...');
          
          // Try direct profile query as fallback
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', signInData.user.id)
            .single();
          
          if (profileError) {
            console.error('❌ Error getting profile:', profileError);
          } else {
            console.log('✅ Profile exists:', profileData);
          }
        } else {
          console.log('✅ Profile ensured via RPC:', rpcData);
        }
      } catch (err) {
        console.error('❌ Unexpected error checking profile:', err);
      }
      
      // Step 6: Test session refresh
      console.log('🔍 Step 6: Testing session refresh...');
      
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('❌ Error refreshing session:', refreshError);
        } else {
          console.log('✅ Session refreshed successfully');
        }
      } catch (err) {
        console.error('❌ Unexpected error refreshing session:', err);
      }
      
      // Step 7: Sign out
      console.log('🔍 Step 7: Signing out...');
      
      try {
        const { error: finalSignOutError } = await supabase.auth.signOut();
        
        if (finalSignOutError) {
          console.error('❌ Error signing out:', finalSignOutError);
        } else {
          console.log('✅ User signed out successfully');
        }
      } catch (err) {
        console.error('❌ Unexpected error signing out:', err);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error during tests:', error);
  }
  
  console.log('--------------------------');
  console.log('🏁 AUTH SYSTEM TEST COMPLETE');
}

// Execute the test
testAuthSystem().then(() => {
  console.log('Tests execution completed');
}).catch(err => {
  console.error('Error running tests:', err);
});

// Export the function for manual running
window.testAuthSystem = testAuthSystem; 