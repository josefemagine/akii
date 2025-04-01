#!/bin/bash

# Apply security fixes script
echo "Applying Supabase security fixes"

# Default environment is local
ENV=${1:-local}

if [ "$ENV" == "local" ]; then
  echo "Applying security fixes to local Supabase instance..."
  # Apply migrations to local environment
  npx supabase db push

elif [ "$ENV" == "remote" ]; then
  echo "Applying security fixes to remote Supabase instance..."
  
  # Apply migrations to remote environment
  npx supabase db push --db-url "$SUPABASE_DB_URL"
  
  # OR execute the SQL directly through the Supabase client
  # This is useful if you don't have direct DB access but have API access
  echo "If the above command fails due to lack of direct DB access, you can run the SQL directly:"
  echo "1. Go to the Supabase dashboard"
  echo "2. Open the SQL Editor"
  echo "3. Paste and execute the contents of both migrations:"
  echo "   - ./supabase/migrations/20240719000001_fix_function_search_paths.sql"
  echo "   - ./supabase/migrations/20240719000002_fix_vector_extension.sql"
  
  # Note: Moving the vector extension requires superuser privileges and
  # may need to be executed by the Supabase support team if you don't have superuser access.
else
  echo "Unknown environment: $ENV"
  echo "Usage: $0 [local|remote]"
  exit 1
fi

echo "Security fixes applied!" 