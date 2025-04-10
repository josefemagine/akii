-- Add indexes to optimize profile queries
-- Based on https://supabase.com/docs/guides/database/query-optimization

-- Create an index on the id field for faster lookups when querying by user ID
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- Create an index on the email field for faster lookups when querying by email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Create an index on the combination of first name and last name for name-based searches
CREATE INDEX IF NOT EXISTS idx_profiles_name ON public.profiles(first_name, last_name);

-- Create a partial index on is_admin to quickly find admin users (much smaller than a full index)
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON public.profiles(id) WHERE is_admin = true;

-- Create an index on role for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Create an index on status for status-based filtering 
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Create an index on updated_at for sorting by recency
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at DESC);

-- Create a composite index for common query patterns (find users by role and status)
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role, status); 