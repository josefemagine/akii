#!/usr/bin/env node

/**
 * This script specifically fixes imports in main.tsx
 * to resolve 404 errors for missing .js files
 */

const fs = require('fs');
const path = require('path');

// Configuration
const MAIN_TSX_PATH = path.join(__dirname, '../src/main.tsx');

console.log("Starting fix for main.tsx imports...");

// Fix main.tsx imports
function fixMainImports() {
  try {
    // Read the main.tsx file
    let content = fs.readFileSync(MAIN_TSX_PATH, 'utf8');
    
    // Create backup of the original file
    const backupPath = MAIN_TSX_PATH + '.bak';
    fs.writeFileSync(backupPath, content);
    console.log(`Created backup at ${backupPath}`);
    
    // Replace import paths to use .tsx or .ts extensions
    const replacements = [
      { from: './lib/react-singleton"', to: './lib/react-singleton.tsx"' },
      { from: './lib/react-router-singleton"', to: './lib/react-router-singleton.tsx"' },
      { from: '@/lib/supabase-singleton', to: '@/lib/supabase-singleton.tsx' },
      { from: './lib/react-singleton"', to: './lib/react-singleton.tsx"' },
      { from: './lib/patches/tempo-devtools-react-patch', to: './lib/patches/tempo-devtools-react-patch.tsx' },
      { from: './lib/module-alias', to: './lib/module-alias.tsx' },
      { from: './lib/vite-module-patch', to: './lib/vite-module-patch.tsx' },
      { from: './lib/router-patch"', to: './lib/router-patch.tsx"' }
    ];
    
    // Apply all replacements
    let modified = false;
    for (const { from, to } of replacements) {
      if (content.includes(from)) {
        content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
        modified = true;
        console.log(`Replaced: ${from} -> ${to}`);
      }
    }
    
    // Write the modified content if changes were made
    if (modified) {
      fs.writeFileSync(MAIN_TSX_PATH, content);
      console.log(`Updated imports in ${MAIN_TSX_PATH}`);
      return true;
    } else {
      console.log(`No changes needed in ${MAIN_TSX_PATH}`);
      return false;
    }
  } catch (error) {
    console.error(`Error fixing imports in main.tsx: ${error.message}`);
    return false;
  }
}

// Main execution
fixMainImports();
console.log("Fix completed for main.tsx imports!");