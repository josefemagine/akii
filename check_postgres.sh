#!/bin/bash

echo "Checking Supabase Functions for Postgres Integration"
echo "==================================================="
echo

# Find all function directories
FUNCTIONS_DIR="supabase/functions"
FUNCTIONS=$(find "$FUNCTIONS_DIR" -mindepth 1 -maxdepth 1 -type d -not -name "_shared" | sort)

echo "Found $(echo "$FUNCTIONS" | wc -l | tr -d ' ') functions to check."
echo

# Count stats
total=0
postgres_ok=0
needs_update=0
no_db=0

echo "| Function | Status | Notes |"
echo "| --- | --- | --- |"

# Check each function
for func_path in $FUNCTIONS; do
  func_name=$(basename "$func_path")
  index_file="$func_path/index.ts"
  total=$((total + 1))
  
  # Skip test function
  if [[ "$func_name" == "test-function" ]]; then
    echo "| $func_name | 🔓 Excluded | Test function |"
    continue
  fi
  
  # Check if the file exists
  if [[ ! -f "$index_file" ]]; then
    echo "| $func_name | ❌ Error | index.ts file not found |"
    continue
  fi
  
  # Check for postgres import
  if grep -q "from \"../\_shared/postgres.ts\"" "$index_file"; then
    postgres_import=true
  else
    postgres_import=false
  fi
  
  # Check for Supabase client
  if grep -q -E "createClient|supabase\.|\.from\(|createAuthClient" "$index_file"; then
    supabase_client=true
  else
    supabase_client=false
  fi
  
  # Check for database interaction
  if grep -q -E "\.from\(|select|insert|update|delete" "$index_file"; then
    db_interaction=true
  else
    db_interaction=false
  fi
  
  # Determine status
  if [[ "$postgres_import" == "true" && "$supabase_client" == "false" ]]; then
    echo "| $func_name | ✅ OK | Using Postgres utilities |"
    postgres_ok=$((postgres_ok + 1))
  elif [[ "$supabase_client" == "true" ]]; then
    echo "| $func_name | ⚠️ Needs Update | Using Supabase client |"
    needs_update=$((needs_update + 1))
  elif [[ "$db_interaction" == "false" ]]; then
    echo "| $func_name | ℹ️ No DB | No database interaction |"
    no_db=$((no_db + 1))
  else
    echo "| $func_name | ⚠️ Check | May need Postgres utilities |"
    needs_update=$((needs_update + 1))
  fi
done

echo
echo "Summary:"
echo "--------"
echo "Total functions: $total"
echo "Using Postgres utilities: $postgres_ok"
echo "Need updates: $needs_update"
echo "No database interaction: $no_db" 