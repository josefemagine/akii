#!/bin/bash

# Script to fix the profile loading issue for josef@holm.com
echo "Running profile fix script..."

# Switch to project directory
cd "$(dirname "$0")"

# Check if ts-node is installed
if ! command -v npx &> /dev/null; then
    echo "npx not found. Please install it with 'npm install -g npx'."
    exit 1
fi

# Run the TypeScript file
echo "Executing fix script..."
npx ts-node -T fix-profile-directly.ts

echo "Script execution complete."
echo "Please restart your development server to see the changes." 