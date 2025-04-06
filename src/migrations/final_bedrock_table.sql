-- Final bedrock_credentials table creation script
-- This script can be safely run multiple times without errors

-- Create UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS bedrock_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  aws_access_key_id TEXT NOT NULL,
  aws_secret_access_key TEXT NOT NULL,
  aws_region TEXT NOT NULL DEFAULT 'us-east-1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure only one row per user
  CONSTRAINT unique_user_credentials UNIQUE (user_id)
);

-- Add RLS (will do nothing if already enabled)
ALTER TABLE bedrock_credentials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Super admins can access all credentials" ON bedrock_credentials;
DROP POLICY IF EXISTS "Users can access their own credentials" ON bedrock_credentials;

-- Create policies (since we dropped them above, these will always work)
CREATE POLICY "Super admins can access all credentials" 
ON bedrock_credentials 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (
      auth.users.email = 'josef@holm.com' OR
      auth.users.email LIKE '%@akii.com' OR
      auth.users.email LIKE '%@akii.ai'
    )
  )
);

CREATE POLICY "Users can access their own credentials" 
ON bedrock_credentials 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid());

-- Create or replace the function (this is always safe)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS set_updated_at ON bedrock_credentials;

-- Create the trigger (since we dropped it above, this will always work)
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON bedrock_credentials
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Grant permissions (can be run multiple times safely)
GRANT SELECT, INSERT, UPDATE, DELETE
ON bedrock_credentials 
TO authenticated;

COMMENT ON TABLE bedrock_credentials IS 'Stores AWS Bedrock credentials for users'; 