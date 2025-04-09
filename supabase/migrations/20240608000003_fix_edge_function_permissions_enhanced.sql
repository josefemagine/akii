-- Grant additional permissions to service_role and anon roles

-- Ensure service_role has full access to all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Ensure anon role has access to necessary public tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Ensure edge functions can access the database with service_role permissions
-- NOTE: Commented out as these require superuser privileges
-- ALTER ROLE service_role SET pgrst.db_schemas TO 'public,storage,graphql_public';

-- Enable RLS bypass for service_role
-- NOTE: Commented out as these require superuser privileges
-- ALTER ROLE service_role SET pgrst.db_anon_role TO 'anon';

-- Ensure profiles table exists and has proper permissions
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Add realtime support only if not already in publication
DO $$
DECLARE
  profile_count integer;
BEGIN
  SELECT COUNT(*) INTO profile_count
  FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime'
  AND tablename = 'profiles'
  AND schemaname = 'public';
  
  IF profile_count = 0 THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
END $$;

-- Enhanced permissions for edge functions (workaround for permission errors)
DO $$
BEGIN
  -- Add comments about why we need these permissions
  EXECUTE 'COMMENT ON ROLE service_role IS ''This role is used by edge functions and should have access to public, storage, and graphql_public schemas''';
    
  -- Grant specific permissions to tables that edge functions need
  EXECUTE 'GRANT ALL ON public.profiles TO service_role';
  EXECUTE 'GRANT ALL ON public.documents TO service_role';
  EXECUTE 'GRANT ALL ON public.agents TO service_role';
  EXECUTE 'GRANT ALL ON public.conversations TO service_role';
  EXECUTE 'GRANT ALL ON public.messages TO service_role';
  
  -- Note: The following commented line requires superuser privileges and is causing errors 
  -- ALTER ROLE service_role SET pgrst.db_schemas TO 'public,storage,graphql_public';
END $$;
