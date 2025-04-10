#!/bin/bash

# Fix Interface Names Script
# This script finds and fixes interface names with dashes in TypeScript files

# Navigate to project root
cd $(dirname $0)/../..
PROJECT_ROOT=$(pwd)
echo "Project root: $PROJECT_ROOT"

# Create temp directory for backups
BACKUP_DIR="$PROJECT_ROOT/interface-name-backups"
mkdir -p "$BACKUP_DIR"
echo "Created backup directory: $BACKUP_DIR"

# Find files that might have interface definitions with dashes
echo "Searching for TypeScript files with potential interface name issues..."
FILES=$(grep -l "interface [a-zA-Z0-9-]\+Props" --include="*.ts" --include="*.tsx" -r src/ 2>/dev/null)

if [ -z "$FILES" ]; then
  echo "No files found with interface dash issues"
  exit 0
fi

# Count of files to process
FILE_COUNT=$(echo "$FILES" | wc -l | tr -d ' ')
echo "Found $FILE_COUNT files to process"

# Function to fix interface names
fix_interface_names() {
  local file=$1
  echo "Processing $file"
  
  # Create backup
  cp "$file" "$BACKUP_DIR/$(basename $file).bak"
  
  # Use sed to find and replace interface names with dashes
  # Pattern: interface name-with-dashes -> interface NameWithDashes
  # This is a simplified approach and might need adjustment for complex cases
  TEMP_FILE=$(mktemp)
  
  # First, find interfaces with dashes and convert to PascalCase
  sed 's/interface \([a-z][a-z0-9]*\)-\([a-z][a-z0-9]*\)\(-[a-z][a-z0-9]*\)*Props/interface \u\1\u\2\3Props/g' "$file" > "$TEMP_FILE"
  
  # Update file
  mv "$TEMP_FILE" "$file"
  echo "✅ Fixed $file"
}

# Process each file
FIXED_COUNT=0
for file in $FILES; do
  echo -n "[$((FIXED_COUNT+1))/$FILE_COUNT] "
  fix_interface_names "$file"
  FIXED_COUNT=$((FIXED_COUNT+1))
done

echo
echo "✨ Done! Fixed $FIXED_COUNT files."
echo "Backups saved to $BACKUP_DIR"
echo
echo "To restore all backups, run:"
echo "  cp $BACKUP_DIR/* $PROJECT_ROOT/src/" 