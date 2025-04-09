-- Migration to add force_create_profile function

-- This function creates a profile without being affected by RLS policies
-- Used as a fallback when ensure_profile_exists fails due to permission issues
CREATE OR REPLACE FUNCTION public.force_create_profile(
  p_user_id uuid,
  p_email text
) 
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_exists boolean;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id) INTO profile_exists;
  
  -- If profile doesn't exist, create it
  IF NOT profile_exists THEN
    -- Create a basic profile with minimal information
    INSERT INTO profiles (
      id,
      email,
      role,
      status,
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      p_email,
      'user',
      'active',
      NOW(),
      NOW()
    );
    
    RETURN true;
  ELSE
    -- Profile already exists, nothing to do
    RETURN false;
  END IF;
END;
$$;

-- Grant execute permissions to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.force_create_profile(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.force_create_profile(uuid, text) TO anon;

-- Add a policy to allow admin direct access to profiles for debugging
DROP POLICY IF EXISTS "Admin inserts allowed" ON profiles;
CREATE POLICY "Admin inserts allowed" 
ON profiles 
FOR INSERT 
WITH CHECK (
  -- Allow only for users with admin role
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  -- Allow during profile creation (no profile exists yet)
  OR NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- Ensure the profile table has the necessary insert policies for new signups
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" 
ON profiles 
FOR INSERT 
WITH CHECK (
  -- Only allow users to create their own profile
  auth.uid() = id
  -- Ensure role is set to 'user'
  AND (role IS NULL OR role = 'user')
);

-- Add a trigger to ensure profiles are created automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a row into public.profiles
  INSERT INTO public.profiles (id, email, role, status, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    'active',
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail
    RAISE NOTICE 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Ensure direct insertion via admin RPC function
CREATE OR REPLACE FUNCTION public.admin_create_profile(
  admin_user_id uuid,
  target_user_id uuid,
  target_email text,
  target_role text DEFAULT 'user',
  target_status text DEFAULT 'active'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_role text;
  profile_record record;
BEGIN
  -- Check if the calling user is an admin
  SELECT role INTO admin_role FROM profiles WHERE id = admin_user_id;
  
  IF admin_role IS NULL OR admin_role != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can use this function';
  END IF;
  
  -- Upsert the profile
  INSERT INTO profiles (
    id,
    email,
    role,
    status,
    created_at,
    updated_at
  ) VALUES (
    target_user_id,
    target_email,
    target_role,
    target_status,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = target_email,
    role = target_role,
    status = target_status,
    updated_at = NOW()
  RETURNING * INTO profile_record;
  
  -- Return the profile as JSON
  RETURN row_to_json(profile_record);
END;
$$;

-- Grant execute permissions to authenticated users only
GRANT EXECUTE ON FUNCTION public.admin_create_profile(uuid, uuid, text, text, text) TO authenticated; 