#!/usr/bin/env node

/**
 * Fix Supabase Imports Script
 * 
 * This script finds and fixes inconsistent Supabase imports across the codebase.
 * It ensures that all files import from @/lib/supabase rather than directly
 * from @/lib/supabase-singleton.
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
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const SINGLETON_IMPORT = /@\/lib\/supabase-singleton/;
const CORRECT_IMPORT = '@/lib/supabase';

// Stats for reporting
const stats = {
  filesChecked: 0,
  filesModified: 0,
  importsFixed: 0,
  errors: 0
};

// Find all files with direct singleton imports
const findFilesWithSingletonImports = () => {
  try {
    const extensions = EXTENSIONS.map(ext => `--include="*${ext}"`).join(' ');
    const command = `grep -r ${extensions} "from [\\'\\"]\\@\\/lib\\/supabase-singleton[\\'\\"]" ${SRC_DIR}`;
    
    console.log('Running:', command);
    const output = execSync(command, { encoding: 'utf-8' });
    
    const files = output
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [filePath] = line.split(':');
        return filePath;
      })
      .filter((file, index, self) => self.indexOf(file) === index); // unique files
      
    return files;
  } catch (error) {
    console.error('Error finding files:', error.message);
    return [];
  }
};

// Fix imports in a file
const fixImportsInFile = (filePath) => {
  try {
    stats.filesChecked++;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Direct import replacement for singleton imports
    const importMatches = content.match(/import\s+(?:{\s*([^}]*)\s*}|([^{;]*?))\s+from\s+['"]@\/lib\/supabase-singleton['"]/g) || [];
    
    importMatches.forEach(importStatement => {
      const newImport = importStatement.replace('@/lib/supabase-singleton', CORRECT_IMPORT);
      content = content.replace(importStatement, newImport);
      stats.importsFixed++;
    });
    
    // Only write if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      stats.filesModified++;
      console.log(`✓ Fixed imports in: ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (error) {
    stats.errors++;
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
};

// Main process
const main = () => {
  console.log('🔎 Finding files with direct supabase-singleton imports...');
  
  const files = findFilesWithSingletonImports();
  console.log(`Found ${files.length} files with direct singleton imports.`);
  
  if (files.length === 0) {
    console.log('No files to fix!');
    return;
  }
  
  console.log('\n🔧 Fixing imports...');
  files.forEach(file => fixImportsInFile(file));
  
  console.log('\n📊 Results:');
  console.log(`- Files checked: ${stats.filesChecked}`);
  console.log(`- Files modified: ${stats.filesModified}`);
  console.log(`- Imports fixed: ${stats.importsFixed}`);
  console.log(`- Errors: ${stats.errors}`);
  
  if (stats.filesModified > 0) {
    console.log('\n✅ Import consolidation complete! All imports now use @/lib/supabase.');
    console.log('⚠️ Remember to restart your dev server for changes to take effect.');
  }
};

main(); 