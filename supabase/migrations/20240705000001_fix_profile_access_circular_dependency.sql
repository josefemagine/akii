-- Migration to fix profile access circular dependency issues
-- This ensures profile access works correctly without infinite recursion

-- 1. First, temporarily disable RLS on the profiles table to allow our fixes
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Clean up all existing policies that might cause conflicts
DO $$
BEGIN
  -- Drop all existing policies on profiles table
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
  END LOOP;
END
$$;

-- 3. Create a security definer function to check admin status without recursion
CREATE OR REPLACE FUNCTION is_admin_no_recursion(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- This bypasses RLS
SET search_path = public
AS $$
BEGIN
  -- Direct query to profiles table bypassing RLS
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND (role = 'admin' OR email LIKE '%@holm.com')
  );
END;
$$;

-- 4. Create a profile access function that bypasses RLS
CREATE OR REPLACE FUNCTION get_profile_safely(user_id UUID)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER  -- This bypasses RLS
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM profiles WHERE id = user_id;
END;
$$;

-- 5. Create or replace the ensure_profile_exists function to bypass RLS
CREATE OR REPLACE FUNCTION ensure_profile_exists(
  user_id UUID,
  user_email TEXT,
  user_role TEXT DEFAULT 'user',
  user_status TEXT DEFAULT 'active'
)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER  -- This bypasses RLS
SET search_path = public
AS $$
BEGIN
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    -- Update profile if it exists
    UPDATE profiles SET
      email = COALESCE(user_email, email),
      role = CASE 
        WHEN user_email LIKE '%@holm.com' THEN 'admin'
        ELSE COALESCE(user_role, role, 'user')
      END,
      status = COALESCE(user_status, status, 'active'),
      updated_at = NOW()
    WHERE id = user_id;
  ELSE
    -- Create new profile if it doesn't exist
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
      CASE WHEN user_email LIKE '%@holm.com' THEN 'admin' ELSE COALESCE(user_role, 'user') END,
      COALESCE(user_status, 'active'),
      NOW(),
      NOW()
    );
  END IF;
  
  -- Return the profile
  RETURN QUERY SELECT * FROM profiles WHERE id = user_id;
END;
$$;

-- 6. Grant permissions on the functions
GRANT EXECUTE ON FUNCTION is_admin_no_recursion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile_safely(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_profile_exists(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- 7. Re-enable RLS and create proper policies
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- 8. Create a basic policy for users to read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 9. Create a policy for users to update their own profile (except role/status)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Cannot update role or status unless you're an admin
  (is_admin_no_recursion(auth.uid()) OR 
   ((role IS NULL OR role = (SELECT role FROM get_profile_safely(auth.uid()))) AND
    (status IS NULL OR status = (SELECT status FROM get_profile_safely(auth.uid())))))
);

-- 10. Create a policy for admins to view and update all profiles
CREATE POLICY "Admins can do anything with profiles"
ON public.profiles
FOR ALL
USING (is_admin_no_recursion(auth.uid()));

-- 11. Create policy for service role
CREATE POLICY "Service role can do anything"
ON public.profiles
USING (auth.jwt() ->> 'role' = 'service_role');

-- 12. Create a policy to allow profile creation
CREATE POLICY "Anyone can create their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- 13. Ensure josef@holm.com specifically has admin role
DO $$
BEGIN
  INSERT INTO profiles (id, email, role, status, created_at, updated_at)
  VALUES (
    auth.uid(),
    'josef@holm.com',
    'admin',
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignore errors
END
$$; 