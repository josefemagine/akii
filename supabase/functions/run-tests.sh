#!/bin/bash

# Kill any existing Deno processes
pkill -f "deno"

# Start the test server
echo "Starting test server..."
deno run --allow-net --allow-read --watch test-runner.ts 