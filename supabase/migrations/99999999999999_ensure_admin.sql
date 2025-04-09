-- Ensure admin user exists in auth.users
-- Use a random UUID for new users
DO $$
DECLARE
  admin_user_id UUID := gen_random_uuid();
  admin_email TEXT := 'josef@holm.com';
  existing_user_id UUID;
BEGIN
  -- First check if user exists with this email
  SELECT id INTO existing_user_id 
  FROM auth.users 
  WHERE email = admin_email;
  
  IF existing_user_id IS NOT NULL THEN
    -- User exists, update it
    UPDATE auth.users 
    SET 
      raw_user_meta_data = '{"name":"Josef Holm", "role":"admin"}'::jsonb,
      updated_at = NOW(),
      role = 'authenticated',
      email_confirmed_at = NOW()
    WHERE id = existing_user_id;
    
    admin_user_id := existing_user_id;
  ELSE
    -- User doesn't exist, create it
    INSERT INTO auth.users (
      id, 
      email,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      email_confirmed_at
    ) 
    VALUES (
      admin_user_id,
      admin_email,
      '{"name":"Josef Holm", "role":"admin"}'::jsonb,
      NOW(),
      NOW(),
      'authenticated',
      NOW()
    );
  END IF;
  
  -- Now create/update the profile with the user ID
  -- Using first_name and last_name
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role, 
    status
  ) 
  VALUES (
    admin_user_id,
    admin_email,
    'Josef',
    'Holm',
    'admin',
    'active'
  ) 
  ON CONFLICT (id) DO 
  UPDATE SET 
    email = EXCLUDED.email, 
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();
    
  RAISE NOTICE 'Admin user created/updated with ID %', admin_user_id;
END $$;
