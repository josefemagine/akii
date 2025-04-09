#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a file contains a string
contains_string() {
  grep -q "$2" "$1"
  return $?
}

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Determine functions directory
if [[ "$SCRIPT_DIR" == */supabase/functions ]]; then
  # Already in the functions directory
  FUNCTIONS_DIR="$SCRIPT_DIR"
  RELATIVE_PATH="."
else
  # Need to add path
  FUNCTIONS_DIR="$SCRIPT_DIR/supabase/functions"
  RELATIVE_PATH="./supabase/functions"
  
  # If that doesn't exist, try current directory
  if [ ! -d "$FUNCTIONS_DIR" ]; then
    FUNCTIONS_DIR="."
    RELATIVE_PATH="."
  fi
fi

# Get all function directories
FUNCTIONS=$(find "$FUNCTIONS_DIR" -type d -mindepth 1 -maxdepth 1 -not -path "*/\.*" -not -path "*/_*")

# Headers for the report
echo -e "${GREEN}=== Postgres and Auth Utilities Usage Check ===${NC}"
echo -e "Checking functions in: $FUNCTIONS_DIR"
echo

# Counters for stats
TOTAL_FUNCTIONS=0
AUTH_COMPLIANT=0
POSTGRES_COMPLIANT=0
BOTH_COMPLIANT=0
EXEMPT_FUNCTIONS=0

# List of functions that don't need database interaction
EXEMPT_FUNCTIONS_LIST=(
  "process_document"
  "check_edge_functions"
  "admin-update-user"
  "health-check"
  "test-function"
)

# Check each function directory
for FUNC_DIR in $FUNCTIONS; do
  FUNC_NAME=$(basename "$FUNC_DIR")
  INDEX_FILE="$FUNC_DIR/index.ts"
  
  # Skip _shared directory
  if [[ "$FUNC_NAME" == "_shared" ]]; then
    continue
  fi
  
  # Skip our utility scripts
  if [[ "$FUNC_NAME" == "check-postgres-usage.sh" || "$FUNC_NAME" == "update-function.sh" ]]; then
    continue
  fi
  
  ((TOTAL_FUNCTIONS++))
  
  echo -e "${GREEN}Checking: ${NC}$FUNC_NAME"
  
  # Check if function exists in exempt list
  EXEMPT=false
  for EXEMPT_FUNC in "${EXEMPT_FUNCTIONS_LIST[@]}"; do
    if [[ "$FUNC_NAME" == "$EXEMPT_FUNC" ]]; then
      EXEMPT=true
      ((EXEMPT_FUNCTIONS++))
      echo -e "  ${YELLOW}Status: ${NC}Exempt from database checks"
      break
    fi
  done
  
  # Check if index.ts exists
  if [ ! -f "$INDEX_FILE" ]; then
    echo -e "  ${RED}Error: ${NC}index.ts not found"
    continue
  fi
  
  # Check for auth utilities
  AUTH_OK=false
  if contains_string "$INDEX_FILE" "import.*from \"../\_shared/auth"; then
    AUTH_OK=true
    ((AUTH_COMPLIANT++))
    echo -e "  ${GREEN}Auth: ${NC}Using shared auth utilities ✅"
  else
    echo -e "  ${RED}Auth: ${NC}Not using shared auth utilities ❌"
  fi
  
  # Check for Postgres utilities
  POSTGRES_OK=false
  if [ "$EXEMPT" = true ]; then
    echo -e "  ${YELLOW}Postgres: ${NC}Exempt from Postgres checks"
    POSTGRES_OK=true
    ((POSTGRES_COMPLIANT++))
  elif contains_string "$INDEX_FILE" "import.*from \"../\_shared/postgres"; then
    POSTGRES_OK=true
    ((POSTGRES_COMPLIANT++))
    echo -e "  ${GREEN}Postgres: ${NC}Using shared Postgres utilities ✅"
  else
    echo -e "  ${RED}Postgres: ${NC}Not using shared Postgres utilities ❌"
  fi
  
  # Check for handleRequest pattern
  if contains_string "$INDEX_FILE" "handleRequest"; then
    echo -e "  ${GREEN}Pattern: ${NC}Using handleRequest pattern ✅"
  else
    echo -e "  ${RED}Pattern: ${NC}Not using handleRequest pattern ❌"
  fi
  
  # Count compliant functions
  if [ "$AUTH_OK" = true ] && [ "$POSTGRES_OK" = true ]; then
    ((BOTH_COMPLIANT++))
  fi
  
  echo
done

# Print summary
echo -e "${GREEN}=== Summary ===${NC}"
echo -e "Total functions checked: $TOTAL_FUNCTIONS"
echo -e "Functions with shared auth utilities: $AUTH_COMPLIANT"
echo -e "Functions with Postgres utilities: $POSTGRES_COMPLIANT"
echo -e "Functions exempt from database checks: $EXEMPT_FUNCTIONS"
echo -e "Fully compliant functions: $BOTH_COMPLIANT"

if [ $BOTH_COMPLIANT -eq $((TOTAL_FUNCTIONS)) ]; then
  echo -e "${GREEN}All functions are compliant! ✅${NC}"
else
  echo -e "${YELLOW}Some functions may need updates. Please check the report above.${NC}"
  echo -e "${YELLOW}You can use $RELATIVE_PATH/update-function.sh to add missing imports.${NC}"
fi 