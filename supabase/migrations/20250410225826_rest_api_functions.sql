-- REST API Support Functions
-- These functions are designed to work with the standardized REST approach

-- Function to check database connection (needed for diagnostics)
CREATE OR REPLACE FUNCTION check_database_connection()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'connected', true,
    'version', current_setting('server_version'),
    'timestamp', extract(epoch from now())
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'connected', false,
      'error', SQLERRM,
      'timestamp', extract(epoch from now())
    );
END;
$$;

-- Function to get user details from auth.users (admin only)
CREATE OR REPLACE FUNCTION get_user_details(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_data jsonb;
  is_admin boolean;
  requesting_user_id uuid;
BEGIN
  -- Get the ID of the requesting user
  requesting_user_id := auth.uid();

  -- Check if the requesting user is an admin
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = requesting_user_id AND (is_admin = true OR role = 'admin')
  ) INTO is_admin;

  -- Only proceed if user is admin
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Access denied: admin privileges required';
  END IF;

  -- Get user data from auth.users
  SELECT 
    jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'created_at', u.created_at,
      'updated_at', u.updated_at,
      'confirmed_at', u.confirmed_at,
      'last_sign_in_at', u.last_sign_in_at,
      'app_metadata', u.raw_app_meta_data,
      'user_metadata', u.raw_user_meta_data,
      'is_admin', p.is_admin,
      'role', p.role,
      'status', p.status
    )
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE u.id = user_id
  INTO user_data;

  RETURN user_data;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'context', 'Error fetching user details'
    );
END;
$$;

-- Function to toggle admin status (admin only)
CREATE OR REPLACE FUNCTION toggle_admin_status(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin boolean;
  requesting_user_id uuid;
  current_admin_status boolean;
BEGIN
  -- Get the ID of the requesting user
  requesting_user_id := auth.uid();

  -- Check if the requesting user is an admin
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = requesting_user_id AND (is_admin = true OR role = 'admin')
  ) INTO is_admin;

  -- Only proceed if user is admin
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Access denied: admin privileges required';
  END IF;
  
  -- Get current admin status
  SELECT p.is_admin 
  FROM public.profiles p 
  WHERE p.id = target_user_id
  INTO current_admin_status;
  
  -- Toggle admin status
  UPDATE public.profiles
  SET 
    is_admin = NOT COALESCE(current_admin_status, false),
    updated_at = now()
  WHERE id = target_user_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in toggle_admin_status: %', SQLERRM;
    RETURN false;
END;
$$;

-- Function to ensure a profile exists
CREATE OR REPLACE FUNCTION ensure_profile_exists(
  user_id uuid,
  user_email text,
  user_role text DEFAULT 'user',
  user_status text DEFAULT 'active'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_exists boolean;
  profile_data jsonb;
BEGIN
  -- Check if profile exists
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = user_id
  ) INTO profile_exists;
  
  IF profile_exists THEN
    -- Return existing profile
    SELECT jsonb_build_object(
      'id', id,
      'email', email,
      'first_name', first_name,
      'last_name', last_name,
      'role', role,
      'status', status,
      'is_admin', is_admin,
      'created_at', created_at,
      'updated_at', updated_at
    )
    FROM public.profiles
    WHERE id = user_id
    INTO profile_data;
    
    RETURN profile_data;
  ELSE
    -- Create new profile
    INSERT INTO public.profiles (
      id,
      email,
      role,
      status,
      first_name,
      last_name,
      is_admin,
      created_at,
      updated_at
    )
    VALUES (
      user_id,
      user_email,
      user_role,
      user_status,
      split_part(user_email, '@', 1), -- Use part before @ as first_name
      '',
      user_role = 'admin',
      now(),
      now()
    )
    RETURNING jsonb_build_object(
      'id', id,
      'email', email,
      'first_name', first_name,
      'last_name', last_name,
      'role', role,
      'status', status,
      'is_admin', is_admin,
      'created_at', created_at,
      'updated_at', updated_at
    ) INTO profile_data;
    
    RETURN profile_data;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'context', 'Error ensuring profile exists'
    );
END;
$$;

-- Function to set a user as admin
CREATE OR REPLACE FUNCTION set_user_as_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin boolean;
  requesting_user_id uuid;
BEGIN
  -- Get the ID of the requesting user
  requesting_user_id := auth.uid();

  -- Check if the requesting user is an admin
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = requesting_user_id AND (is_admin = true OR role = 'admin')
  ) INTO is_admin;

  -- Only proceed if user is admin
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Access denied: admin privileges required';
  END IF;
  
  -- Update user as admin
  UPDATE public.profiles
  SET 
    is_admin = true,
    role = 'admin',
    updated_at = now()
  WHERE id = user_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in set_user_as_admin: %', SQLERRM;
    RETURN false;
END;
$$; 