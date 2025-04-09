#!/bin/bash

echo "Applying fixes to Supabase without full reset..."

# Create temporary SQL file for applying fixes
TMP_SQL=$(mktemp)
cat > "$TMP_SQL" << EOF
-- Apply the fixed document schema
$(cat supabase/migrations/20240401000001_document_schema_fixed.sql)

-- Apply the fixed ensure_profile_exists function
$(cat src/migrations/ensure_profile_exists.sql)

-- Ensure admin user exists
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'josef@holm.com', '{"role":"admin"}', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = NOW();

-- Ensure admin profile exists
INSERT INTO public.profiles (id, email, role, status, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'josef@holm.com', 'admin', 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = NOW();
EOF

# Apply the SQL
echo "Executing SQL for fixes..."
psql postgres://postgres:postgres@localhost:54322/postgres -f "$TMP_SQL"

# Clean up
rm "$TMP_SQL"

echo "Fixes applied successfully!"
echo "Please restart your development server to see the changes." 