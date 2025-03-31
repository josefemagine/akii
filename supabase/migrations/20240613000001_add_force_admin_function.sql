-- Function to forcefully set a user as admin
CREATE OR REPLACE FUNCTION force_admin_role(target_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
  success BOOLEAN := FALSE;
BEGIN
  -- Get the user ID from the email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = target_email;
  
  -- If user exists, update their profile
  IF target_user_id IS NOT NULL THEN
    -- Update in profiles table
    UPDATE public.profiles 
    SET role = 'admin', 
        status = 'active', 
        updated_at = NOW() 
    WHERE email = target_email OR id = target_user_id;
    
    -- Insert if not exists
    INSERT INTO public.profiles (id, email, role, status, created_at, updated_at)
    VALUES (
      target_user_id, 
      target_email, 
      'admin', 
      'active', 
      NOW(), 
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    success := TRUE;
  END IF;
  
  RETURN success;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION force_admin_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION force_admin_role(TEXT) TO service_role;

-- Comment on function
COMMENT ON FUNCTION force_admin_role IS 'Forcefully sets a user as admin by email, bypassing normal permission checks'; 