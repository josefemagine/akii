-- Add new columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Update the handle_new_user function to include the new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name,
    last_name,
    company_name,
    avatar_url,
    role,
    status
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'company_name',
    coalesce(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    'user',
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing profiles with data from user_metadata where possible
UPDATE public.profiles p
SET 
  first_name = u.raw_user_meta_data->>'first_name',
  last_name = u.raw_user_meta_data->>'last_name',
  company_name = u.raw_user_meta_data->>'company_name'
FROM auth.users u
WHERE p.id = u.id AND p.first_name IS NULL;

-- Check if full_name column exists before using it
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'full_name'
  ) INTO column_exists;
  
  IF column_exists THEN
    -- Update profile first_name/last_name from full_name if needed
    EXECUTE '
    UPDATE public.profiles
    SET 
      first_name = split_part(full_name, '' '', 1),
      last_name = substring(full_name from position('' '' in full_name))
    WHERE full_name IS NOT NULL AND first_name IS NULL';
  END IF;
END $$;

-- Make sure indexes exist for the RLS policies
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status); 