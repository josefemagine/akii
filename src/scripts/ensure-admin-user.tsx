import React from "react";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
interface ADMIN_EMAILProps {}


// Initialize dotenv
dotenv.config();

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL or service key missing!');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY are set in your .env file');
  process.exit(1);
}

// Define the admin user details - change these values as needed
const ADMIN_EMAIL = 'josef@holm.com';
const ADMIN_PASSWORD = 'akii-admin-password-2024';
const ADMIN_FIRST_NAME = 'Josef';
const ADMIN_LAST_NAME = 'Holm';

// Create a Supabase client with the service key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ensureAdminUser() {
  console.log('Starting admin user setup...');

  try {
    // First check if the user already exists
    const { data: existingUsers, error: userError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (existingUsers) {
      console.log(`User ${ADMIN_EMAIL} already exists with role: ${existingUsers.role}`);
      
      // If user exists but not as admin, make them admin
      if (existingUsers.role !== 'admin') {
        console.log(`Updating ${ADMIN_EMAIL} to admin role...`);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin', status: 'active', updated_at: new Date().toISOString() })
          .eq('id', existingUsers.id);
          
        if (updateError) {
          throw new Error(`Failed to update user role: ${updateError.message}`);
        }
        
        console.log(`Successfully updated ${ADMIN_EMAIL} to admin role!`);
      }
      
      return;
    }

    // User doesn't exist, create a new user
    console.log(`Creating new admin user: ${ADMIN_EMAIL}...`);
    
    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true
    });
    
    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }
    
    console.log(`Auth user created with ID: ${authData.user.id}`);
    
    // Then, ensure they have a profile with admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: ADMIN_EMAIL,
        first_name: ADMIN_FIRST_NAME,
        last_name: ADMIN_LAST_NAME,
        role: 'admin',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }
    
    console.log(`Admin user ${ADMIN_EMAIL} created successfully!`);
    console.log(`You can now log in with email: ${ADMIN_EMAIL} and password: ${ADMIN_PASSWORD}`);
    
  } catch (error) {
    console.error('Error ensuring admin user:', error.message);
    process.exit(1);
  }
}

// Alternate approach using SQL function
async function forceUserAsAdmin() {
  console.log(`Using SQL function to force ${ADMIN_EMAIL} as admin...`);
  
  try {
    // Check if the user exists in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      throw new Error(`Failed to list users: ${authError.message}`);
    }
    
    const userExists = authUser.users.some(user => user.email === ADMIN_EMAIL);
    
    if (!userExists) {
      console.log(`User ${ADMIN_EMAIL} doesn't exist in auth.users. Creating...`);
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true
      });
      
      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`);
      }
      
      console.log(`User created: ${newUser.user.id}`);
    }
    
    // Call the SQL function to force the user as admin
    const { data, error } = await supabase.rpc('force_user_as_admin', {
      email_param: ADMIN_EMAIL
    });
    
    if (error) {
      throw new Error(`Failed to execute force_user_as_admin: ${error.message}`);
    }
    
    console.log(`Successfully set ${ADMIN_EMAIL} as admin via SQL function!`);
    console.log(`You can now log in with email: ${ADMIN_EMAIL} and password: ${ADMIN_PASSWORD}`);
    
  } catch (error) {
    console.error('Error forcing admin user:', error.message);
    process.exit(1);
  }
}

// Run both methods for maximum reliability
async function run() {
  try {
    await ensureAdminUser();
    await forceUserAsAdmin();
    console.log('Admin user setup complete!');
  } catch (error) {
    console.error('Setup failed:', error.message);
  }
}

run(); 