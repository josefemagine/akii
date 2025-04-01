/**
 * Import update script
 * This script scans the codebase for old imports and suggests replacements
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to look for
const oldImportPatterns = [
  /import.*from.*['"]@\/lib\/supabase-core['"]/,
  /import.*from.*['"]@\/lib\/auth-core['"]/,
  /import.*from.*['"]@\/lib\/supabase-admin['"]/,
  /import.*from.*['"]@\/lib\/supabase['"]/
];

// Scan the codebase
const files = glob.sync('src/**/*.{ts,tsx}', { ignore: ['src/lib/supabase/**/*'] });

let foundIssues = false;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  oldImportPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      console.log(`Found old import in ${file}`);
      foundIssues = true;
      
      // Extract the actual import
      const match = content.match(pattern);
      if (match) {
        console.log(`  ${match[0]}`);
        console.log('  Should be replaced with:');
        console.log(`  import { ... } from '@/lib/supabase';`);
      }
      
      console.log('');
    }
  });
});

if (!foundIssues) {
  console.log('No old imports found! 🎉');
} 