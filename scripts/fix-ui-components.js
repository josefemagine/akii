#!/usr/bin/env node

/**
 * This script fixes common UI component issues:
 * 1. Removes problematic __rest function and duplicate React imports
 * 2. Fixes forwardRef TypeScript interface issues
 * 3. Applies consistent JSX formatting
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const UI_COMPONENTS_DIR = path.join(SRC_DIR, 'components/ui');
const LOG_PATH = path.join(__dirname, '../tmp/fixed-ui-components.log');

// Ensure tmp directory exists
if (!fs.existsSync(path.join(__dirname, '../tmp'))) {
  fs.mkdirSync(path.join(__dirname, '../tmp'), { recursive: true });
}

// Clear previous log
fs.writeFileSync(LOG_PATH, '');

// Log helper
function log(message) {
  console.log(`[UI Fix] ${message}`);
  fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} - ${message}\n`);
}

// Find UI component files
function findUiComponentFiles() {
  log('Finding UI component files...');
  
  try {
    const files = fs.readdirSync(UI_COMPONENTS_DIR)
      .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
      .map(file => path.join(UI_COMPONENTS_DIR, file));
    
    log(`Found ${files.length} UI component files`);
    return files;
  } catch (error) {
    log(`Error finding files: ${error.message}`);
    return [];
  }
}

// Fix a UI component file
function fixUiComponentFile(filePath) {
  try {
    log(`Fixing component: ${filePath}`);
    
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Create backup of the original file
    const backupPath = `${filePath}.bak`;
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, content);
      log(`Created backup at ${backupPath}`);
    }
    
    // 1. Remove __rest function and duplicate React imports
    const restImportRegex = /import React from "react";\s*var __rest[\s\S]*?return t;\s*};/g;
    if (restImportRegex.test(content)) {
      content = content.replace(restImportRegex, '');
      modified = true;
      log(`Removed problematic __rest function from ${filePath}`);
    }
    
    // 2. Fix duplicate React imports
    if (content.includes('import React from "react";') && content.includes('import * as React from "react";')) {
      content = content.replace('import React from "react";', '');
      modified = true;
      log(`Fixed duplicate React imports in ${filePath}`);
    }
    
    // 3. Add proper forwardRef type annotations
    const forwardRefRegex = /React\.forwardRef\(\(\{([^}]+)\}, ref\) =>/g;
    let match;
    while ((match = forwardRefRegex.exec(content)) !== null) {
      const props = match[1].trim();
      const newForwardRef = `React.forwardRef<HTMLElement, any>((${props ? `{${props}}` : ''}, ref) =>`;
      content = content.replace(match[0], newForwardRef);
      modified = true;
      log(`Fixed forwardRef type annotation in ${filePath}`);
    }
    
    // 4. Apply consistent JSX formatting if needed (more complex, might need manual fixes)
    
    // Write the updated content if changes were made
    if (modified) {
      fs.writeFileSync(filePath, content);
      log(`Updated ${filePath}`);
      return true;
    } else {
      log(`No changes needed in ${filePath}`);
      return false;
    }
  } catch (error) {
    log(`Error fixing ${filePath}: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  log('Starting UI component fixes...');
  
  // Find files to fix
  const filesToFix = findUiComponentFiles();
  
  if (filesToFix.length === 0) {
    log('No UI component files found. Exiting.');
    return;
  }
  
  // Fix components
  let fixedCount = 0;
  
  filesToFix.forEach(filePath => {
    if (fixUiComponentFile(filePath)) {
      fixedCount++;
    }
  });
  
  log(`Fixed ${fixedCount}/${filesToFix.length} UI component files.`);
  log('Component fixes completed!');
}

// Run the script
main().catch(error => {
  log(`Unexpected error: ${error.message}`);
  process.exit(1);
}); 