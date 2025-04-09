-- This file is now renamed to 20240611000002_fix_profiles_rls_policy.sql
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create policy to allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
