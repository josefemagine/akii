#!/usr/bin/env node

/**
 * This script fixes TypeScript errors in Supabase functions by:
 * 1. Adding types for query results to handle .rows property access
 * 2. Adding explicit types for error handling
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Root directory for Supabase functions
const FUNCTIONS_DIR = path.resolve(__dirname, '../supabase/functions');

// Process a single TypeScript file
function processFile(filePath) {
  console.log(`Processing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix query results type errors
  if (content.includes('const { rows') || content.includes('const { rows:')) {
    // Add type for query results
    const typeDefPattern = /export async function query<T.*\(.*\): Promise<T\[\]>/;
    if (!typeDefPattern.test(content)) {
      // Add interface for query results if it doesn't exist
      const importStatement = `import { query } from "../_shared/postgres`;
      const replacement = `import { query } from "../_shared/postgres`;
      
      if (content.includes(importStatement)) {
        // Add augmented types at the top of the file after imports
        const lines = content.split('\n');
        let importEndIndex = 0;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().startsWith('import ')) {
            importEndIndex = i;
          } else if (lines[i].trim() !== '' && !lines[i].trim().startsWith('//')) {
            break;
          }
        }
        
        // Insert type declarations after imports
        lines.splice(importEndIndex + 1, 0, '', 
          '// Augment query result with rows property', 
          'declare module "../_shared/postgres" {',
          '  interface QueryResult<T> {',
          '    rows: T[];',
          '    rowCount: number;',
          '  }',
          '}', ''
        );
        
        content = lines.join('\n');
        modified = true;
      }
    }
  }

  // Fix error handling issues
  if (content.includes('error.message') && !content.includes('error: Error')) {
    // Replace error.message with safer error handling
    content = content.replace(
      /error\.message/g, 
      '(error instanceof Error ? error.message : String(error))'
    );
    modified = true;
  }

  // Save changes if modified
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath}`);
  }
}

// Recursively process all TypeScript files
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.ts')) {
      processFile(filePath);
    }
  }
}

// Main execution
console.log('Starting to fix TypeScript errors in Supabase functions...');
processDirectory(FUNCTIONS_DIR);
console.log('Done!'); 