#!/bin/bash

# Generate Supabase types with hardcoded project ID
echo "Generating Supabase types with project ID: injxxchotrvgvvzelhvj"
npx supabase gen types typescript --project-id injxxchotrvgvvzelhvj > src/types/supabase.ts
echo "Types generated successfully in src/types/supabase.ts"
