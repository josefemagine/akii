#!/usr/bin/env node

/**
 * This script fixes all JSX syntax issues across the codebase:
 * 1. Fixes incorrect JSX syntax like <"div", { className: "..." }> to <div className="...">
 * 2. Fixes children array syntax to use proper JSX children
 * 3. Fixes event handlers
 * 4. Addresses TypeScript and forwardRef issues
 * 5. Removes problematic __rest function and duplicated imports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const LOG_PATH = path.join(__dirname, '../tmp/fixed-all-components.log');

// Ensure tmp directory exists
if (!fs.existsSync(path.join(__dirname, '../tmp'))) {
  fs.mkdirSync(path.join(__dirname, '../tmp'), { recursive: true });
}

// Clear previous log
fs.writeFileSync(LOG_PATH, '');

// Log helper
function log(message) {
  console.log(`[Fix All] ${message}`);
  fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} - ${message}\n`);
}

// Get list of all component files recursively
function getAllComponentFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      results = results.concat(getAllComponentFiles(itemPath));
    } else if ((itemPath.endsWith('.tsx') || itemPath.endsWith('.ts')) && 
               !itemPath.endsWith('.d.ts') && 
               !itemPath.includes('.test.') && 
               !itemPath.includes('.spec.')) {
      results.push(itemPath);
    }
  }
  
  return results;
}

// Fix JSX syntax in a component file
function fixComponentSyntax(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Create backup of the original file before making any changes
    const backupPath = `${filePath}.bak`;
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, content);
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
    
    // 3. Fix forwardRef TypeScript syntax
    const forwardRefSimpleRegex = /React\.forwardRef\(\(([^,]+), ref\) =>/g;
    if (forwardRefSimpleRegex.test(content)) {
      content = content.replace(forwardRefSimpleRegex, (match, props) => {
        return `React.forwardRef<HTMLElement, any>((${props}, ref) =>`;
      });
      modified = true;
      log(`Fixed simple forwardRef type annotation in ${filePath}`);
    }
    
    const forwardRefDestructuredRegex = /React\.forwardRef\(\(\{([^}]+)\}, ref\) =>/g;
    if (forwardRefDestructuredRegex.test(content)) {
      content = content.replace(forwardRefDestructuredRegex, (match, props) => {
        return `React.forwardRef<HTMLElement, any>(({${props}}, ref) =>`;
      });
      modified = true;
      log(`Fixed destructured forwardRef type annotation in ${filePath}`);
    }
    
    // 4. Fix _a, ref> pattern and __rest assignments
    const restAssignmentRegex = /var \{ ([^\}]+) \} = _a, props = __rest\(_a, \[([^\]]+)\]\>;/g;
    if (restAssignmentRegex.test(content)) {
      content = content.replace(restAssignmentRegex, (match, destructured, restProps) => {
        return `const { ${destructured}, ...props } = props;`;
      });
      modified = true;
      log(`Fixed __rest assignment in ${filePath}`);
    }
    
    const brokenForwardRefRegex = /React\.forwardRef\(\(_a, ref\> =>/g;
    if (brokenForwardRefRegex.test(content)) {
      content = content.replace(brokenForwardRefRegex, 'React.forwardRef((props, ref) =>');
      modified = true;
      log(`Fixed broken forwardRef syntax in ${filePath}`);
    }
    
    // 5. Fix string-based JSX like <"div", {...}> to <div {...}>
    const stringJsxRegex = /<"([a-zA-Z0-9]+)", \{ ([^}]+) \}>/g;
    if (stringJsxRegex.test(content)) {
      content = content.replace(stringJsxRegex, (match, tag, props) => {
        // Convert props with : to = format
        const processedProps = props.replace(/(\w+):\s*([^,]+)(?:,|$)/g, '$1={$2} ');
        return `<${tag} ${processedProps}>`;
      });
      modified = true;
      log(`Fixed string-based JSX syntax in ${filePath}`);
    }
    
    // 6. Fix children array syntax
    const childrenArrayRegex = /children: \[([^\]]+)\]/g;
    if (childrenArrayRegex.test(content)) {
      content = content.replace(childrenArrayRegex, (match, childrenContent) => {
        // We need to convert children: [...] to proper JSX {children}
        return childrenContent;
      });
      modified = true;
      log(`Fixed children array syntax in ${filePath}`);
    }
    
    // 7. Fix broken closing tags
    const brokenClosingRegex = /<\/[^>]*\>/g;
    if (brokenClosingRegex.test(content)) {
      content = content.replace(brokenClosingRegex, match => match.replace(/\>/g, '>'));
      modified = true;
      log(`Fixed broken closing tags in ${filePath}`);
    }
    
    // 8. Fix non-standard component calls like <Component, {...}>
    const commaComponentRegex = /<([A-Z][a-zA-Z0-9.]+), Object\.assign\(/g;
    if (commaComponentRegex.test(content)) {
      content = content.replace(commaComponentRegex, (match, component) => {
        return `<${component} {...`;
      });
      modified = true;
      log(`Fixed non-standard component calls in ${filePath}`);
    }
    
    // 9. Fix Object.assign pattern
    const objectAssignRegex = /Object\.assign\(\{ ([^}]+) \}, props(?:, \{ ([^}]*) \})?\)>/g;
    if (objectAssignRegex.test(content)) {
      content = content.replace(objectAssignRegex, (match, mainProps, extraProps) => {
        let result = `${mainProps} {...props}`;
        if (extraProps) {
          result += ` ${extraProps}`;
        }
        return result + '>';
      });
      modified = true;
      log(`Fixed Object.assign pattern in ${filePath}`);
    }
    
    // 10. Fix event handlers
    const eventHandlerRegex = /onClick: \(([^)]*)\) => ([^,}]+)/g;
    if (eventHandlerRegex.test(content)) {
      content = content.replace(eventHandlerRegex, (match, params, body) => {
        return `onClick={() => ${body}}`;
      });
      modified = true;
      log(`Fixed event handler syntax in ${filePath}`);
    }
    
    // 11. Fix broken interfaces with hyphens
    const brokenInterfaceRegex = /interface ([a-zA-Z0-9-]+)Props/g;
    if (brokenInterfaceRegex.test(content)) {
      content = content.replace(brokenInterfaceRegex, (match, interfaceName) => {
        // Convert kebab-case to PascalCase
        const pascalCase = interfaceName.split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('');
        return `interface ${pascalCase}Props`;
      });
      modified = true;
      log(`Fixed broken interface names in ${filePath}`);
    }
    
    // 12. Fix function parameter with broken syntax
    const brokenFunctionParamRegex = /\(>\s*:\s*void\s*=>/g;
    if (brokenFunctionParamRegex.test(content)) {
      content = content.replace(brokenFunctionParamRegex, '() =>');
      modified = true;
      log(`Fixed broken function parameters in ${filePath}`);
    }
    
    // 13. Fix incorrect parameter destructuring
    const brokenDestructuringRegex = /\({\s*([^}]+)\s*}\>\s*:/g;
    if (brokenDestructuringRegex.test(content)) {
      content = content.replace(brokenDestructuringRegex, (match, params) => {
        return `({ ${params} }:`;
      });
      modified = true;
      log(`Fixed broken parameter destructuring in ${filePath}`);
    }
    
    // 14. Convert multiple closing brackets to proper syntax
    content = content.replace(/\}\>\>/g, '} />');
    content = content.replace(/\}\>\>\>/g, '} />');
    content = content.replace(/\}\>\>\>\>/g, '} />');
    
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
  log('Starting comprehensive component fixes...');
  
  // Find all component files
  const allComponentFiles = getAllComponentFiles(COMPONENTS_DIR);
  log(`Found ${allComponentFiles.length} component files to check`);
  
  if (allComponentFiles.length === 0) {
    log('No component files found. Exiting.');
    return;
  }
  
  // Fix components
  let fixedCount = 0;
  
  for (const filePath of allComponentFiles) {
    if (fixComponentSyntax(filePath)) {
      fixedCount++;
    }
  }
  
  log(`Fixed ${fixedCount}/${allComponentFiles.length} component files.`);
  log('Component fixes completed!');
}

// Run the script
main().catch(error => {
  log(`Unexpected error: ${error.message}`);
  process.exit(1);
}); 