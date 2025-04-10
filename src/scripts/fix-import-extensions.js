/**
 * Import Extensions Fix Script
 * 
 * This script removes file extensions (.ts, .tsx) from all import statements
 * in the codebase, which can cause build errors in some bundlers.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Find all TypeScript/React files in the src directory
const SRC_FILES = 'src/**/*.{ts,tsx}';

// Function to fix imports with extensions
function fixImportExtensions(content) {
  // Find all imports with .ts or .tsx extensions
  const importRegex = /import\s+(?:(?:{[^}]*})|(?:[^{}\s,]+))(?:\s*,\s*(?:(?:{[^}]*})|(?:[^{}\s,]+)))?\s+from\s+['"]([^'"]+\.(?:ts|tsx))['"];?/g;
  
  // Check if there are any imports with extensions to fix
  if (!importRegex.test(content)) {
    return { content, changed: false };
  }
  
  // Reset the regex after testing
  importRegex.lastIndex = 0;
  
  // Track what was fixed
  const fixedImports = [];
  
  // Replace imports by removing the extension
  const updatedContent = content.replace(importRegex, (match, importPath) => {
    // Extract the path and remove the extension
    const fixedPath = importPath.replace(/\.(ts|tsx)$/, '');
    
    // If the path changed, add it to our list of fixed imports
    if (fixedPath !== importPath) {
      fixedImports.push({ from: importPath, to: fixedPath });
    }
    
    // Return the import with the fixed path
    return match.replace(importPath, fixedPath);
  });
  
  return { 
    content: updatedContent, 
    changed: fixedImports.length > 0,
    fixedImports 
  };
}

// Process all files in the src directory
async function processFiles() {
  let fixedCount = 0;
  let processedCount = 0;
  let totalFixedImports = 0;
  
  const files = glob.sync(SRC_FILES, {
    ignore: ['node_modules/**', 'dist/**', '**/*.d.ts']
  });
  
  console.log(`Found ${files.length} files to check`);
  
  for (const file of files) {
    processedCount++;
    
    if (processedCount % 50 === 0) {
      console.log(`Progress: ${processedCount}/${files.length} files processed`);
    }
    
    try {
      // Read the file
      const content = fs.readFileSync(file, 'utf8');
      
      // Apply fixes
      const { content: updatedContent, changed, fixedImports } = fixImportExtensions(content);
      
      // If content changed, write the file
      if (changed) {
        console.log(`\nProcessing ${file}:`);
        
        // Log what was fixed
        fixedImports.forEach(({ from, to }) => {
          console.log(`  Fixed import: ${from} -> ${to}`);
        });
        
        // Create a backup
        fs.writeFileSync(`${file}.bak`, content);
        
        // Write the fixed content
        fs.writeFileSync(file, updatedContent);
        
        console.log(`✅ Fixed ${fixedImports.length} imports in ${file}`);
        fixedCount++;
        totalFixedImports += fixedImports.length;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  return { fixedCount, processedCount, totalFixedImports };
}

// Main execution
async function main() {
  console.log('🔍 Starting import extension fix script...');
  
  const { fixedCount, processedCount, totalFixedImports } = await processFiles();
  
  console.log(`\n✨ Done! Processed ${processedCount} files, fixed ${totalFixedImports} imports in ${fixedCount} files.`);
}

main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
}); 