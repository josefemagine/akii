-- Drop existing functions first
DROP FUNCTION IF EXISTS get_profile_by_id(uuid);
DROP FUNCTION IF EXISTS profile_exists(uuid);
DROP FUNCTION IF EXISTS ensure_profile_exists(uuid, text, text, text);

-- Create a function to get a profile by ID, bypassing RLS
CREATE OR REPLACE FUNCTION get_profile_by_id(profile_id UUID)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM profiles WHERE id = profile_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_profile_by_id(UUID) TO authenticated;

-- Create a function to check if a profile exists
CREATE OR REPLACE FUNCTION profile_exists(profile_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = profile_id);
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION profile_exists(UUID) TO authenticated;

-- Create or update profile function that bypasses RLS
CREATE OR REPLACE FUNCTION ensure_profile_exists(
  profile_id UUID, 
  user_email TEXT, 
  user_role TEXT DEFAULT 'user',
  user_status TEXT DEFAULT 'active'
)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if profile exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = profile_id) THEN
    -- Update if it exists
    UPDATE profiles 
    SET 
      email = COALESCE(user_email, email),
      role = COALESCE(user_role, role, 'user'),
      status = COALESCE(user_status, status, 'active'),
      updated_at = NOW()
    WHERE id = profile_id;
  ELSE
    -- Insert if it doesn't exist
    INSERT INTO profiles (
      id, 
      email, 
      role, 
      status,
      created_at, 
      updated_at
    )
    VALUES (
      profile_id, 
      user_email, 
      user_role, 
      user_status,
      NOW(), 
      NOW()
    );
  END IF;
  
  -- Return the profile
  RETURN QUERY SELECT * FROM profiles WHERE id = profile_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION ensure_profile_exists(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- Fix josef@holm.com specifically - using direct SQL for maximum reliability
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Try to get josef@holm.com's user ID
  SELECT id INTO user_id FROM auth.users WHERE email = 'josef@holm.com';
  
  IF user_id IS NOT NULL THEN
    -- Force delete if exists with wrong fields
    DELETE FROM profiles WHERE email = 'josef@holm.com' AND (status IS NULL OR role IS NULL);
    
    -- Direct insert with ON CONFLICT UPDATE to ensure it exists correctly
    -- This bypasses any RLS policies
    INSERT INTO profiles (
      id, email, role, status, created_at, updated_at
    ) VALUES (
      user_id, 'josef@holm.com', 'admin', 'active', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      status = 'active',
      updated_at = NOW();
      
    RAISE NOTICE 'Profile for josef@holm.com has been configured as admin';
  ELSE
    RAISE NOTICE 'User with email josef@holm.com not found in auth.users';
  END IF;
END
$$; 