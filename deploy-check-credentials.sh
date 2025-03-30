#!/bin/bash

# This script checks if the required Supabase credentials are available
# and exports them from the environment if they exist

# Check for SUPABASE_PROJECT_ID
if [ -z "${SUPABASE_PROJECT_ID}" ]; then
  echo "SUPABASE_PROJECT_ID is not set, using default value 'injxxchotrvgvvzelhvj'"
  export SUPABASE_PROJECT_ID="injxxchotrvgvvzelhvj"
else
  echo "SUPABASE_PROJECT_ID is set to ${SUPABASE_PROJECT_ID}"
fi

# Check for SUPABASE_SERVICE_KEY
if [ -z "${SUPABASE_SERVICE_KEY}" ]; then
  echo "ERROR: SUPABASE_SERVICE_KEY is not set"
  echo "Please set this environment variable before running migrations or deployments"
  exit 1
else
  echo "SUPABASE_SERVICE_KEY is set (value hidden for security)"
fi

# Check for SUPABASE_URL
if [ -z "${SUPABASE_URL}" ]; then
  echo "SUPABASE_URL is not set, constructing from project ID"
  export SUPABASE_URL="https://${SUPABASE_PROJECT_ID}.supabase.co"
  echo "Set SUPABASE_URL to ${SUPABASE_URL}"
else
  echo "SUPABASE_URL is set to ${SUPABASE_URL}"
fi

# Check for SUPABASE_ANON_KEY
if [ -z "${SUPABASE_ANON_KEY}" ]; then
  echo "WARNING: SUPABASE_ANON_KEY is not set"
else
  echo "SUPABASE_ANON_KEY is set (value hidden for security)"
fi

echo "Credential check complete"
