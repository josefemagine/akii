-- SQL script to make a user admin directly in the database
-- Use this with: supabase db execute --file set-admin.sql

-- Function to set a specific user as admin
DO $$
DECLARE
  target_user_id UUID := 'b574f273-e0e1-4cb8-8c98-f5a7569234c8';
  user_email TEXT;
BEGIN
  -- Get user email from auth.users if possible
  BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = target_user_id;
  EXCEPTION WHEN OTHERS THEN
    user_email := 'unknown@example.com';
  END;
  
  -- First, ensure the user has a profile
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id) THEN
    -- Update existing profile
    UPDATE public.profiles
    SET 
      role = 'admin',
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
  RAISE NOTICE 'User % is now admin with email %', target_user_id, user_email;
END;
$$; 