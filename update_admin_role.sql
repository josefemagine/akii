-- Run this in the Supabase SQL editor to update a user's role to 'admin'
-- Replace 'your-user-id' with your actual user ID

UPDATE profiles
SET role = 'admin'
WHERE id = 'your-user-id';

-- To find your user ID, you can run this query:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- To verify the update worked:
SELECT profiles.id, auth.users.email, profiles.role 
FROM profiles
JOIN auth.users ON profiles.id = auth.users.id
WHERE profiles.id = 'your-user-id'; 