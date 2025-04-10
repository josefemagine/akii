/**
 * Emergency Admin Helper
 * 
 * This script can be run in the browser console to fix admin authentication issues
 * Usage: Copy and paste the entire contents of this file into the browser console
 * Then run: fixAdminStatus()
 */

import { supabase } from '@/lib/supabase.tsx';

// Admin user ID to check
const TARGET_ADMIN_ID = 'b574f273-e0e1-4cb8-8c98-f5a7569234c8';

/**
 * Fix admin status by:
 * 1. Setting localStorage flags
 * 2. Creating a session storage profile cache
 * 3. Updating the database profile
 * 4. Setting auth.users metadata if possible
 */
export async function fixAdminStatus() {
  console.log('🛠️ Running admin status fix utility...');
  
  try {
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    
    if (!user) {
      console.error('❌ No user logged in. Please log in first.');
      return false;
    }

    console.log('👤 Current user:', user.id, user.email);
    
    // Check if this is the target admin user
    if (user.id === TARGET_ADMIN_ID) {
      console.log('✅ User ID matches target admin ID');
      
      // Step 1: Set localStorage flags
      localStorage.setItem('user_is_admin', 'true');
      localStorage.setItem('admin_user_id', TARGET_ADMIN_ID);
      localStorage.setItem('akii-is-admin', 'true');
      console.log('✅ Set localStorage admin flags');
      
      // Step 2: Create a session storage profile cache
      const adminProfile = {
        id: TARGET_ADMIN_ID,
        email: user.email,
        role: 'admin',
        is_admin: true,
        status: 'active',
        updated_at: new Date().toISOString()
      };
      
      sessionStorage.setItem(`profile-${TARGET_ADMIN_ID}`, JSON.stringify({
        profile: adminProfile,
        timestamp: Date.now()
      }));
      console.log('✅ Created session storage profile cache');
      
      // Step 3: Update the profile in the database
      try {
        console.log('📝 Updating profile in database...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: TARGET_ADMIN_ID,
            email: user.email,
            role: 'admin',
            is_admin: true,
            status: 'active',
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })
          .select();
          
        if (profileError) {
          console.error('❌ Error updating profile:', profileError);
        } else {
          console.log('✅ Successfully updated profile in database:', profileData);
        }
      } catch (err) {
        console.error('❌ Exception during profile update:', err);
      }
      
      // Step 4: Try to update auth.users metadata through RPC
      try {
        console.log('🔐 Attempting to update auth.users metadata...');
        // This uses a PostgreSQL function that must be created in your database
        const { data, error } = await supabase.rpc('set_user_admin_status', {
          target_user_id: TARGET_ADMIN_ID,
          admin_status: true
        });
        
        if (error) {
          console.error('❌ RPC error:', error.message);
          console.log('This likely means the PostgreSQL function is not available.');
          console.log('A database administrator needs to run the following SQL:');
          console.log(`
CREATE OR REPLACE FUNCTION public.set_user_admin_status(target_user_id uuid, admin_status boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update auth.users metadata
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('is_admin', admin_status)
  WHERE id = target_user_id;
  
  -- Update public.profiles table as well
  UPDATE public.profiles
  SET is_admin = admin_status,
      role = CASE WHEN admin_status THEN 'admin' ELSE role END
  WHERE id = target_user_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;
          `);
        } else {
          console.log('✅ Successfully updated auth.users metadata');
        }
      } catch (err) {
        console.error('❌ Exception during auth.users update:', err);
      }
      
      // Step 5: Try through Edge Functions
      try {
        console.log('🔄 Attempting to update through Edge Function...');
        const { data, error } = await supabase.functions.invoke('set-admin-status', {
          body: {
            userId: TARGET_ADMIN_ID,
            isAdmin: true
          }
        });
        
        if (error) {
          console.error('❌ Edge function error:', error.message);
        } else {
          console.log('✅ Set admin status via edge function:', data);
        }
      } catch (err) {
        console.error('❌ Edge function call failed:', err);
      }
      
      console.log('✅ Admin status fix complete!');
      console.log('🔄 Please refresh the page to apply changes.');
      
      return true;
    } else {
      console.error('❌ Current user is not the target admin user');
      console.log('Current user ID:', user.id);
      console.log('Target admin ID:', TARGET_ADMIN_ID);
      return false;
    }
  } catch (error) {
    console.error('❌ Error in admin status fix:', error);
    return false;
  }
}

/**
 * Check current admin status
 */
export async function checkAdminStatus() {
  console.log('🔍 Checking admin status...');
  
  try {
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    
    if (!user) {
      console.error('❌ No user logged in. Please log in first.');
      return false;
    }

    console.log('👤 Current user:', user.id, user.email);
    console.log('📋 User metadata:', user.app_metadata);
    
    // Check if the user is admin in the auth metadata
    if (user.app_metadata?.is_admin === true) {
      console.log('✅ User is admin according to auth metadata');
    } else {
      console.log('❌ User is NOT admin according to auth metadata');
    }
    
    // Get profile from database
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
    } else {
      console.log('📋 Profile data:', profileData);
      
      if (profileData?.is_admin === true) {
        console.log('✅ User is admin according to profiles.is_admin');
      } else {
        console.log('❌ User is NOT admin according to profiles.is_admin');
      }
      
      if (profileData?.role === 'admin') {
        console.log('✅ User is admin according to profiles.role');
      } else {
        console.log('❌ User is NOT admin according to profiles.role');
      }
    }
    
    // Check localStorage flags
    console.log('🔑 localStorage flags:');
    console.log('- user_is_admin:', localStorage.getItem('user_is_admin'));
    console.log('- admin_user_id:', localStorage.getItem('admin_user_id'));
    console.log('- akii-is-admin:', localStorage.getItem('akii-is-admin'));
    
    // Check session storage cache
    try {
      const cacheKey = `profile-${user.id}`;
      const cachedProfile = sessionStorage.getItem(cacheKey);
      
      if (cachedProfile) {
        console.log('🗂️ Cached profile:', JSON.parse(cachedProfile));
      } else {
        console.log('❌ No cached profile found');
      }
    } catch (err) {
      console.error('❌ Error checking cache:', err);
    }
    
    // Check if this is the target admin user
    if (user.id === TARGET_ADMIN_ID) {
      console.log('✅ User ID matches target admin ID');
    } else {
      console.log('❌ Current user is not the target admin user');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    return false;
  }
}

/**
 * Create SQL function code to update auth.users table
 * This code needs to be run by a database administrator
 */
export function getAdminSQLCode() {
  console.log(`
-- Function to set admin status for a user (run as SUPERUSER)
CREATE OR REPLACE FUNCTION public.set_user_admin_status(target_user_id uuid, admin_status boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update auth.users metadata
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('is_admin', admin_status)
  WHERE id = target_user_id;
  
  -- Update public.profiles table as well
  UPDATE public.profiles
  SET is_admin = admin_status,
      role = CASE WHEN admin_status THEN 'admin' ELSE role END
  WHERE id = target_user_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Set security for the function (required)
REVOKE ALL ON FUNCTION public.set_user_admin_status FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_user_admin_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_admin_status TO service_role;
  `);
  
  return true;
}

// Make functions available globally
if (typeof window !== 'undefined') {
  (window as any).fixAdminStatus = fixAdminStatus;
  (window as any).checkAdminStatus = checkAdminStatus;
  (window as any).getAdminSQLCode = getAdminSQLCode;
  console.log('🛠️ Admin helper functions loaded!');
  console.log('Run checkAdminStatus() to check current admin status');
  console.log('Run fixAdminStatus() to fix admin status issues');
  console.log('Run getAdminSQLCode() to get SQL code for database administrator');
} 