-- Add is_admin field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add address fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address1 TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address2 TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zip TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;

-- Add comment for the is_admin column
COMMENT ON COLUMN public.profiles.is_admin IS 'Indicates if the user has admin privileges';
COMMENT ON COLUMN public.profiles.address1 IS 'Primary address line';
COMMENT ON COLUMN public.profiles.address2 IS 'Secondary address line (apt, suite, etc.)';
COMMENT ON COLUMN public.profiles.city IS 'City';
COMMENT ON COLUMN public.profiles.state IS 'State or province';
COMMENT ON COLUMN public.profiles.zip IS 'Postal/ZIP code';
COMMENT ON COLUMN public.profiles.country IS 'Country';

-- Add function to update current profiles to have is_admin set to true for users with admin role
CREATE OR REPLACE FUNCTION public.update_admin_status()
RETURNS void AS $$
BEGIN
  -- Update profiles with role = 'admin' to have is_admin = true
  UPDATE public.profiles
  SET is_admin = true
  WHERE role = 'admin' AND (is_admin IS NULL OR is_admin = false);
  
  -- Log the number of updated rows
  RAISE NOTICE 'Updated % admin profiles', (SELECT COUNT(*) FROM public.profiles WHERE is_admin = true);
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT public.update_admin_status();

-- Drop the function since it's only needed once
DROP FUNCTION public.update_admin_status();
