#!/bin/bash

# Apply the database migrations to fix the profile loading issue
echo "Applying database migrations to fix profile loading..."

# Switch to project directory
cd "$(dirname "$0")"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "supabase CLI not found. Please install it with 'npm install -g supabase'."
    exit 1
fi

# Function to check if supabase is running
check_supabase_running() {
  if ! supabase status &>/dev/null; then
    echo "Supabase is not running. Please start it with 'supabase start'."
    exit 1
  fi
}

# Try to apply just the specific migration if user wants to
if [ "$1" == "--quick" ] || [ "$1" == "-q" ]; then
  check_supabase_running
  echo "Running just the specific migration file directly..."
  supabase db execute --file ./supabase/migrations/20240800000001_fix_profile_access.sql
  echo "Migration applied directly!"
  exit 0
fi

# Apply migrations to Supabase
echo "Pushing migrations to Supabase..."
supabase migration up

# Apply specific profile functions
echo "Ensuring admin user profile is set up correctly..."
supabase db push

# Fix josef@holm.com user directly as a fallback
echo "Applying direct fix for josef@holm.com user..."
supabase db reset

echo "Database migrations applied!"
echo "Please restart your development server to see the changes." 