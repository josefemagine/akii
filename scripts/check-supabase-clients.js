#!/usr/bin/env node

/**
 * Supabase Client Checker Script
 * 
 * This script identifies all places in the codebase where Supabase clients
 * might be created or imported inconsistently.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current file and directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SRC_DIR = path.resolve(path.dirname(__dirname), 'src');
const ISSUES = {
  createClient: {
    pattern: "createClient\\s*<.*?>?\\(.*?\\)",
    description: "Direct Supabase client creation"
  },
  directSingleton: {
    pattern: "from\\s+['\"]@\\/lib\\/supabase-singleton['\"]",
    description: "Direct import from supabase-singleton"
  },
  multiImport: {
    pattern: "from\\s+['\"]@\\/supabase\\/.*?['\"]",
    description: "Import from subdirectories"
  }
};

// Stats
const stats = {
  filesChecked: 0,
  issuesFound: 0,
  byType: {}
};

Object.keys(ISSUES).forEach(key => {
  stats.byType[key] = 0;
});

// Find files with issues
const findFilesWithIssues = (issueType, pattern) => {
  try {
    // Escape the pattern for shell execution
    const escapedPattern = pattern.replace(/'/g, "'\\''").replace(/"/g, '\\"');
    const command = `grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -E "${escapedPattern}" ${SRC_DIR}`;
    
    console.log(`Running: ${command}`);
    const output = execSync(command, { encoding: 'utf-8' });
    
    const matches = output
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [filePath, ...rest] = line.split(':');
        const matchContent = rest.join(':').trim();
        return { filePath, matchContent };
      });
      
    stats.byType[issueType] = matches.length;
    stats.issuesFound += matches.length;
    
    return matches;
  } catch (error) {
    // grep returns 1 when no matches, which triggers an error
    if (error.status === 1) {
      return [];
    }
    console.error(`Error finding ${issueType}:`, error.message);
    return [];
  }
};

// Main process
const main = () => {
  console.log('🔍 Checking for potential Supabase client issues in the codebase...');
  console.log('==========================================================');
  
  // Check each issue type
  for (const [issueType, config] of Object.entries(ISSUES)) {
    console.log(`\n👉 Checking for: ${config.description}`);
    const matches = findFilesWithIssues(issueType, config.pattern);
    
    if (matches.length > 0) {
      console.log(`\nFound ${matches.length} instances of ${issueType}:`);
      
      // Group by file
      const fileGroups = {};
      matches.forEach(match => {
        if (!fileGroups[match.filePath]) {
          fileGroups[match.filePath] = [];
        }
        fileGroups[match.filePath].push(match.matchContent);
      });
      
      // Display organized by file
      Object.entries(fileGroups).forEach(([file, contents]) => {
        const relPath = path.relative(process.cwd(), file);
        console.log(`  - ${relPath} (${contents.length} matches)`);
        if (contents.length <= 5) { // Only show details for files with few matches
          contents.forEach(content => {
            // Clean up and truncate the content
            const cleanContent = content.replace(/^\s+/, '').substring(0, 100);
            console.log(`      ${cleanContent}${cleanContent.length >= 100 ? '...' : ''}`);
          });
        }
      });
    } else {
      console.log(`✅ No instances found!`);
    }
  }
  
  // Summary
  console.log('\n📊 Summary:');
  console.log('==========');
  console.log(`Total potential issues: ${stats.issuesFound}`);
  
  for (const [issueType, config] of Object.entries(ISSUES)) {
    console.log(`- ${config.description}: ${stats.byType[issueType]} instances`);
  }
  
  if (stats.issuesFound === 0) {
    console.log('\n✅ No issues found! Your Supabase client usage appears to be properly centralized.');
  } else {
    console.log('\n⚠️ Potential issues found. These files may be creating multiple Supabase client instances.');
    console.log('Consider updating them to use the centralized client from @/lib/supabase');
  }
};

main(); 