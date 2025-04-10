const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(process.cwd(), 'src');
const EXTENSIONS_TO_CONVERT = ['.js', '.jsx'];
const TARGET_EXTENSION = '.tsx';
const SKIP_DIRS = ['node_modules', 'dist', 'build', '.git', 'vite-env.d.ts'];

// Helper functions
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !SKIP_DIRS.includes(file)) {
      getAllFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (EXTENSIONS_TO_CONVERT.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

function checkIfTsxExists(jsFilePath) {
  const baseName = path.basename(jsFilePath, path.extname(jsFilePath));
  const dirName = path.dirname(jsFilePath);
  const tsxFilePath = path.join(dirName, `${baseName}${TARGET_EXTENSION}`);
  
  return fs.existsSync(tsxFilePath) ? tsxFilePath : null;
}

function addTypeAnnotations(content) {
  // Replace useState, useRef, etc. with typed versions
  content = content.replace(/useState\(\)/g, 'useState<any>()');
  content = content.replace(/useState\(([^<])/g, 'useState<any>($1');
  content = content.replace(/useRef\(\)/g, 'useRef<any>(null)');
  
  // Add explicit return types to functions
  content = content.replace(/const ([a-zA-Z0-9_]+) = \(\) => {/g, 'const $1 = (): void => {');
  content = content.replace(/const ([a-zA-Z0-9_]+) = \(([^)]*)\) => {/g, 'const $1 = ($2): void => {');
  content = content.replace(/const ([a-zA-Z0-9_]+) = async \(\) => {/g, 'const $1 = async (): Promise<void> => {');
  content = content.replace(/const ([a-zA-Z0-9_]+) = async \(([^)]*)\) => {/g, 'const $1 = async ($2): Promise<void> => {');
  
  // Add React.FC type to components
  content = content.replace(/const ([A-Z][a-zA-Z0-9_]*) = \(\) => {/g, 'const $1: React.FC = () => {');
  content = content.replace(/const ([A-Z][a-zA-Z0-9_]*) = \(([^)]*)\) => {/g, 'const $1: React.FC<$2Props> = ($2) => {');
  
  // Add basic React import if not present
  if (!content.includes('import React')) {
    content = 'import React from "react";\n' + content;
  }
  
  return content;
}

function convertJsxRuntimeImports(content) {
  // Replace jsx-runtime imports with React
  if (content.includes('import { jsx as _jsx') || content.includes('import { jsxs as _jsxs')) {
    // Remove jsx runtime imports
    content = content.replace(/import { jsx as _jsx[^;]*;/g, '');
    content = content.replace(/import { jsxs as _jsxs[^;]*;/g, '');
    content = content.replace(/import { Fragment as _Fragment[^;]*;/g, '');
    
    // Add React import if not present
    if (!content.includes('import React')) {
      content = 'import React from "react";\n' + content;
    }
    
    // Replace jsx runtime usages with JSX
    content = content.replace(/_jsx\(/g, '<');
    content = content.replace(/_jsxs\(/g, '<');
    content = content.replace(/\)/g, '>');
  }
  
  return content;
}

function addBasicTypeInterface(content, componentName) {
  // Check if we need to add props interface
  if (content.includes(`${componentName}Props`)) {
    return content;
  }
  
  // Add a basic props interface
  const propsInterface = `\ninterface ${componentName}Props {}\n`;
  const importEnd = content.lastIndexOf('import');
  const importEndPos = content.indexOf(';', importEnd) + 1;
  
  return content.slice(0, importEndPos) + propsInterface + content.slice(importEndPos);
}

function convertJsToTs(jsFilePath) {
  console.log(`Processing: ${jsFilePath}`);
  
  // Check if TypeScript equivalent exists
  const tsxFilePath = checkIfTsxExists(jsFilePath);
  const originalContent = fs.readFileSync(jsFilePath, 'utf8');
  
  // Extract component name using regex
  const componentNameMatch = originalContent.match(/const ([A-Z][a-zA-Z0-9_]*) = /);
  const componentName = componentNameMatch ? componentNameMatch[1] : path.basename(jsFilePath, path.extname(jsFilePath));
  
  if (tsxFilePath) {
    console.log(`  TypeScript equivalent exists: ${tsxFilePath}`);
    const tsxContent = fs.readFileSync(tsxFilePath, 'utf8');
    
    // Check if the tsx file is significantly different
    if (Math.abs(tsxContent.length - originalContent.length) > 200) {
      console.log('  Significant difference detected between JS and TSX files');
      console.log('  Manual merging might be required');
      
      // Create a backup of the TypeScript file
      const backupPath = `${tsxFilePath}.bak`;
      fs.writeFileSync(backupPath, tsxContent);
      console.log(`  Created backup: ${backupPath}`);
    } else {
      // Files are similar, overwrite the TypeScript file with typed version of JS
      let typedContent = addTypeAnnotations(originalContent);
      typedContent = convertJsxRuntimeImports(typedContent);
      typedContent = addBasicTypeInterface(typedContent, componentName);
      
      // Write the updated content
      fs.writeFileSync(tsxFilePath, typedContent);
      console.log(`  Updated: ${tsxFilePath}`);
    }
  } else {
    // Create new TypeScript file
    let typedContent = addTypeAnnotations(originalContent);
    typedContent = convertJsxRuntimeImports(typedContent);
    typedContent = addBasicTypeInterface(typedContent, componentName);
    
    const newTsxFilePath = path.join(
      path.dirname(jsFilePath),
      `${path.basename(jsFilePath, path.extname(jsFilePath))}${TARGET_EXTENSION}`
    );
    
    fs.writeFileSync(newTsxFilePath, typedContent);
    console.log(`  Created: ${newTsxFilePath}`);
  }
}

function updateImportsInFiles() {
  try {
    // Find all imports of .js files and change them to .tsx
    console.log("Updating imports in codebase...");
    const results = execSync(`grep -r "from .*\\.js[x]\\?" --include="*.{ts,tsx,js,jsx}" ${SRC_DIR}`).toString();
    
    const lines = results.split('\n');
    for (const line of lines) {
      if (!line) continue;
      
      const [file, match] = line.split(':', 2);
      if (file && match && match.includes('from')) {
        const jsImport = match.match(/from ["'](.+\.jsx?)["']/);
        if (jsImport && jsImport[1]) {
          const importPath = jsImport[1];
          
          // Check if imported file exists as TypeScript
          const importDir = path.dirname(file);
          const absImportPath = importPath.startsWith('.') 
            ? path.resolve(importDir, importPath)
            : importPath;
          
          const tsxPath = absImportPath.replace(/\.jsx?$/, '.tsx');
          if (fs.existsSync(tsxPath)) {
            // Replace import in the file
            const content = fs.readFileSync(file, 'utf8');
            const newContent = content.replace(
              new RegExp(`from ["']${importPath}["']`, 'g'),
              `from "${importPath.replace(/\.jsx?$/, '.tsx')}"`
            );
            
            fs.writeFileSync(file, newContent);
            console.log(`Updated import in: ${file}`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error updating imports:", error.message);
  }
}

// Main execution
(async function() {
  console.log("Starting JS to TS migration...");
  
  // Get all JavaScript files
  const jsFiles = getAllFiles(SRC_DIR);
  console.log(`Found ${jsFiles.length} JavaScript files to migrate`);
  
  // Convert each file
  for (const jsFile of jsFiles) {
    await convertJsToTs(jsFile);
  }
  
  // Update imports to reference TypeScript files
  updateImportsInFiles();
  
  console.log("\nMigration completed!");
  console.log("\nNext steps:");
  console.log("1. Run 'npm run build' to check for type errors");
  console.log("2. Manually review and fix any TypeScript errors");
  console.log("3. After confirming everything works, remove original JS files");
})();