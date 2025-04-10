-- Rename is_super_admin to is_admin in users table for consistency
-- This makes our admin permission naming consistent across tables

-- Check if the is_super_admin column exists in the users table
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'is_super_admin'
  ) THEN
    -- Rename the column if it exists
    ALTER TABLE public.users 
    RENAME COLUMN is_super_admin TO is_admin;
    
    -- Rename the index if it exists
    IF EXISTS (
      SELECT FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename = 'users' 
      AND indexname = 'idx_users_is_super_admin'
    ) THEN
      ALTER INDEX idx_users_is_super_admin RENAME TO idx_users_is_admin;
    END IF;
    
    -- Log the migration
    RAISE NOTICE 'Renamed is_super_admin to is_admin in users table';
  ELSE
    -- If is_super_admin doesn't exist, check if is_admin exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'is_admin'
    ) THEN
      -- Create the is_admin column if neither column exists
      ALTER TABLE public.users 
      ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
      
      -- Add an index for better query performance
      CREATE INDEX idx_users_is_admin ON public.users(is_admin);
      
      -- Log the migration
      RAISE NOTICE 'Added is_admin column to users table';
    ELSE
      RAISE NOTICE 'is_admin column already exists in users table';
    END IF;
  END IF;
END $$; 