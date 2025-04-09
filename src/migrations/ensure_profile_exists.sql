-- Drop existing functions to avoid duplicates
DROP FUNCTION IF EXISTS public.ensure_profile_exists(uuid);
DROP FUNCTION IF EXISTS public.ensure_profile_exists(uuid, text, text);

-- Create the ensure_profile_exists function with single parameter signature
CREATE OR REPLACE FUNCTION public.ensure_profile_exists(
  user_id_param uuid
) 
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record record;
BEGIN
  -- Try to get the profile first
  SELECT * INTO profile_record FROM profiles WHERE id = user_id_param;
  
  -- If profile doesn't exist, try to get user info from auth.users
  IF profile_record IS NULL THEN
    DECLARE
      user_email text;
    BEGIN
      -- Get user email from auth.users
      SELECT email INTO user_email FROM auth.users WHERE id = user_id_param;
      
      IF user_email IS NOT NULL THEN
        -- Insert regular user profile - all users treated equally
        INSERT INTO profiles (id, email, role, status, created_at, updated_at)
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
    END;
  END IF;
  
  -- Return the profile as JSON or null if still not found
  RETURN row_to_json(profile_record);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists(uuid) TO anon;

-- Create the ensure_profile_exists function with three parameter signature
CREATE OR REPLACE FUNCTION public.ensure_profile_exists(
  user_id uuid,
  user_email text,
  default_role text DEFAULT 'user'
) RETURNS "profiles" AS $$
DECLARE
  profile_record profiles;
BEGIN
  -- Check if the profile already exists
  SELECT * INTO profile_record FROM profiles WHERE id = user_id;
  
  -- If no profile exists, create one
  IF profile_record IS NULL THEN
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
      default_role, 
      'active', 
      NOW(), 
      NOW()
    )
    RETURNING * INTO profile_record;
  END IF;
  
  -- Return the profile record
  RETURN profile_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission for the three-parameter version
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists(uuid, text, text) TO anon; 