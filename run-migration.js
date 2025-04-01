import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Initialize dotenv
dotenv.config();

// Get current file path for relative paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get credentials from environment
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Read SQL from migration file
const sqlContent = fs.readFileSync(resolve(__dirname, './supabase/migrations/20240702000001_add_company_column.sql'), 'utf8');

async function runMigration() {
  try {
    console.log('Running migration: add_company_column');
    console.log(`Using Supabase URL: ${SUPABASE_URL}`);
    
    // Try different RPC functions that might exist
    let success = false;
    
    // Try pgexecute
    try {
      console.log('Trying pgexecute...');
      const { data, error } = await supabase.rpc('pgexecute', { 
        query: sqlContent 
      });
      
      if (!error) {
        console.log('Migration completed successfully using pgexecute!');
        console.log('Results:', data);
        success = true;
        return;
      }
      console.log('pgexecute error:', error.message);
    } catch (err) {
      console.log('pgexecute failed:', err.message);
    }
    
    // Try exec_sql
    try {
      console.log('Trying exec_sql...');
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: sqlContent 
      });
      
      if (!error) {
        console.log('Migration completed successfully using exec_sql!');
        console.log('Results:', data);
        success = true;
        return;
      }
      console.log('exec_sql error:', error.message);
    } catch (err) {
      console.log('exec_sql failed:', err.message);
    }
    
    // Try execute_sql
    try {
      console.log('Trying execute_sql...');
      const { data, error } = await supabase.rpc('execute_sql', { 
        query: sqlContent 
      });
      
      if (!error) {
        console.log('Migration completed successfully using execute_sql!');
        console.log('Results:', data);
        success = true;
        return;
      }
      console.log('execute_sql error:', error.message);
    } catch (err) {
      console.log('execute_sql failed:', err.message);
    }
    
    // If none of the RPC functions worked, try a direct query (which might only work for simple queries)
    try {
      console.log('Trying direct SQL execution...');
      // We need to split the SQL file into separate statements
      const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of statements) {
        const { data, error } = await supabase.from('profiles').select('count(*)').limit(1);
        if (error) {
          console.log('Error checking profiles table:', error.message);
        }
        
        // Execute the statement (this might only work for some types of SQL)
        const { error: sqlError } = await supabase.from('profiles').alter(statement.trim());
        if (sqlError) {
          console.log(`Failed to execute statement: ${sqlError.message}`);
        } else {
          console.log('Statement executed successfully');
          success = true;
        }
      }
    } catch (err) {
      console.log('Direct execution failed:', err.message);
    }
    
    if (!success) {
      console.error('All migration methods failed. Please run this SQL manually.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration(); 