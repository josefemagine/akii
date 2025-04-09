-- Migration file for auth system optimization

-- 1. Ensure the profiles table has the correct structure and constraints
DO $$
BEGIN
  -- Check if table exists and create it if not
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT UNIQUE NOT NULL,
      first_name TEXT,
      last_name TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'team_member')),
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
      company TEXT,
      bio TEXT,
      display_name TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  ELSE
    -- If table exists, ensure all required columns are present
    -- Add columns that might be missing (they'll be ignored if they already exist)
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(); EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(); EXCEPTION WHEN duplicate_column THEN NULL; END;
    
    -- Ensure email uniqueness
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_key') THEN
      ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
    END IF;
    
    -- Add/update role check constraint
    BEGIN
      ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
      ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'team_member'));
    EXCEPTION WHEN undefined_column THEN
      NULL;
    END;
    
    -- Add/update status check constraint
    BEGIN
      ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
      ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check CHECK (status IN ('active', 'inactive', 'banned'));
    EXCEPTION WHEN undefined_column THEN
      NULL;
    END;
  END IF;
END $$;

-- 2. Set up RLS policies for the profiles table
-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create policies for users
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND (
  -- Users cannot update their own role or status
  (role IS NULL OR role = (SELECT role FROM public.profiles WHERE id = auth.uid())) AND
  (status IS NULL OR status = (SELECT status FROM public.profiles WHERE id = auth.uid()))
));

-- Create policies for admins
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 3. Create or update the ensure_profile_exists function
CREATE OR REPLACE FUNCTION public.ensure_profile_exists(
  user_id_param uuid
) 
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record record;
  user_email text;
BEGIN
  -- Try to get the profile first
  SELECT * INTO profile_record FROM profiles WHERE id = user_id_param;
  
  -- If profile doesn't exist, try to get user info from auth.users
  IF profile_record IS NULL THEN
    -- Get user email from auth.users
    SELECT email INTO user_email FROM auth.users WHERE id = user_id_param;
    
    IF user_email IS NOT NULL THEN
      -- Insert regular user profile
      INSERT INTO profiles (
        id, 
        email, 
        role, 
        status, 
        created_at, 
        updated_at
      )
      VALUES (
        user_id_param, 
        user_email, 
        'user', 
        'active', 
        NOW(), 
        NOW()
      )
      RETURNING * INTO profile_record;
    END IF;
  END IF;
  
  -- Return the profile as JSON or null if still not found
  RETURN row_to_json(profile_record);
END;
$$;

-- Grant execute permission to authenticated users and anonymous
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists(uuid) TO anon;

-- 4. Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 5. Set up permissions for the profiles table
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.profiles TO anon;

-- Grant usage on profile id sequence if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_class WHERE relname = 'profiles_id_seq') THEN
    GRANT USAGE, SELECT ON SEQUENCE profiles_id_seq TO authenticated;
    GRANT USAGE, SELECT ON SEQUENCE profiles_id_seq TO anon;
  END IF;
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$; 