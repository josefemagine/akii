-- This migration ensures all necessary permissions are granted to service_role and anon roles
-- It also ensures the profiles table exists with proper permissions

-- First, ensure the profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Grant necessary permissions to service_role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant necessary permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Specifically grant permissions on profiles table
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.profiles TO anon;

-- Set up Row Level Security (RLS) for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Enable realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Ensure service_role can bypass RLS
ALTER ROLE service_role BYPASSRLS;

-- Grant permissions for auth schema
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO service_role;

-- Grant permissions for storage schema if it exists
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO service_role;

-- Ensure the edge function has access to all necessary schemas
GRANT USAGE ON SCHEMA pg_catalog TO service_role;
GRANT USAGE ON SCHEMA information_schema TO service_role;

-- Ensure the service_role can create new schemas if needed
GRANT CREATE ON DATABASE postgres TO service_role;