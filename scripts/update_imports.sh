#!/bin/bash

# Script to update imports in TypeScript files to use the import maps

echo "Updating imports in TypeScript files..."

# Function to update imports in a file
update_imports() {
  local file=$1
  echo "Processing $file"
  
  # Create backup
  cp "$file" "${file}.backup"
  
  # Update Supabase import
  sed -i '.sed-backup' 's|import createClient from "https://esm.sh/@supabase/supabase-js@2";|import createClient from "@supabase/supabase-js";|g' "$file"
  
  # Update Postgres import
  sed -i '.sed-backup' 's|import { Pool, PoolClient } from "https://deno.land/x/postgres@v0.17.0/mod.ts";|import { Pool, PoolClient } from "postgres/mod.ts";|g' "$file"
  
  # Update std imports
  sed -i '.sed-backup' 's|import \(.*\) from "https://deno.land/std@[0-9.]\+/\(.*\)";|import \1 from "std/\2";|g' "$file"
  
  # Update CORS import
  sed -i '.sed-backup' 's|import { corsHeaders } from "../_shared/cors.ts";|import { corsHeaders } from "cors";|g' "$file"
  
  # Clean up sed backup files
  rm -f "${file}.sed-backup"
  
  echo "Updated $file"
}

# Find all TypeScript files in the _shared directory and update them
for file in $(find supabase/functions/_shared -name "*.ts"); do
  update_imports "$file"
done

echo "All imports in _shared directory have been updated."
echo "You can find backups of the original files with .backup extension."

# Note: For a full migration, you would need to:
# 1. Update all TypeScript files in the project
# 2. Test each function to ensure it works with the new import system
echo ""
echo "Next steps:"
echo "1. Run the update_deno_configs.sh script to update all deno.json files"
echo "2. Test each function to ensure it works with the new import system"
echo "3. Once everything is working, you can remove the backup files"