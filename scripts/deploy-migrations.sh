#!/bin/bash

# Script to deploy Supabase migrations using the Supabase CLI
# This provides a reliable way to push migrations to your Supabase project

# Set error handling
set -e

# Variables
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
MAIN_DIR="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$MAIN_DIR/supabase/migrations"
LOG_FILE="$MAIN_DIR/deploy-migrations.log"

# Function for logging
log() {
  echo "[$(date "+%Y-%m-%d %H:%M:%S")] $1" | tee -a "$LOG_FILE"
}

# Create log directory if needed
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"

# Check if Supabase CLI is installed
if ! command -v npx &> /dev/null; then
  log "Error: npx not found. Please install Node.js and npm."
  exit 1
fi

# Display information
log "Starting Supabase migration deployment"
log "Migrations directory: $MIGRATIONS_DIR"
log "Working directory: $MAIN_DIR"

# Ensure we're in the correct directory
cd "$MAIN_DIR"

# Check for migrations
migration_count=$(find "$MIGRATIONS_DIR" -name "*.sql" | wc -l | tr -d ' ')
if [ "$migration_count" -eq 0 ]; then
  log "No migrations found in $MIGRATIONS_DIR"
  exit 0
fi

log "Found $migration_count migration files"

# Execute migrations
log "Executing migrations using Supabase CLI"
npx supabase db push

# Check for errors
if [ $? -ne 0 ]; then
  log "Error: Migration failed. Please check the Supabase CLI output above."
  exit 1
fi

log "Migrations completed successfully"

# Final instructions
echo ""
echo "=== NEXT STEPS ==="
echo "1. Restart your application"
echo "2. Verify the database changes"
echo ""

exit 0 