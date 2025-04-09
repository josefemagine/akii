-- Set josef@holm.com as admin user
UPDATE auth.users SET role = 'admin' WHERE email = 'josef@holm.com';
UPDATE public.profiles SET role = 'admin' WHERE email = 'josef@holm.com';

-- Create the profile if it doesn't exist yet
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT id, email, 'admin', NOW(), NOW()
FROM auth.users 
WHERE email = 'josef@holm.com'
AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'josef@holm.com');
