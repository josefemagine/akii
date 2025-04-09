#!/bin/bash

# Script to update all Deno function configurations to use the root imports

echo "Updating Deno function configurations..."

# Loop through all deno.json files in the functions directory
for file in $(find supabase/functions -name "deno.json" -not -path "supabase/functions/deno.json"); do
  echo "Processing $file"
  
  # Create backup
  cp "$file" "${file}.backup"
  
  # Get directory name for tasks
  dirname=$(basename $(dirname "$file"))
  
  # Create new content with reference to root imports
  cat > "$file" << EOF
{
  "tasks": {
    "dev": "deno run --allow-net --allow-read --allow-env index.ts",
    "deploy": "supabase functions deploy $dirname"
  },
  "imports": "../deno.json"
}
EOF

  echo "Updated $file"
done

echo "All Deno configurations updated successfully."
echo "You can find backups of the original files with .backup extension." 