#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define status categories
const Status = {
  OK: "✅ Using Postgres utilities correctly",
  NEEDS_UPDATE: "⚠️ Needs update (using direct Supabase client)",
  NO_DB_INTERACTION: "ℹ️ No database interaction detected",
  EXCLUDED: "🔓 Intentionally excluded (test function)",
};

// Initialize function statistics
const stats = {
  total: 0,
  usesPostgres: 0,
  usesSupabase: 0,
  noDbInteraction: 0,
  excluded: 0,
};

// Define patterns to look for
const postgresImportPattern = /import\s+.*\{\s*.*(?:query|queryOne|execute).*\}\s+from\s+["']\.\.\/\_shared\/postgres\.ts["']/;
const supabaseClientPattern = /(?:createClient|supabase\.|createAuthClient.*supabase)/;
// Patterns that indicate database interaction
const dbInteractionPatterns = [
  /\.from\(["'`].+["'`]\)/,
  /\bselect\s*\(/i,
  /\binsert\s+into\b/i,
  /\bupdate\b.+\bset\b/i,
  /\bdelete\s+from\b/i,
];

// Functions to exclude (test functions, etc.)
const excludeFunctions = ["test-function"];

// Main function to check Postgres integration
function checkPostgresIntegration() {
  console.log("Checking functions for Postgres integration...\n");
  
  // Get all function directories
  const basePath = "supabase/functions";
  const functionDirs = fs.readdirSync(basePath)
    .filter(name => fs.statSync(path.join(basePath, name)).isDirectory() && name !== "_shared")
    .sort();
  
  console.log(`Found ${functionDirs.length} functions to check.\n`);
  
  // Table headers
  console.log("| Function | Status | Notes |");
  console.log("| --- | --- | --- |");
  
  // Check each function
  for (const functionName of functionDirs) {
    stats.total++;
    
    // Skip excluded functions
    if (excludeFunctions.includes(functionName)) {
      console.log(`| ${functionName} | ${Status.EXCLUDED} | Intentionally excluded |`);
      stats.excluded++;
      continue;
    }
    
    const indexPath = path.join(basePath, functionName, "index.ts");
    let fileContent;
    
    try {
      fileContent = fs.readFileSync(indexPath, 'utf8');
    } catch (error) {
      console.log(`| ${functionName} | ❌ Error | Could not read file: ${error.message} |`);
      continue;
    }
    
    // Check for Postgres utilities
    const usesPostgresUtil = postgresImportPattern.test(fileContent);
    
    // Check for direct Supabase client usage
    const usesSupabaseClient = supabaseClientPattern.test(fileContent);
    
    // Check for database interaction signs
    const hasDbInteraction = dbInteractionPatterns.some(pattern => pattern.test(fileContent));
    
    // Determine status
    let status;
    let notes = "";
    
    if (usesPostgresUtil && !usesSupabaseClient) {
      status = Status.OK;
      stats.usesPostgres++;
    } else if (usesSupabaseClient) {
      status = Status.NEEDS_UPDATE;
      stats.usesSupabase++;
      notes = "Direct Supabase client usage detected";
    } else if (!hasDbInteraction) {
      status = Status.NO_DB_INTERACTION;
      stats.noDbInteraction++;
      notes = "No database interaction detected";
    } else {
      status = Status.NEEDS_UPDATE;
      stats.usesSupabase++;
      notes = "Database interaction without Postgres utilities";
    }
    
    console.log(`| ${functionName} | ${status} | ${notes} |`);
  }
  
  // Summary statistics
  console.log("\nSummary:");
  console.log(`Total functions: ${stats.total}`);
  console.log(`Using Postgres utilities: ${stats.usesPostgres}`);
  console.log(`Need updates: ${stats.usesSupabase}`);
  console.log(`No DB interaction: ${stats.noDbInteraction}`);
  console.log(`Excluded: ${stats.excluded}`);
}

// Run the check
checkPostgresIntegration(); 