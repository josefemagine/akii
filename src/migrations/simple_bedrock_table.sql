-- Simplified bedrock_credentials table creation without dependencies
-- Use this script if the original migration script fails due to dependencies

-- Create UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the bedrock_credentials table
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

-- Add RLS policies
ALTER TABLE bedrock_credentials ENABLE ROW LEVEL SECURITY;

-- Basic policy - users can only access their own credentials
CREATE POLICY "Users can access their own credentials" 
  ON bedrock_credentials 
  FOR ALL 
  TO authenticated 
  USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE
ON bedrock_credentials 
TO authenticated;

COMMENT ON TABLE bedrock_credentials IS 'Stores AWS Bedrock credentials for users'; 