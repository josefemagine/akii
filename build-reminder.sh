#!/bin/bash

echo "Setting up build reminder for Akii project"

# Function to run build
run_build() {
  echo "\n\n=============================================="
  echo "REMINDER: Running build to catch errors early"
  echo "==============================================\n"
  npm run build-no-errors
  echo "\n\n=============================================="
  echo "Build completed. Check for any errors above."
  echo "==============================================\n"
}

# Initial build
run_build

# Set up reminder every 2 hours
while true; do
  echo "Next build will run in 2 hours..."
  sleep 7200
  run_build
done
