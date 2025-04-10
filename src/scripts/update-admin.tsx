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

// Create a Supabase client with the service key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function directlyUpdateAdminRole() {
  try {
    console.log(`Updating ${ADMIN_EMAIL} to admin role...`);
    
    // Find the user ID first
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      throw new Error(`Failed to list users: ${userError.message}`);
    }
    
    const user = userData.users.find(u => u.email === ADMIN_EMAIL);
    
    if (!user) {
      throw new Error(`User ${ADMIN_EMAIL} not found in auth.users`);
    }
    
    console.log(`Found user ${ADMIN_EMAIL} with ID: ${user.id}`);
    
    // Check if the profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id);
      
    if (profileError) {
      console.log(`Error checking profile: ${profileError.message}`);
      
      console.log('Creating profiles table...');
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY,
          email TEXT,
          role TEXT,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      
      // Execute raw SQL since we can't directly create tables with the JS SDK
      const headers = {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      };
      
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query: createTableQuery
          })
        });
        
        if (!response.ok) {
          console.log('Could not create table with SQL. Continuing to direct insert...');
        } else {
          console.log('Table created successfully');
        }
      } catch (sqlError) {
        console.log('Failed to execute SQL directly:', sqlError.message);
      }
    }
    
    // Insert/update the profile with admin role
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: ADMIN_EMAIL,
        role: 'admin',
        status: 'active',
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'id'
      });
    
    if (upsertError) {
      console.log(`Error upserting profile: ${upsertError.message}`);
      console.log('Trying with REST API directly...');
      
      // Try direct REST API if SDK has issues
      const headers = {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      };
      
      const profileData = {
        id: user.id,
        email: ADMIN_EMAIL,
        role: 'admin',
        status: 'active',
        updated_at: new Date().toISOString()
      };
      
      const response = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
        method: 'POST',
        headers,
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update profile via REST API: ${response.statusText}`);
      }
      
      console.log('Profile updated via direct REST API');
    } else {
      console.log('Profile updated successfully via Supabase SDK');
    }
    
    console.log('---------------------------------------');
    console.log(`✅ ${ADMIN_EMAIL} has been set as admin!`);
    console.log('You can now login with this account.');
    console.log('---------------------------------------');
    
  } catch (error) {
    console.error('❌ Failed to update admin role:', error.message);
    process.exit(1);
  }
}

directlyUpdateAdminRole(); 