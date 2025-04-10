#!/usr/bin/env node

/**
 * This script finds imports without extensions and adds .ts/.tsx extensions
 * to fix 404 errors when Vite tries to resolve them as .js files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const LOG_PATH = path.join(__dirname, '../tmp/fixed-js-imports.log');

// Ensure tmp directory exists
if (!fs.existsSync(path.join(__dirname, '../tmp'))) {
  fs.mkdirSync(path.join(__dirname, '../tmp'), { recursive: true });
}

// Clear previous log
fs.writeFileSync(LOG_PATH, '');

// Log helper
function log(message) {
  console.log(`[Import Fix] ${message}`);
  fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} - ${message}\n`);
}

// Find TypeScript/React files
function findTsFiles() {
  log('Finding TypeScript files...');
  
  try {
    const result = execSync(`find ${SRC_DIR} -type f -name "*.ts" -o -name "*.tsx"`, { encoding: 'utf8' });
    const files = result.split('\n').filter(Boolean);
    log(`Found ${files.length} TypeScript files`);
    return files;
  } catch (error) {
    log(`Error finding files: ${error.message}`);
    return [];
  }
}

// Check if a component file exists with .ts or .tsx extension
function findComponentFile(basePath, componentName) {
  const possibleExtensions = ['.ts', '.tsx'];
  const possiblePaths = [];
  
  // Check both the exact name and PascalCase variations
  const variations = [
    componentName,
    componentName.charAt(0).toUpperCase() + componentName.slice(1) // Convert to PascalCase
  ];
  
  for (const name of variations) {
    for (const ext of possibleExtensions) {
      possiblePaths.push(path.join(basePath, `${name}${ext}`));
      
      // Also check index files in directories
      possiblePaths.push(path.join(basePath, name, `index${ext}`));
    }
  }
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  
  return null;
}

// Fix imports in a specific file
function fixImportsInFile(filePath) {
  try {
    log(`Checking imports in ${filePath}`);
    
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Create backup of the original file
    const backupPath = `${filePath}.bak`;
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, content);
      log(`Created backup at ${backupPath}`);
    }
    
    // Fix imports without extensions that might resolve to .js
    // Match imports like import X from '@/components/ui/button'
    const importRegex = /from\s+['"]([^'"]*\/([^\/'"]+))['"];?/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const [fullImport, importPath, componentName] = match;
      
      // Skip external packages, relative imports with extensions, and index imports
      if (
        !importPath.startsWith('.') && 
        !importPath.startsWith('@/') || 
        importPath.includes('.ts') || 
        importPath.includes('.js') ||
        componentName === ''
      ) {
        continue;
      }
      
      // Determine the absolute path to check
      let absolutePathToCheck;
      if (importPath.startsWith('@/')) {
        absolutePathToCheck = path.join(SRC_DIR, importPath.substring(2));
      } else if (importPath.startsWith('.')) {
        absolutePathToCheck = path.join(path.dirname(filePath), importPath);
      } else {
        continue;
      }
      
      // Check if the file exists with .ts or .tsx extension
      const componentFile = findComponentFile(path.dirname(absolutePathToCheck), componentName);
      
      if (componentFile) {
        const extension = path.extname(componentFile);
        const newImportPath = `${importPath}${extension}`;
        const newImport = fullImport.replace(importPath, newImportPath);
        
        log(`Fixing import: ${importPath} -> ${newImportPath}`);
        content = content.replace(fullImport, newImport);
        modified = true;
      }
    }
    
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
  log('Starting import fixes for potential .js resolution errors...');
  
  // Find files to fix
  const filesToFix = findTsFiles();
  
  if (filesToFix.length === 0) {
    log('No files found. Exiting.');
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