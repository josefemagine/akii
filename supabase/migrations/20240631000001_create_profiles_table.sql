-- Create the profiles table with the schema expected by the new auth system
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'team_member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy for users to update their own profile (excluding role and status)
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND 
              (role IS NULL OR role = 'user') AND 
              (status IS NULL OR status = OLD.status));

-- Create policy for service role to bypass RLS
CREATE POLICY "Service role can do anything"
  ON public.profiles
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant permissions to authenticated users
GRANT SELECT, UPDATE(first_name, last_name, email, updated_at) ON public.profiles TO authenticated;

-- Grant all permissions to service_role
GRANT ALL ON public.profiles TO service_role;

-- Create a function to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, status, created_at, updated_at)
  VALUES (NEW.id, NEW.email, 'user', 'active', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email, updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to force a user as admin
CREATE OR REPLACE FUNCTION public.force_user_as_admin(email_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO user_id FROM auth.users WHERE email = email_param;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', email_param;
  END IF;
  
  -- Update or insert the profile with admin role
  INSERT INTO public.profiles (id, email, role, status, created_at, updated_at)
  VALUES (user_id, email_param, 'admin', 'active', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin', status = 'active', updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.force_user_as_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.force_user_as_admin TO service_role; 