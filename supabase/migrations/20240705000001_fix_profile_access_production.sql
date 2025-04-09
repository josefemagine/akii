-- Production-ready migration to fix profile access and RLS policies
-- This migration addresses circular dependencies in profile access
-- and ensures RLS policies work correctly in all environments

-- 1. First, temporarily disable RLS on the profiles table
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Clean up existing policies to avoid conflicts
DO $$
BEGIN
  -- Drop all existing policies on profiles table
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
  END LOOP;
END
$$;

-- 3. Create a security definer function to safely check role status
-- This prevents circular dependencies when checking admin status
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Direct query bypassing RLS
  SELECT role INTO user_role FROM profiles WHERE id = user_id;
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- 4. Create a security definer function for safely accessing profiles
CREATE OR REPLACE FUNCTION get_profile(user_id UUID)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM profiles WHERE id = user_id;
END;
$$;

-- 5. Create or replace the ensure_profile_exists function with proper security
CREATE OR REPLACE FUNCTION ensure_profile_exists(
  user_id UUID,
  user_email TEXT,
  user_role TEXT DEFAULT 'user',
  user_status TEXT DEFAULT 'active'
)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    -- Update existing profile
    UPDATE profiles SET
      email = COALESCE(user_email, email),
      role = COALESCE(user_role, role, 'user'),
      status = COALESCE(user_status, status, 'active'),
      updated_at = NOW()
    WHERE id = user_id;
  ELSE
    -- Create new profile
    INSERT INTO profiles (
      id,
      email,
      role,
      status,
      created_at,
      updated_at
    ) VALUES (
      user_id,
      user_email,
      COALESCE(user_role, 'user'),
      COALESCE(user_status, 'active'),
      NOW(),
      NOW()
    );
  END IF;
  
  -- Return the profile
  RETURN QUERY SELECT * FROM profiles WHERE id = user_id;
END;
$$;

-- 6. Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_profile_exists(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- 7. Re-enable RLS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- 8. Create proper RLS policies that avoid circular dependencies

-- Basic policy for users to read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile (except role/status)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Cannot update role or status unless admin
  ((role IS NULL OR role = (SELECT role FROM get_profile(auth.uid()))) AND
   (status IS NULL OR status = (SELECT status FROM get_profile(auth.uid()))))
);

-- Allow admins to view all profiles
CREATE POLICY "Admins can read all profiles"
ON public.profiles
FOR SELECT
USING (get_user_role(auth.uid()) = 'admin');

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (get_user_role(auth.uid()) = 'admin');

-- Allow admins to insert profiles
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (get_user_role(auth.uid()) = 'admin');

-- Allow users to create their own profile
CREATE POLICY "Users can create own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow service role to bypass RLS
CREATE POLICY "Service role bypasses RLS"
ON public.profiles
USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant appropriate permissions
GRANT SELECT, UPDATE(first_name, last_name, email, updated_at) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role; 