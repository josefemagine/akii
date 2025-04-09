-- Migration to set user b574f273-e0e1-4cb8-8c98-f5a7569234c8 as admin
-- Run with: supabase db push

-- Direct update for user with ID b574f273-e0e1-4cb8-8c98-f5a7569234c8
DO $$
DECLARE
  target_user_id UUID := 'b574f273-e0e1-4cb8-8c98-f5a7569234c8';
  user_email TEXT;
BEGIN
  -- Log the operation
  RAISE NOTICE 'Setting user ID % as admin', target_user_id;
  
  -- Try to get user email from auth.users
  BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = target_user_id;
  EXCEPTION WHEN OTHERS THEN
    user_email := 'unknown@example.com';
  END;
  
  RAISE NOTICE 'Found user with email %', COALESCE(user_email, 'UNKNOWN');
  
  -- Update or insert profile with admin role
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id) THEN
    -- Update existing profile
    UPDATE public.profiles
    SET 
      role = 'admin',
      status = 'active',
      email = COALESCE(profiles.email, user_email), -- preserve existing email if present
      updated_at = NOW()
    WHERE id = target_user_id;
    
    RAISE NOTICE 'Updated existing profile to admin for user %', target_user_id;
  ELSE
    -- Create new profile
    INSERT INTO public.profiles (
      id, 
      email, 
      role, 
      status, 
      created_at, 
      updated_at
    )
    VALUES (
      target_user_id,
      user_email,
      'admin',
      'active',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Created new admin profile for user %', target_user_id;
  END IF;
  
  -- Verify the change
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id AND role = 'admin') THEN
    RAISE NOTICE 'Verification successful: User % is now admin', target_user_id;
    
    -- Simplify debugging by dumping the profile
    RAISE NOTICE 'Profile details: %', (
      SELECT json_build_object(
        'id', id,
        'email', email,
        'role', role,
        'status', status,
        'updated_at', updated_at
      )
      FROM public.profiles
      WHERE id = target_user_id
    );
  ELSE
    RAISE WARNING 'Verification failed: User % could not be set as admin', target_user_id;
  END IF;
END;
$$; 