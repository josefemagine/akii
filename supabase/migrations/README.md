# Supabase Migrations

This directory contains database migrations for the Supabase project.

## How to Run Migrations

1. Make sure you have the Supabase CLI installed:
   ```bash
   npm install -g supabase
   ```

2. Configure your Supabase project:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   supabase link --project-ref [YOUR_PROJECT_ID]
   ```

4. Run the migrations:
   ```bash
   supabase db push
   ```

## Migration Files

- `20240631000001_create_profiles_table.sql`: Creates the profiles table with the proper schema for user authentication and role management.

## Creating New Migrations

To create a new migration file:

```bash
supabase migration new [migration_name]
```

This will create a new timestamped migration file in the migrations directory.

## Manual Database Setup

If you're unable to run migrations through the CLI, you can also manually:

1. Go to the Supabase Dashboard
2. Navigate to your project
3. Go to the SQL Editor
4. Copy the contents of the migration files
5. Execute the SQL queries

## Setting Up Admin Users

After running the migrations, use the `src/scripts/ensure-admin-user.js` script to create or update admin users:

```bash
node src/scripts/ensure-admin-user.js
```

This script will:
1. Check if the configured admin user exists
2. Create the user if needed
3. Ensure the user has admin role
4. Use multiple methods to guarantee the user has admin access 