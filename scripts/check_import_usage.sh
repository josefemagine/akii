#!/bin/bash

# Script to check for imports in TypeScript files

echo "Checking for imports in TypeScript files..."

# Search for direct URL imports
echo "Files with direct URL imports:"
grep -r "import.*from \"https://" --include="*.ts" supabase/functions | grep -v "deno.json" | grep -v "import_map.json"

echo ""
echo "Files importing from _shared directory:"
grep -r "import.*from \"../_shared" --include="*.ts" supabase/functions

echo ""
echo "Most common import patterns:"
grep -r "import.*from" --include="*.ts" supabase/functions | grep -v "deno.json" | sed 's/.*import \(.*\) from \"\(.*\)\".*/\2/' | sort | uniq -c | sort -nr | head -20 