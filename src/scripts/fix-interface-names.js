/**
 * Interface Name Fix Script
 * 
 * This script finds and fixes all interface names with dashes in the entire codebase
 * It converts dash-case to PascalCase for interface names
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Find all TypeScript/React files in the src directory
const SRC_FILES = 'src/**/*.{ts,tsx}';

// Function to fix invalid interfaces with dashes
function fixInterfaceNames(content) {
  // Replace dash-separated interface names with PascalCase
  return content.replace(/interface\s+([a-zA-Z0-9-]+)(?:Props)?\s*\{/g, (match, name) => {
    // Skip if the name doesn't contain dashes
    if (!name.includes('-')) {
      return match;
    }
    
    // Convert dash-case to PascalCase
    const pascalName = name
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    
    // Preserve the "Props" suffix if it was in the original
    const suffix = match.includes('Props') ? 'Props' : '';
    
    console.log(`  Converting: ${name} -> ${pascalName}${suffix}`);
    return `interface ${pascalName}${suffix} {`;
  });
}

// Process all files in the src directory
async function processFiles() {
  let fixedCount = 0;
  let processedCount = 0;
  
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
      let content = fs.readFileSync(file, 'utf8');
      const originalContent = content;
      
      // Check if there are any interfaces with dashes
      if (content.match(/interface\s+[a-zA-Z0-9-]+(?:Props)?\s*\{/)) {
        console.log(`\nProcessing ${file}:`);
        
        // Apply fixes
        content = fixInterfaceNames(content);
        
        // If content changed, write the file
        if (content !== originalContent) {
          // Create a backup
          fs.writeFileSync(`${file}.bak`, originalContent);
          
          // Write the fixed content
          fs.writeFileSync(file, content);
          
          console.log(`✅ Fixed ${file}`);
          fixedCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  return { fixedCount, processedCount };
}

// Main execution
async function main() {
  console.log('🔍 Starting interface name fix script...');
  
  const { fixedCount, processedCount } = await processFiles();
  
  console.log(`\n✨ Done! Processed ${processedCount} files, fixed ${fixedCount} files.`);
}

main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
}); 