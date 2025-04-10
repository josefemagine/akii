/**
 * Syntax Error Fix Script
 * 
 * This script finds and fixes common syntax errors in the codebase:
 * 1. Fixes malformed interfaces with dashes in names
 * 2. Fixes malformed JSX with string literals
 * 3. Fixes function parameters with > instead of proper syntax
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Files to process
const FILES_TO_FIX = [
  'src/pages/admin/AdminSettings.tsx',
  'src/pages/admin/Billing.tsx',
  'src/pages/admin/UsersPage.tsx',
  'src/pages/admin/Workflows.tsx',
  'src/layouts/DashboardLayout.tsx',
  'src/components/ui/sheet.tsx',
  'src/routes/PrivateRoute.tsx',
  'src/routes/SimplePrivateRoute.tsx'
];

// Function to fix invalid interfaces with dashes
function fixInterfaceNames(content) {
  // Replace dash-separated interface names with PascalCase
  return content.replace(/interface\s+([a-zA-Z0-9-]+)Props\s*\{\}/g, (match, name) => {
    // Convert dash-case to PascalCase
    const pascalName = name
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    
    return `interface ${pascalName}Props {}`;
  });
}

// Function to fix malformed function parameters
function fixFunctionParameters(content) {
  // Fix function declarations with malformed parameters
  return content.replace(/function\s+([a-zA-Z0-9_]+)\s*\(\s*>\s*\{/g, (match, name) => {
    return `function ${name}() {`;
  })
  // Fix arrow functions with malformed parameters
  .replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*\(\s*[_a-zA-Z0-9]*\s*>\s*:[^=]*=>/g, (match, name) => {
    return `const ${name} = () =>`;
  })
  // Fix React.forwardRef with malformed parameters
  .replace(/React\.forwardRef\(\s*\([_a-zA-Z0-9]*,\s*ref>\s*=>/g, (match) => {
    return `React.forwardRef((props, ref) =>`;
  });
}

// Function to fix malformed JSX with string tags
function fixJsxSyntax(content) {
  // Create proper JSX elements
  let fixedContent = content;
  
  // Fix JSX elements with string literals
  fixedContent = fixedContent.replace(/<"([a-z]+)"(,|\s*)\{/g, (match, tagName) => {
    return `<${tagName} {`;
  });
  
  // Fix malformed JSX closing
  fixedContent = fixedContent.replace(/}\s*>\s*>\s*;/g, '} />;');
  fixedContent = fixedContent.replace(/}\s*>\s*>\s*\)/g, '} />)');
  
  // Fix malformed children array brackets
  fixedContent = fixedContent.replace(/children:\s*\[([^[]*?)\]\s*}\s*>/g, (match, children) => {
    return `children: [${children}]} />`;
  });
  
  return fixedContent;
}

// Process each file
async function processFiles() {
  let fixedCount = 0;
  
  for (const pattern of FILES_TO_FIX) {
    const files = glob.sync(pattern);
    
    for (const file of files) {
      console.log(`Processing ${file}...`);
      
      try {
        // Read the file
        let content = fs.readFileSync(file, 'utf8');
        const originalContent = content;
        
        // Apply fixes
        content = fixInterfaceNames(content);
        content = fixFunctionParameters(content);
        content = fixJsxSyntax(content);
        
        // If content changed, write the file
        if (content !== originalContent) {
          // Create a backup
          fs.writeFileSync(`${file}.bak`, originalContent);
          
          // Write the fixed content
          fs.writeFileSync(file, content);
          
          console.log(`✅ Fixed ${file}`);
          fixedCount++;
        } else {
          console.log(`ℹ️ No changes needed in ${file}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    }
  }
  
  return fixedCount;
}

// Main execution
async function main() {
  console.log('🔍 Starting syntax error fixing script...');
  
  const fixedCount = await processFiles();
  
  console.log(`\n✨ Done! Fixed ${fixedCount} files.`);
}

main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
}); 