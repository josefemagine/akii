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

-- Update admin status for users with admin role
UPDATE public.profiles
SET is_admin = true
WHERE role = 'admin' AND (is_admin IS NULL OR is_admin = false);

-- Verify columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('is_admin', 'address1', 'address2', 'city', 'state', 'zip', 'country')
ORDER BY 
  ordinal_position; 