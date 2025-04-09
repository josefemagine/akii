#!/usr/bin/env node
/**
 * This script automatically fixes unused variable warnings in TypeScript/JavaScript files 
 * by prefixing them with underscores.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Run ESLint to get the list of unused variables
console.log('Running ESLint to identify unused variables...');
const lintOutput = execSync('npm run lint', { encoding: 'utf8' });

// Regular expression to match unused variable warnings
const unusedVarRegex = /([^/]+):(\d+):(\d+)\s+warning\s+'([^']+)' is (?:defined but never used|assigned a value but never used).*@typescript-eslint\/no-unused-vars/g;
const unusedVarRegexJS = /([^/]+):(\d+):(\d+)\s+warning\s+'([^']+)' is (?:defined but never used|assigned a value but never used).*no-unused-vars/g;

// Collect all matches
const matches = [];
let match;
while ((match = unusedVarRegex.exec(lintOutput)) !== null) {
  matches.push({
    file: match[1].trim(),
    line: parseInt(match[2]),
    column: parseInt(match[3]),
    varName: match[4]
  });
}

while ((match = unusedVarRegexJS.exec(lintOutput)) !== null) {
  matches.push({
    file: match[1].trim(),
    line: parseInt(match[2]),
    column: parseInt(match[3]),
    varName: match[4]
  });
}

// Group by file
const fileGroups = {};
matches.forEach(item => {
  if (!fileGroups[item.file]) {
    fileGroups[item.file] = [];
  }
  fileGroups[item.file].push(item);
});

console.log(`Found ${matches.length} unused variables in ${Object.keys(fileGroups).length} files.`);

// Process each file
Object.keys(fileGroups).forEach(filePath => {
  try {
    const fullPath = filePath.startsWith('/') ? filePath : path.join(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    
    // Sort items by line number in descending order to avoid offset issues
    const items = fileGroups[filePath].sort((a, b) => b.line - a.line);
    
    items.forEach(item => {
      const lineIndex = item.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        
        // Don't modify if already prefixed with underscore
        if (line.includes(`_${item.varName}`) || line.includes(`${item.varName}: _`)) {
          return;
        }
        
        // Check if variable is in a destructuring pattern
        const inDestructuring = line.includes('{') && line.includes('}') && 
                               (line.includes(': ' + item.varName) || line.includes(item.varName + ','));
        
        if (inDestructuring) {
          // Handle destructuring pattern
          if (line.includes(': ' + item.varName)) {
            // For renamed variables like { originalName: varName }
            lines[lineIndex] = line.replace(
              new RegExp(`(\\w+):\\s*${item.varName}`), 
              '$1: _' + item.varName
            );
          } else {
            // For regular destructuring
            lines[lineIndex] = line.replace(
              new RegExp(`\\b${item.varName}\\b(?!:)`), 
              '_' + item.varName
            );
          }
        } else {
          // Regular variable declaration
          lines[lineIndex] = line.replace(
            new RegExp(`\\b${item.varName}\\b`), 
            '_' + item.varName
          );
        }
      }
    });
    
    // Write changes back to file
    fs.writeFileSync(fullPath, lines.join('\n'));
    console.log(`Fixed ${items.length} variables in ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
});

console.log('Done! Run the linter again to check if all issues were fixed.'); 