-- Add is_admin column to profiles table for direct database access
-- This allows us to check admin status without using edge functions

-- Check if column already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_admin'
  ) THEN
    -- Add the is_admin column if it doesn't exist
    ALTER TABLE public.profiles 
    ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
    
    -- Add an index for better query performance
    CREATE INDEX idx_profiles_is_admin ON public.profiles(is_admin);
    
    -- Add comment to column
    COMMENT ON COLUMN public.profiles.is_admin IS 'Flag indicating if the user has admin privileges';
    
    -- Update existing admin users to have is_admin=true if they have admin role
    -- This is a safe migration that doesn't lose any existing admin rights
    UPDATE public.profiles 
    SET is_admin = true 
    WHERE role = 'admin';
    
    -- Log the migration
    RAISE NOTICE 'Added is_admin column to profiles table';
  ELSE
    RAISE NOTICE 'is_admin column already exists in profiles table';
  END IF;
END $$; 