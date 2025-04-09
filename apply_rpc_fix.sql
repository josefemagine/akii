-- Apply a fix to ensure the ensure_profile_exists RPC function works correctly
-- First, drop any existing function with the same name but different signatures
DROP FUNCTION IF EXISTS public.ensure_profile_exists(uuid);
DROP FUNCTION IF EXISTS public.ensure_profile_exists(uuid, text);
DROP FUNCTION IF EXISTS public.ensure_profile_exists(uuid, text, text);
DROP FUNCTION IF EXISTS public.ensure_profile_exists(uuid, text, text, text);

-- Create the function with the exact signature needed by the frontend
CREATE OR REPLACE FUNCTION public.ensure_profile_exists(
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
DECLARE
  profile_exists BOOLEAN;
BEGIN
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;
  
  IF profile_exists THEN
    -- Update existing profile with non-null values
    UPDATE profiles 
    SET 
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
      first_name,
      last_name,
      role,
      status,
      created_at,
      updated_at
    )
    VALUES (
      user_id,
      user_email,
      CASE WHEN user_email IS NOT NULL THEN split_part(user_email, '@', 1) ELSE '' END,
      '',
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION ensure_profile_exists(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_profile_exists(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION ensure_profile_exists(UUID, TEXT, TEXT, TEXT) TO service_role;

-- Add a comment explaining what this function does
COMMENT ON FUNCTION ensure_profile_exists(UUID, TEXT, TEXT, TEXT) IS 'Ensures a profile exists for the given user ID by creating or updating it'; 