-- Migration to ensure josef@holm.com has admin role
-- Run with: supabase db push

-- Function to set the specific user as admin
DO $$
DECLARE
  user_email TEXT := 'josef@holm.com';
  user_id UUID;
BEGIN
  -- Log the operation
  RAISE NOTICE 'Setting user % as admin', user_email;
  
  -- First find the user ID from auth.users
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE NOTICE 'User with email % not found in auth.users', user_email;
    RETURN;
  END IF;
  
  RAISE NOTICE 'Found user with ID %', user_id;
  
  -- Update or insert profile with admin role
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    -- Update existing profile
    UPDATE public.profiles
    SET 
      role = 'admin',
      status = 'active',
      updated_at = NOW()
    WHERE id = user_id;
    
    RAISE NOTICE 'Updated existing profile to admin for user %', user_id;
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
      user_id,
      user_email,
      'admin',
      'active',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Created new admin profile for user %', user_id;
  END IF;
  
  -- Verify the change
  RAISE NOTICE 'User % is now admin with email %', user_id, user_email;
  
  -- Double-check by querying
  PERFORM role FROM public.profiles WHERE id = user_id;
  IF NOT FOUND THEN
    RAISE WARNING 'Profile creation/update failed for user %', user_id;
  ELSE
    RAISE NOTICE 'Profile verified: role = %', (SELECT role FROM public.profiles WHERE id = user_id);
  END IF;
END;
$$; 