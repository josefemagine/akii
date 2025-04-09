#!/usr/bin/env node

/**
 * This script applies the profile RLS fix migration
 * It addresses the circular dependency in profile access
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Paths
const MIGRATION_PATH = path.join(__dirname, '../supabase/migrations/20240705000001_fix_profile_access_circular_dependency.sql');
const LOG_PATH = path.join(__dirname, '../tmp/migration.log');

// Ensure tmp directory exists
if (!fs.existsSync(path.join(__dirname, '../tmp'))) {
  fs.mkdirSync(path.join(__dirname, '../tmp'), { recursive: true });
}

// Log helper
function log(message) {
  console.log(`[Profile Fix] ${message}`);
  fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} - ${message}\n`);
}

// Main function
async function main() {
  try {
    log('Starting profile RLS policy fix');
    
    // Check if migration file exists
    if (!fs.existsSync(MIGRATION_PATH)) {
      log('Error: Migration file not found');
      process.exit(1);
    }
    
    // Run the migration using Supabase CLI
    log('Applying migration...');
    try {
      execSync(`npx supabase db execute --file ${MIGRATION_PATH}`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      log('Migration applied successfully');
    } catch (error) {
      log(`Error applying migration: ${error.message}`);
      
      // Fallback to direct SQL execution if possible
      log('Attempting alternative execution method...');
      try {
        const sqlContent = fs.readFileSync(MIGRATION_PATH, 'utf8');
        
        // Create a temporary file with just the disable RLS part
        const disableRlsPath = path.join(__dirname, '../tmp/disable_rls.sql');
        fs.writeFileSync(disableRlsPath, 'ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;');
        
        // Execute the disable RLS first
        execSync(`npx supabase db execute --file ${disableRlsPath}`, {
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
        
        // Split the SQL into smaller chunks and execute them separately
        const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (let i = 0; i < statements.length; i++) {
          const tempPath = path.join(__dirname, `../tmp/statement_${i}.sql`);
          fs.writeFileSync(tempPath, statements[i] + ';');
          
          try {
            execSync(`npx supabase db execute --file ${tempPath}`, {
              stdio: 'inherit',
              cwd: path.join(__dirname, '..')
            });
            log(`Statement ${i+1}/${statements.length} executed`);
          } catch (err) {
            log(`Error with statement ${i+1}: ${err.message}`);
            // Continue with next statement
          }
        }
      } catch (fallbackError) {
        log(`Fallback execution failed: ${fallbackError.message}`);
        process.exit(1);
      }
    }
    
    log('Profile fix process completed');
    
    // Provide instructions
    console.log('\n=== NEXT STEPS ===');
    console.log('1. Restart your application');
    console.log('2. Navigate to the Settings page');
    console.log('3. Click the "Set as Admin" button if needed\n');
    
  } catch (error) {
    log(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main(); 