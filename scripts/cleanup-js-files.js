const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const SRC_DIR = path.join(process.cwd(), 'src');
const EXTENSIONS_TO_REMOVE = ['.js', '.jsx'];
const SKIP_DIRS = ['node_modules', 'dist', 'build', '.git'];

// Helper functions
function getAllJavaScriptFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !SKIP_DIRS.includes(file)) {
      getAllJavaScriptFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (EXTENSIONS_TO_REMOVE.includes(ext)) {
        // Check if TypeScript equivalent exists
        const tsxPath = path.join(
          path.dirname(filePath),
          `${path.basename(filePath, path.extname(filePath))}.tsx`
        );
        
        if (fs.existsSync(tsxPath)) {
          fileList.push({
            jsPath: filePath,
            tsxPath: tsxPath
          });
        }
      }
    }
  });

  return fileList;
}

// Set up readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Main execution
(async function() {
  console.log("Starting JavaScript file cleanup...");
  
  // Get all JavaScript files with TypeScript equivalents
  const jsFiles = getAllJavaScriptFiles(SRC_DIR);
  console.log(`Found ${jsFiles.length} JavaScript files with TypeScript equivalents`);
  
  if (jsFiles.length === 0) {
    console.log("No files to clean up. Exiting.");
    rl.close();
    return;
  }
  
  console.log("\nThe following JavaScript files will be deleted:");
  jsFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file.jsPath} (TypeScript equivalent: ${file.tsxPath})`);
  });
  
  rl.question('\nAre you sure you want to delete these files? (yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
      jsFiles.forEach(file => {
        fs.unlinkSync(file.jsPath);
        console.log(`Deleted: ${file.jsPath}`);
      });
      console.log("\nCleanup completed!");
    } else {
      console.log("Operation cancelled. No files were deleted.");
    }
    rl.close();
  });
})();