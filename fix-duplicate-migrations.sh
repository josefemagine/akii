#!/bin/bash
# Script to fix duplicate migrations in Supabase by directly cleaning schema_migrations table

echo "===== Fixing duplicate migrations in Supabase ====="

# Set PATH to include PostgreSQL client utilities
export PATH="/usr/local/opt/libpq/bin:$PATH"

# Stop Supabase if it's running
echo "Stopping Supabase..."
supabase stop || true

# Create temporary SQL fix script
cat > /tmp/fix_migration_dupes.sql << 'EOL'
-- Script to delete duplicate migrations from schema_migrations table
BEGIN;
-- Check for schema_migrations table
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'supabase_migrations' AND tablename = 'schema_migrations') THEN
    -- First create a backup of the table just in case
    CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations_backup AS 
    SELECT * FROM supabase_migrations.schema_migrations;
    
    -- Delete duplicate records keeping only one instance of each version
    DELETE FROM supabase_migrations.schema_migrations a
    WHERE a.ctid <> (
        SELECT MIN(b.ctid)
        FROM supabase_migrations.schema_migrations b
        WHERE a.version = b.version
    );
    
    -- Fix any null statements
    UPDATE supabase_migrations.schema_migrations
    SET statements = '[]'::jsonb
    WHERE statements IS NULL;
    
    RAISE NOTICE 'Migration table cleaned';
  ELSE
    RAISE NOTICE 'schema_migrations table does not exist yet';
  END IF;
END $$;
COMMIT;
EOL

echo "Starting Supabase in the background (this will fail, but it will create the database)..."
supabase start > /dev/null 2>&1 &
sleep 5
echo "Stopping any running instances..."
supabase stop || true
sleep 2

echo "Connecting to PostgreSQL to fix migrations..."
# Connect to Postgres and run the fix script
PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres -f /tmp/fix_migration_dupes.sql || {
    echo "Failed to connect to PostgreSQL. Attempting to start Supabase first..."
    supabase start > /dev/null 2>&1 &
    sleep 10
    supabase stop
    sleep 2
    PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres -f /tmp/fix_migration_dupes.sql
}

echo "Cleaning up temporary files..."
rm /tmp/fix_migration_dupes.sql

echo "Starting Supabase with all migrations..."
supabase start

echo "Migrations fixed and Supabase started!"
echo "Now running the admin user migration..."

# Apply our admin user migration
PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres -f supabase/migrations/99999999999999_ensure_admin.sql

echo "Admin user migration applied successfully!" 