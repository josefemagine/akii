// Script to check and set admin status for a user
// Usage: node check-and-set-admin.mjs

// Import required packages
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Set up proper file paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// User ID to check and set as admin
const USER_ID = 'b574f273-e0e1-4cb8-8c98-f5a7569234c8';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Checking and setting admin status for user ID:', USER_ID);
  
  try {
    // Step 1: Check if user exists in auth.users
    console.log('\n1. Checking if user exists in auth.users...');
    
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(USER_ID);
    
    if (authError) {
      console.error('Error getting auth user:', authError);
      return;
    }
    
    if (!authUser?.user) {
      console.error('User not found in auth.users');
      return;
    }
    
    console.log('User found in auth.users:');
    console.log('  Email:', authUser.user.email);
    console.log('  Created at:', new Date(authUser.user.created_at).toLocaleString());
    
    // Step 2: Check if user has a profile
    console.log('\n2. Checking if user has a profile...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', USER_ID)
      .single();
    
    if (profileError && !profileError.message.includes('No rows found')) {
      console.error('Error checking profile:', profileError);
      return;
    }
    
    if (profile) {
      console.log('User has an existing profile:');
      console.log('  Role:', profile.role);
      console.log('  Status:', profile.status);
      console.log('  Email:', profile.email);
      console.log('  Updated at:', profile.updated_at);
      
      if (profile.role === 'admin') {
        console.log('\nUser is already an admin! No changes needed.');
        return;
      }
    } else {
      console.log('User does not have a profile. Will create one.');
    }
    
    // Step 3: Set user as admin
    console.log('\n3. Setting user as admin...');
    
    const updateData = {
      id: USER_ID,
      email: authUser.user.email,
      role: 'admin',
      status: 'active',
      updated_at: new Date().toISOString()
    };
    
    if (!profile) {
      // Add creation fields if creating a new profile
      updateData.created_at = new Date().toISOString();
    }
    
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .upsert(updateData)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error setting user as admin:', updateError);
      return;
    }
    
    console.log('Successfully set user as admin!');
    console.log('Updated profile:');
    console.log('  Role:', updatedProfile.role);
    console.log('  Status:', updatedProfile.status);
    console.log('  Email:', updatedProfile.email);
    console.log('  Updated at:', updatedProfile.updated_at);
    
    // Step 4: Verify admin status
    console.log('\n4. Verifying admin status...');
    
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', USER_ID)
      .single();
    
    if (verifyError) {
      console.error('Error verifying admin status:', verifyError);
      return;
    }
    
    if (verifyProfile.role === 'admin') {
      console.log('✅ VERIFICATION SUCCESSFUL: User is now admin!');
    } else {
      console.error('❌ VERIFICATION FAILED: User has role', verifyProfile.role, 'instead of admin');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
main(); 