/**
 * This script updates imports across all Deno functions to use standardized imports
 */

// Standard library imports
// @ts-ignore - Deno imports will be resolved by Deno's import system
import { walk } from "https://deno.land/std@0.178.0/fs/walk.ts";
// @ts-ignore - Deno imports will be resolved by Deno's import system
import { join } from "https://deno.land/std@0.178.0/path/mod.ts";

// Type declarations for Deno runtime APIs
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  export function readTextFile(path: string): Promise<string>;
  export function writeTextFile(path: string, data: string): Promise<void>;
  export const env: Env;
}

// Path to the functions directory 
const FUNCTIONS_DIR = "./";

// Import mappings to standardize
const replacements = [
  // Supabase client imports
  {
    pattern: /import\s+createClient\s+from\s+["']https:\/\/esm\.sh\/@supabase\/supabase-js@2["'];/g,
    replacement: 'import { createClient } from "supabase-js";'
  },
  {
    pattern: /import\s+{\s*createClient\s*}\s+from\s+["']https:\/\/esm\.sh\/@supabase\/supabase-js@2["'];/g,
    replacement: 'import { createClient } from "supabase-js";'
  },
  {
    pattern: /import\s+createClient\s+from\s+["']@supabase\/supabase-js["'];/g,
    replacement: 'import { createClient } from "supabase-js";'
  },
  
  // Postgres imports
  {
    pattern: /import\s+{\s*Pool,\s*PoolClient\s*}\s+from\s+["']https:\/\/deno\.land\/x\/postgres@v0\.17\.0\/mod\.ts["'];/g,
    replacement: 'import { Pool, PoolClient } from "postgres";'
  },
  {
    pattern: /import\s+{\s*Pool,\s*PoolClient\s*}\s+from\s+["']postgres\/mod\.ts["'];/g,
    replacement: 'import { Pool, PoolClient } from "postgres";'
  }
];

// Process a single file
async function processFile(filePath: string): Promise<boolean> {
  try {
    const content = await Deno.readTextFile(filePath);
    
    // Skip if no replacements needed
    let hasChanges = false;
    let newContent = content;
    
    // Apply all replacements
    for (const { pattern, replacement } of replacements) {
      if (pattern.test(newContent)) {
        newContent = newContent.replace(pattern, replacement);
        hasChanges = true;
      }
    }
    
    // Write changes back if needed
    if (hasChanges) {
      await Deno.writeTextFile(filePath, newContent);
      console.log(`Updated imports in ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  console.log("Standardizing imports across Deno functions...");
  
  let totalFiles = 0;
  let updatedFiles = 0;
  
  // Process all TypeScript files
  for await (const entry of walk(FUNCTIONS_DIR, { 
    exts: [".ts"],
    skip: [/\.git/] 
  })) {
    if (entry.isFile) {
      totalFiles++;
      const updated = await processFile(entry.path);
      if (updated) updatedFiles++;
    }
  }
  
  console.log(`\nSummary:`);
  console.log(`- Total TypeScript files checked: ${totalFiles}`);
  console.log(`- Files with standardized imports: ${updatedFiles}`);
  console.log("Done!");
}

// Run the script
// For Deno runtime
// @ts-ignore
if (typeof Deno !== 'undefined' && Deno.args) {
  main().catch(console.error);
} 