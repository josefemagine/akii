#!/usr/bin/env node

/**
 * This script fixes common JSX syntax issues in React components:
 * 1. Fixes incorrect JSX syntax like <"div", { className: "..." }> to <div className="...">
 * 2. Fixes event handlers
 * 3. Corrects component props
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const LOG_PATH = path.join(__dirname, '../tmp/fixed-component-syntax.log');

// Ensure tmp directory exists
if (!fs.existsSync(path.join(__dirname, '../tmp'))) {
  fs.mkdirSync(path.join(__dirname, '../tmp'), { recursive: true });
}

// Clear previous log
fs.writeFileSync(LOG_PATH, '');

// Log helper
function log(message) {
  console.log(`[Syntax Fix] ${message}`);
  fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} - ${message}\n`);
}

// Find component files with syntax issues
function findComponentsWithSyntaxIssues() {
  log('Finding component files with syntax issues...');
  
  try {
    // List of problematic component files with incorrect JSX syntax
    const problemComponents = [
      path.join(SRC_DIR, 'components/dashboard/team/PendingInvitations.tsx'),
      path.join(SRC_DIR, 'components/dashboard/team/TeamRoles.tsx'),
      path.join(SRC_DIR, 'components/debug/AuthDebugger.tsx'),
      path.join(SRC_DIR, 'components/layout/Sidebar.tsx'),
      path.join(SRC_DIR, 'components/dashboard/documents/DocumentUploader.tsx'),
      path.join(SRC_DIR, 'components/subscription/SubscriptionPlans.tsx'),
      path.join(SRC_DIR, 'components/subscription/SubscriptionUsageDisplay.tsx'),
      path.join(SRC_DIR, 'components/admin/withAdminInit.tsx'),
      path.join(SRC_DIR, 'components/animations/AnimatedText.tsx')
    ];
    
    // Filter to include only files that exist
    const existingFiles = problemComponents.filter(file => fs.existsSync(file));
    
    log(`Found ${existingFiles.length} component files with potential syntax issues`);
    return existingFiles;
  } catch (error) {
    log(`Error finding files: ${error.message}`);
    return [];
  }
}

// Fix JSX syntax in a component file
function fixComponentSyntax(filePath) {
  try {
    log(`Fixing JSX syntax in: ${filePath}`);
    
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Create backup of the original file
    const backupPath = `${filePath}.bak`;
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, content);
      log(`Created backup at ${backupPath}`);
    }
    
    // 1. Fix incorrect JSX syntax like <"div", { className: "..." }> to <div className="...">
    const jsxStringRegex = /<"([a-zA-Z0-9]+)", \{ ([^}]+) \}>/g;
    if (jsxStringRegex.test(content)) {
      content = content.replace(jsxStringRegex, (match, tag, props) => {
        // Parse props
        const propsContent = props.split(',').map(prop => {
          const [key, value] = prop.split(':').map(p => p.trim());
          return `${key}=${value}`;
        }).join(' ');
        
        return `<${tag} ${propsContent}>`;
      });
      modified = true;
      log(`Fixed string-based JSX syntax in ${filePath}`);
    }
    
    // 2. Fix closing tags for self-closing elements
    const selfClosingRegex = /<([a-zA-Z0-9]+) ([^>]*)>\s*<\/\1>/g;
    if (selfClosingRegex.test(content)) {
      content = content.replace(selfClosingRegex, (match, tag, props) => {
        return `<${tag} ${props} />`;
      });
      modified = true;
      log(`Fixed self-closing tags in ${filePath}`);
    }
    
    // 3. Fix children replacement
    const childrenRegex = /children: \[([^\]]+)\]/g;
    if (childrenRegex.test(content)) {
      content = content.replace(childrenRegex, (match, children) => {
        return children;
      });
      modified = true;
      log(`Fixed children syntax in ${filePath}`);
    }
    
    // 4. Fix event handlers (more complex case)
    const eventHandlerRegex = /onClick: \(([^)]*)\) => ([^,}]+)/g;
    if (eventHandlerRegex.test(content)) {
      content = content.replace(eventHandlerRegex, (match, params, body) => {
        return `onClick={() => ${body}}`;
      });
      modified = true;
      log(`Fixed event handler syntax in ${filePath}`);
    }
    
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
  log('Starting component syntax fixes...');
  
  // Find files to fix
  const filesToFix = findComponentsWithSyntaxIssues();
  
  if (filesToFix.length === 0) {
    log('No component files with syntax issues found. Exiting.');
    return;
  }
  
  // Fix components
  let fixedCount = 0;
  
  filesToFix.forEach(filePath => {
    if (fixComponentSyntax(filePath)) {
      fixedCount++;
    }
  });
  
  log(`Fixed ${fixedCount}/${filesToFix.length} component files.`);
  log('Component syntax fixes completed!');
}

// Run the script
main().catch(error => {
  log(`Unexpected error: ${error.message}`);
  process.exit(1);
}); 