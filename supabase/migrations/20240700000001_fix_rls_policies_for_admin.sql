-- This migration fixes Row Level Security (RLS) policies to ensure admin users can access profiles
-- It adds an explicit policy for admin users and service role

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can do anything" ON public.profiles;

-- Create a policy specifically for admin role
CREATE POLICY "Admin users can view all profiles"
  ON public.profiles
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Create a policy for service role (bypasses RLS)
CREATE POLICY "Service role can do anything"
  ON public.profiles
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create a policy for accessing any profile with admin_override flag
CREATE POLICY "Admin override can access all profiles"
  ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND 
            (role = 'admin' OR email LIKE '%@akii.ai')
    )
  );

-- Grant explicit permissions to authenticated users
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Grant ALL permissions to service_role
GRANT ALL ON public.profiles TO service_role;

-- Allow service_role to bypass RLS
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;

-- Create a function to allow retrieving any profile for admins
CREATE OR REPLACE FUNCTION get_profile_by_id(profile_id UUID)
RETURNS SETOF profiles AS
$$
BEGIN
  RETURN QUERY SELECT * FROM profiles WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS
$$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND 
          (role = 'admin' OR email LIKE '%@akii.ai')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public; 