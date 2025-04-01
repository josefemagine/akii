import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get current file path for relative paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read SQL from migration file
const sqlFilePath = './supabase/migrations/20240702000001_add_company_column.sql';
const sqlContent = fs.readFileSync(resolve(__dirname, sqlFilePath), 'utf8');

console.log(`\n=== SQL Migration Content from ${sqlFilePath} ===\n`);
console.log(sqlContent);
console.log('\n=== End of SQL Migration Content ===\n');

console.log('Instructions:');
console.log('1. Copy this SQL and run it in the Supabase SQL Editor at https://app.supabase.com');
console.log(`2. Go to your project > SQL Editor > New Query`);
console.log('3. Paste the SQL and click "Run"');
console.log('\nThis will add the company column to your profiles table and update the trigger function.\n'); 