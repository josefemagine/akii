-- Fix the ensure_profile_exists RPC function to properly handle profile fetching

-- Drop existing function if present
DROP FUNCTION IF EXISTS public.ensure_profile_exists(uuid, text, text, text);

-- Create new implementation of ensure_profile_exists
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
    -- Update existing profile
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
      split_part(user_email, '@', 1), -- Default first name from email
      '',                            -- Empty last name
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION ensure_profile_exists(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_profile_exists(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION ensure_profile_exists(UUID, TEXT, TEXT, TEXT) TO service_role;

-- Add a comment explaining what this function does
COMMENT ON FUNCTION ensure_profile_exists(UUID, TEXT, TEXT, TEXT) IS 'Ensures a profile exists for the given user ID by creating or updating it'; 