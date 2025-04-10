#!/bin/bash

# Fix Import Extensions Script
# This script finds and removes .ts/.tsx extensions from import statements

# Navigate to project root
cd $(dirname $0)/../..
PROJECT_ROOT=$(pwd)
echo "Project root: $PROJECT_ROOT"

# Create temp directory for backups
BACKUP_DIR="$PROJECT_ROOT/import-extension-backups"
mkdir -p "$BACKUP_DIR"
echo "Created backup directory: $BACKUP_DIR"

# Find files that might have import statements with .ts or .tsx extensions
echo "Searching for files with import statements containing .ts or .tsx extensions..."
FILES=$(grep -l "from ['\"].*\.\(ts\|tsx\)['\"]" --include="*.ts" --include="*.tsx" -r src/ 2>/dev/null)

if [ -z "$FILES" ]; then
  echo "No files found with import extension issues"
  exit 0
fi

# Count of files to process
FILE_COUNT=$(echo "$FILES" | wc -l | tr -d ' ')
echo "Found $FILE_COUNT files to process"

# Function to fix import extensions
fix_import_extensions() {
  local file=$1
  echo "Processing $file"
  
  # Create backup
  cp "$file" "$BACKUP_DIR/$(basename $file).bak"
  
  # Use sed to remove .ts and .tsx extensions from import statements
  TEMP_FILE=$(mktemp)
  
  # Replace import statements ending with .ts or .tsx
  sed -E "s/(from[[:space:]]+['\"][^'\"]+)\.(ts|tsx)(['\"][[:space:]]*)/\1\3/g" "$file" > "$TEMP_FILE"
  
  # Count how many were fixed
  IMPORT_COUNT=$(diff -U0 "$file" "$TEMP_FILE" | grep -c '^-.*from.*\.\(ts\|tsx\)')
  
  # Update file
  mv "$TEMP_FILE" "$file"
  echo "✅ Fixed $IMPORT_COUNT imports in $file"
  
  return $IMPORT_COUNT
}

# Process each file
FIXED_COUNT=0
TOTAL_IMPORTS_FIXED=0

for file in $FILES; do
  echo -n "[$((FIXED_COUNT+1))/$FILE_COUNT] "
  fix_import_extensions "$file"
  IMPORTS_FIXED=$?
  TOTAL_IMPORTS_FIXED=$((TOTAL_IMPORTS_FIXED + IMPORTS_FIXED))
  FIXED_COUNT=$((FIXED_COUNT+1))
done

echo
echo "✨ Done! Fixed $TOTAL_IMPORTS_FIXED imports in $FIXED_COUNT files."
echo "Backups saved to $BACKUP_DIR"
echo
echo "To restore all backups, run:"
echo "  cp $BACKUP_DIR/* $PROJECT_ROOT/src/" 