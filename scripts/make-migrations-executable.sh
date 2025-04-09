#!/bin/bash
set -e

echo "Making migration files executable..."

# Find all SQL migration files
MIGRATION_FILES=$(find supabase/migrations -name "*.sql" -type f)

# Make each file executable
for file in $MIGRATION_FILES; do
  chmod +x "$file"
  echo "Made executable: $file"
done

# Make reset script executable too
if [ -f "reset-supabase.sh" ]; then
  chmod +x reset-supabase.sh
  echo "Made executable: reset-supabase.sh"
fi

echo "Done!" 