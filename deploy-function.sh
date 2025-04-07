#!/bin/bash

# Get current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Deploying from directory: $DIR"

# Check if SUPABASE_ACCESS_TOKEN is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "SUPABASE_ACCESS_TOKEN is not set. Please set it first."
  echo "export SUPABASE_ACCESS_TOKEN=your_token_here"
  exit 1
fi

# Deploy the function
echo "Deploying super-action function with legacy bundle option..."
npx supabase functions deploy super-action --legacy-bundle 