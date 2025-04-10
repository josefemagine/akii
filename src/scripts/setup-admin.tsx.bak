import React from "react";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
interface ADMIN_EMAILProps {}


// Initialize dotenv
dotenv.config();

// Read .env file directly if environment variables aren't loaded
function readEnvFile() {
  try {
    const envFile = readFileSync('.env', 'utf8');
    const envVars = {};
    
    envFile.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        envVars[key] = value;
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Error reading .env file:', error.message);
    return {};
  }
}

// Get environment variables
const envVars = readEnvFile();
const supabaseUrl = process.env.VITE_SUPABASE_URL || envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || envVars.VITE_SUPABASE_SERVICE_KEY || envVars.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL or service key missing!');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY are set in your .env file');
  process.exit(1);
}

// Log connection info 
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Service Key: ${supabaseServiceKey.substring(0, 10)}...`);

// Define the admin user details
const ADMIN_EMAIL = 'josef@holm.com';
const ADMIN_PASSWORD = 'akii-admin-password-2024';

// Create a Supabase client with the service key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdmin() {
  console.log(`Setting up admin user: ${ADMIN_EMAIL}`);
  
  try {
    // First, check if we can connect to Supabase
    const { data: healthData, error: healthError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (healthError) {
      console.log('Failed to connect to database. Checking if auth API works...');
      
      // Try auth API since data API might have issues
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw new Error(`Connection failed: ${authError.message}`);
      }
    }
    
    console.log('Connection to Supabase successful.');
    
    // Check if user exists in auth
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      throw new Error(`Failed to list users: ${usersError.message}`);
    }
    
    let userId = null;
    const existingUser = users.users.find(user => user.email === ADMIN_EMAIL);
    
    if (existingUser) {
      console.log(`User ${ADMIN_EMAIL} already exists in auth.users`);
      userId = existingUser.id;
    } else {
      console.log(`Creating new user: ${ADMIN_EMAIL}`);
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true
      });
      
      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`);
      }
      
      userId = newUser.user.id;
      console.log(`User created with ID: ${userId}`);
    }
    
    // Now make sure they have an admin profile
    // First check if the profiles table exists
    let tableExists = true;
    
    try {
      const { error: tableError } = await supabase.from('profiles').select('id').limit(1);
      if (tableError && tableError.code === '42P01') { // Relation not found
        tableExists = false;
      }
    } catch (error) {
      tableExists = false;
      console.error('Error checking profiles table:', error.message);
    }
    
    // Create schema for profiles table if it doesn't exist
    if (!tableExists) {
      console.log('Profiles table does not exist. Creating schema...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT NOT NULL UNIQUE,
          first_name TEXT,
          last_name TEXT,
          role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'team_member')),
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.error('Failed to create profiles table:', createError.message);
        console.log('Will try direct insert anyway...');
      } else {
        console.log('Profiles table created successfully.');
      }
    }
    
    // Insert or update the profile
    console.log(`Ensuring ${ADMIN_EMAIL} has admin role...`);
    
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: ADMIN_EMAIL,
        role: 'admin',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (upsertError) {
      console.error('Error updating profile:', upsertError.message);
      console.log('Trying alternate method...');
      
      // Try direct SQL if RLS or other issues prevented the update
      const updateSQL = `
        INSERT INTO profiles (id, email, role, status, created_at, updated_at)
        VALUES ('${userId}', '${ADMIN_EMAIL}', 'admin', 'active', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          role = 'admin',
          status = 'active',
          updated_at = NOW();
      `;
      
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql: updateSQL });
      
      if (sqlError) {
        throw new Error(`Failed to update profile with SQL: ${sqlError.message}`);
      }
      
      console.log('Admin profile set using direct SQL.');
    } else {
      console.log('Admin profile updated successfully.');
    }
    
    console.log('---------------------------------------');
    console.log('🎉 Admin user setup complete!');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('---------------------------------------');
    
  } catch (error) {
    console.error('❌ Admin setup failed:', error.message);
    process.exit(1);
  }
}

setupAdmin(); 