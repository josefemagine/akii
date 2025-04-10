#!/usr/bin/env node

/**
 * This script fixes missing .js file errors by updating imports
 * to use .ts or .tsx extensions explicitly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const LOG_PATH = path.join(__dirname, '../tmp/fixed-imports.log');

// Ensure tmp directory exists
if (!fs.existsSync(path.join(__dirname, '../tmp'))) {
  fs.mkdirSync(path.join(__dirname, '../tmp'), { recursive: true });
}

// Log helper
function log(message) {
  console.log(`[Import Fix] ${message}`);
  fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} - ${message}\n`);
}

// Find files that import without extensions
function findFilesToFix() {
  log('Finding files with potential import issues...');
  
  const filePaths = [];
  
  // Hard-coded list of important files to check first
  const criticalFiles = [
    path.join(SRC_DIR, 'main.tsx'),
    path.join(SRC_DIR, 'App.tsx')
  ];
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      filePaths.push(file);
    }
  });
  
  // Common imports with missing extensions
  const problematicImports = [
    'react-singleton',
    'react-router-singleton',
    'supabase-singleton',
    'module-alias',
    'vite-module-patch',
    'router-patch',
    'tempo-devtools-react-patch',
    'direct-db-access',
    'supabase'
  ];
  
  try {
    // Find files with these imports using grep
    problematicImports.forEach(importName => {
      try {
        const grepResults = execSync(`grep -l --include="*.tsx" --include="*.ts" -r "from ['\\\"].*${importName}['\\\"]" ${SRC_DIR}`, { encoding: 'utf8' });
        
        if (grepResults.trim()) {
          grepResults.split('\n').forEach(file => {
            if (file.trim() && !filePaths.includes(file.trim())) {
              filePaths.push(file.trim());
            }
          });
        }
      } catch (error) {
        // grep returns non-zero exit code if no matches found
        if (error.status !== 1) {
          log(`Error searching for ${importName}: ${error.message}`);
        }
      }
    });
    
    log(`Found ${filePaths.length} files to check for import issues`);
    return filePaths;
  } catch (error) {
    log(`Error finding files to fix: ${error.message}`);
    return criticalFiles; // Fall back to critical files
  }
}

// Fix imports in a specific file
function fixImportsInFile(filePath) {
  try {
    log(`Checking imports in ${filePath}`);
    
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Create backup of the original file
    const backupPath = `${filePath}.bak`;
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, content);
      log(`Created backup at ${backupPath}`);
    }
    
    // Define the imports to fix
    const importMap = {
      'react-singleton': 'react-singleton.ts',
      'react-router-singleton': 'react-router-singleton.ts',
      'supabase-singleton': 'supabase-singleton.ts',
      'module-alias': 'module-alias.ts',
      'vite-module-patch': 'vite-module-patch.ts',
      'router-patch': 'router-patch.ts',
      'tempo-devtools-react-patch': 'tempo-devtools-react-patch.ts',
      'direct-db-access': 'direct-db-access.ts',
      'supabase': 'supabase.ts'
    };
    
    // Check for import statements and fix them
    let modified = false;
    
    // Process imports without extensions
    Object.entries(importMap).forEach(([name, defaultExtension]) => {
      // First check if the file exists with .ts or .tsx extension
      const basePath = path.join(SRC_DIR, name.includes('/') ? name : `lib/${name}`);
      const tsPath = `${basePath}.ts`;
      const tsxPath = `${basePath}.tsx`;
      
      let correctExtension = defaultExtension;
      
      if (fs.existsSync(tsxPath)) {
        correctExtension = `${name}.tsx`;
      } else if (fs.existsSync(tsPath)) {
        correctExtension = `${name}.ts`;
      }
      
      // Match imports like: import X from './path/name'
      const importRegex = new RegExp(`from\\s+['"]([^'"]*/${name})['"]`, 'g');
      
      if (importRegex.test(content)) {
        content = content.replace(importRegex, (match, path) => {
          const extension = correctExtension.endsWith('tsx') ? '.tsx' : '.ts';
          log(`Replacing import: ${path} -> ${path}${extension}`);
          return `from "${path}${extension}"`;
        });
        modified = true;
      }
      
      // Also check for imports with .js extension
      const jsImportRegex = new RegExp(`from\\s+['"]([^'"]*/${name}\\.js)['"]`, 'g');
      
      if (jsImportRegex.test(content)) {
        content = content.replace(jsImportRegex, (match, path) => {
          const extension = correctExtension.endsWith('tsx') ? '.tsx' : '.ts';
          const fixedPath = path.replace(/\.js$/, extension);
          log(`Replacing .js import: ${path} -> ${fixedPath}`);
          return `from "${fixedPath}"`;
        });
        modified = true;
      }
      
      // Check for imports with incorrect extension (.tsx when should be .ts or vice versa)
      const tsImportRegex = new RegExp(`from\\s+['"]([^'"]*/${name}\\.ts)['"]`, 'g');
      const tsxImportRegex = new RegExp(`from\\s+['"]([^'"]*/${name}\\.tsx)['"]`, 'g');
      
      if (correctExtension.endsWith('tsx') && tsImportRegex.test(content)) {
        content = content.replace(tsImportRegex, (match, path) => {
          const fixedPath = path.replace(/\.ts$/, '.tsx');
          log(`Fixing extension: ${path} -> ${fixedPath}`);
          return `from "${fixedPath}"`;
        });
        modified = true;
      } else if (correctExtension.endsWith('ts') && tsxImportRegex.test(content)) {
        content = content.replace(tsxImportRegex, (match, path) => {
          const fixedPath = path.replace(/\.tsx$/, '.ts');
          log(`Fixing extension: ${path} -> ${fixedPath}`);
          return `from "${fixedPath}"`;
        });
        modified = true;
      }
    });
    
    // Write the updated content if changes were made
    if (modified) {
      fs.writeFileSync(filePath, content);
      log(`Updated imports in ${filePath}`);
      return true;
    } else {
      log(`No changes needed in ${filePath}`);
      return false;
    }
  } catch (error) {
    log(`Error fixing imports in ${filePath}: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  log('Starting import fixes for missing .js files...');
  
  // Find files to fix
  const filesToFix = findFilesToFix();
  
  if (filesToFix.length === 0) {
    log('No files need fixing. Exiting.');
    return;
  }
  
  // Fix imports in each file
  let fixedCount = 0;
  
  filesToFix.forEach(filePath => {
    if (fixImportsInFile(filePath)) {
      fixedCount++;
    }
  });
  
  log(`Fixed imports in ${fixedCount}/${filesToFix.length} files.`);
  log('Import fixes completed!');
}

// Run the script
main().catch(error => {
  log(`Unexpected error: ${error.message}`);
  process.exit(1);
});