-- Add admin user
DO $$
BEGIN
  -- Insert admin user
  IF NOT EXISTS (
    SELECT FROM auth.users WHERE email = 'josef@holm.com'
  ) THEN
    INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
    VALUES 
      ('00000000-0000-0000-0000-000000000000', 'josef@holm.com', '{"role":"admin"}', NOW(), NOW());
  ELSE
    UPDATE auth.users 
    SET 
      email = 'josef@holm.com',
      raw_user_meta_data = '{"role":"admin"}',
      updated_at = NOW()
    WHERE email = 'josef@holm.com';
  END IF;
  
  -- Ensure admin profile exists
  IF NOT EXISTS (
    SELECT FROM public.profiles WHERE email = 'josef@holm.com'
  ) THEN
    INSERT INTO public.profiles (id, email, role, status, created_at, updated_at)
    VALUES 
      ('00000000-0000-0000-0000-000000000000', 'josef@holm.com', 'admin', 'active', NOW(), NOW());
  ELSE
    UPDATE public.profiles
    SET 
      email = 'josef@holm.com',
      role = 'admin',
      status = 'active',
      updated_at = NOW()
    WHERE email = 'josef@holm.com';
  END IF;
END $$; 