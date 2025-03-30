#!/bin/bash

# Check if a migration file is provided
if [ -z "$1" ]; then
  echo "Error: No migration file specified"
  echo "Usage: ./run-migration.sh <path-to-migration-file>"
  exit 1
fi

# Check if the file exists
if [ ! -f "$1" ]; then
  echo "Error: Migration file '$1' not found"
  exit 1
fi

# Read the SQL content from the file
SQL_CONTENT=$(cat "$1")

# Escape the SQL content for JSON
ESCAPED_SQL=$(echo "$SQL_CONTENT" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')

# Get environment variables with fallback for project ID
PROJECT_ID=${SUPABASE_PROJECT_ID:-"injxxchotrvgvvzelhvj"}
SERVICE_KEY=${SUPABASE_SERVICE_KEY}

# Check if service key is set
if [ -z "$SERVICE_KEY" ]; then
  echo "Error: Required environment variable SUPABASE_SERVICE_KEY is not set"
  exit 1
fi

# Create the JSON payload
JSON_PAYLOAD="{\"query\": \"$ESCAPED_SQL\"}"

# Execute the SQL query using curl
echo "Executing SQL migration from $1..."
echo "Using Supabase Project ID: $PROJECT_ID"
curl -s -X POST "https://api.supabase.com/projects/$PROJECT_ID/sql" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD"

# Check if curl command was successful
if [ $? -eq 0 ]; then
  echo "\nMigration executed successfully!"
else
  echo "\nError executing migration"
  exit 1
fi
