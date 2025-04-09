-- Update profiles table to include more subscription details

-- Add subscription_tier column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'basic';

-- Add message_limit column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS message_limit INTEGER DEFAULT 1000;

-- Add messages_used column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS messages_used INTEGER DEFAULT 0;

-- Add subscription_status column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- Add trial_ends_at column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Add last_billing_date column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_billing_date TIMESTAMP WITH TIME ZONE;

-- Add next_billing_date column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE;

-- Enable row level security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow service role to read all profiles
DROP POLICY IF EXISTS "Service role can view all profiles" ON profiles;
CREATE POLICY "Service role can view all profiles"
  ON profiles FOR SELECT
  TO service_role
  USING (true);

-- Allow service role to update all profiles
DROP POLICY IF EXISTS "Service role can update all profiles" ON profiles;
CREATE POLICY "Service role can update all profiles"
  ON profiles FOR UPDATE
  TO service_role
  USING (true);

-- Enable realtime safely
DO $$
BEGIN
  -- Check if the table is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    -- Add table to publication
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE profiles';
  END IF;
END $$;
