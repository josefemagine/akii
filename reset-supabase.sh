#!/bin/bash
set -e  # Exit on error

echo "===== Completely resetting Supabase and reapplying migrations ====="

# Stop Supabase
echo "🛑 Stopping Supabase..."
supabase stop || { 
  echo "❌ Failed to stop Supabase. Proceeding anyway..."; 
}

# Ensure migrations directory exists
if [ ! -d "supabase/migrations" ]; then
  echo "❌ Error: migrations directory not found"
  exit 1
fi

# Reset the database with verbose output
echo "🗑️ Resetting Supabase database..."
supabase db reset --debug || {
  echo "❌ Failed to reset database"
  exit 1
}

# Start Supabase with proper error handling
echo "🚀 Starting Supabase..."
supabase start --debug || {
  echo "❌ Failed to start Supabase"
  exit 1
}

# Verify database connection
echo "🔍 Verifying database connection..."
supabase db ping || {
  echo "❌ Cannot connect to database"
  exit 1
}

# Run post-reset setup tasks
echo "✨ Running post-reset setup tasks..."

# Create an admin user if it doesn't exist
echo "👤 Ensuring admin user exists..."
PGPASSWORD=$(supabase status | grep DB_PASSWORD | awk '{print $2}')
PGUSER=$(supabase status | grep DB_USER | awk '{print $2}')
PGDATABASE=$(supabase status | grep DB_NAME | awk '{print $2}')
PGHOST=$(supabase status | grep DB_HOST | awk '{print $2}')
PGPORT=$(supabase status | grep DB_PORT | awk '{print $2}')

# Create a temporary SQL file
TMP_SQL=$(mktemp)
cat > $TMP_SQL << EOF
-- Create or update admin user
DO \$\$
DECLARE
  user_id uuid;
  user_exists boolean;
BEGIN
  -- Check if the admin user exists in auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
  ) INTO user_exists;
  
  -- Create the user if they don't exist
  IF NOT user_exists THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'admin@example.com',
      crypt('Admin123!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"], "role": "admin"}',
      '{"first_name": "Admin", "last_name": "User"}',
      now(),
      now(),
      'authenticated',
      '',
      '',
      '',
      ''
    ) RETURNING id INTO user_id;
    
    RAISE NOTICE 'Created new admin user with ID: %', user_id;
  ELSE
    -- Get existing user ID
    SELECT id INTO user_id FROM auth.users WHERE email = 'admin@example.com';
    RAISE NOTICE 'Admin user already exists with ID: %', user_id;
  END IF;
  
  -- Ensure the admin has a profile in the profiles table
  -- This uses our ensure_profile_exists function
  PERFORM ensure_profile_exists(user_id);
  
  -- Make sure they have the admin role
  UPDATE public.profiles SET role = 'admin' WHERE id = user_id;
  
  RAISE NOTICE 'Admin user has been set up successfully';
END
\$\$;
EOF

# Execute the SQL file
echo "💾 Executing SQL setup..."
PGPASSWORD=$PGPASSWORD psql -h $PGHOST -p $PGPORT -d $PGDATABASE -U $PGUSER -f $TMP_SQL || {
  echo "❌ Failed to execute SQL setup"
  rm $TMP_SQL
  exit 1
}

# Clean up
rm $TMP_SQL

echo "✅ Supabase reset complete!"
echo "🔄 Please restart your development server to see the changes."

# Clean up duplicate migration files if they exist
if [ -f "supabase/migrations/20240401000001_document_schema_fixed.sql" ]; then
  echo "Removing duplicate migration file: 20240401000001_document_schema_fixed.sql"
  rm "supabase/migrations/20240401000001_document_schema_fixed.sql"
fi

if [ -f "supabase/migrations/20240402000001_document_schema_fixed.sql" ]; then
  echo "Removing duplicate migration file: 20240402000001_document_schema_fixed.sql"
  rm "supabase/migrations/20240402000001_document_schema_fixed.sql"
fi

# Create a temporary SQL file to ensure profile exists
cat << EOF > /tmp/ensure_admin.sql
-- Setup proper RLS policies for the profiles table
DO \$\$
BEGIN
  -- Enable RLS on profiles table if not already enabled
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Allow users to create their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Allow admin to view all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Allow admin to update all profiles" ON public.profiles;

  -- Create policies that allow users to create and view their own profiles
  CREATE POLICY "Allow users to create their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

  CREATE POLICY "Allow users to view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

  CREATE POLICY "Allow users to update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

  -- Create policies that allow admins to manage all profiles
  CREATE POLICY "Allow admin to view all profiles" 
    ON public.profiles FOR SELECT 
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

  CREATE POLICY "Allow admin to update all profiles" 
    ON public.profiles FOR UPDATE 
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
END
\$\$;

-- Ensure admin user exists and has proper permissions
DO \$\$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'josef@holm.com';
BEGIN
  -- Check if user exists in auth.users
  SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;
  
  IF admin_user_id IS NULL THEN
    -- Create admin user if doesn't exist
    admin_user_id := gen_random_uuid();
    
    INSERT INTO auth.users 
      (id, email, encrypted_password, email_confirmed_at, role)
    VALUES 
      (admin_user_id, admin_email, 
       crypt('admin123', gen_salt('bf')), 
       now(), 'authenticated');
  END IF;
  
  -- Create or update admin profile
  INSERT INTO public.profiles 
    (id, email, first_name, last_name, role, status, created_at, updated_at)
  VALUES 
    (admin_user_id, admin_email, 'Josef', 'Holm', 'admin', 'active', now(), now())
  ON CONFLICT (id) 
  DO UPDATE SET 
    email = EXCLUDED.email,
    role = 'admin',
    status = 'active',
    updated_at = now();
END
\$\$;
EOF

# Execute the SQL file to ensure proper permissions and admin profile
echo "Applying ensure_profile_exists migration function..."
supabase db execute < /tmp/ensure_admin.sql

# Clean up the temporary file
rm /tmp/ensure_admin.sql

echo "✅ Supabase reset complete!"
echo "🔄 Please restart your development server to see the changes." 