// Debug Supabase connection
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load .env file
let supabaseUrl = '';
let supabaseKey = '';

try {
  // Try to read from .env.local first (higher priority)
  if (fs.existsSync('.env.local')) {
    const envLocalContent = fs.readFileSync('.env.local', 'utf8');
    const urlMatch = envLocalContent.match(/VITE_SUPABASE_URL=(.+)/);
    const keyMatch = envLocalContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
    
    if (urlMatch && urlMatch[1]) supabaseUrl = urlMatch[1].trim();
    if (keyMatch && keyMatch[1]) supabaseKey = keyMatch[1].trim();
    
    console.log('Found credentials in .env.local');
  }
  
  // If not found, try .env
  if ((!supabaseUrl || !supabaseKey) && fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
    
    if (urlMatch && urlMatch[1] && !supabaseUrl) supabaseUrl = urlMatch[1].trim();
    if (keyMatch && keyMatch[1] && !supabaseKey) supabaseKey = keyMatch[1].trim();
    
    console.log('Found credentials in .env');
  }
  
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key available:', !!supabaseKey);
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials!');
    process.exit(1);
  }
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test the connection
  console.log('Testing Supabase connection...');
  
  supabase
    .from('profiles')
    .select('count')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error('Supabase Error:', error.message);
        process.exit(1);
      }
      
      console.log('Success! Connected to Supabase.');
      console.log('Data:', data);
      process.exit(0);
    })
    .catch(err => {
      console.error('Error connecting to Supabase:', err.message);
      process.exit(1);
    });
  
} catch (error) {
  console.error('Error in debug script:', error.message);
  process.exit(1);
} 