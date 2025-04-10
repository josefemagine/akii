/**
 * Fix All Script
 * 
 * This script runs all the fixers in sequence to automatically repair common errors
 * in the codebase that are preventing successful builds.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure dependencies are installed
function ensureDependencies() {
  console.log('Ensuring required dependencies are installed...');
  try {
    // Check if glob is installed by trying to import it
    import('glob');
    console.log('✅ Dependencies already installed');
  } catch (e) {
    console.log('Installing required dependencies...');
    execSync('npm install glob --save-dev', { stdio: 'inherit' });
    console.log('✅ Dependencies installed');
  }
}

// Run a script and return a promise
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`\n=============================================`);
      console.log(`Running: ${path.basename(scriptPath)}`);
      console.log(`=============================================\n`);
      
      execSync(`node ${scriptPath}`, { stdio: 'inherit' });
      resolve();
    } catch (error) {
      console.error(`Error running ${scriptPath}:`, error.message);
      reject(error);
    }
  });
}

// Main execution
async function main() {
  console.log('🚀 Starting fix-all script\n');
  const startTime = Date.now();
  
  try {
    // Ensure dependencies
    ensureDependencies();
    
    // Define scripts to run
    const scripts = [
      path.join(__dirname, 'fix-interface-names.js'),
      path.join(__dirname, 'fix-import-extensions.js'),
      path.join(__dirname, 'fix-syntax-errors.js')
    ];
    
    // Check if the scripts exist
    for (const script of scripts) {
      if (!fs.existsSync(script)) {
        console.error(`Script not found: ${script}`);
        process.exit(1);
      }
    }
    
    // Run each script in sequence
    for (const script of scripts) {
      await runScript(script);
    }
    
    // Run a build to check if the fixes worked
    console.log('\n=============================================');
    console.log('Running build to check if fixes worked...');
    console.log('=============================================\n');
    
    try {
      execSync('npm run build:nocheck', { stdio: 'inherit' });
      console.log('\n✅ Build successful!');
    } catch (buildError) {
      console.log('\n⚠️ Build still has some issues. More manual fixes may be needed.');
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n✨ All fixes completed in ${duration}s`);
    console.log('\nTo restore backup files if needed, run:');
    console.log('  find src -name "*.bak" -exec bash -c \'mv "$0" "${0%.bak}"\' {} \\;');
  } catch (error) {
    console.error('💥 Fix-all script failed:', error);
    process.exit(1);
  }
}

main(); 