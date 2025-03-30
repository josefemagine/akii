#!/bin/bash

# Set the Supabase project ID
SUPABASE_PROJECT_ID="injxxchotrvgvvzelhvj"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Error: supabase CLI is not installed or not in PATH"
  echo "Installing supabase CLI globally..."
  npm install -g supabase
fi

# Generate types
echo "Generating Supabase types for project: $SUPABASE_PROJECT_ID"
npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > src/types/supabase.ts

echo "Types generated successfully in src/types/supabase.ts"
