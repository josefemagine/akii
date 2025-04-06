-- Create the bedrock_credentials table
-- This table stores AWS Bedrock credentials for each user

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

-- Admin can access all rows
CREATE POLICY "Admins can access all credentials" 
  ON bedrock_credentials 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Users can only access their own rows
CREATE POLICY "Users can access their own credentials" 
  ON bedrock_credentials 
  FOR ALL 
  TO authenticated 
  USING (user_id = auth.uid());

-- Create trigger to update the updated_at field
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON bedrock_credentials
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE
ON bedrock_credentials 
TO authenticated;

COMMENT ON TABLE bedrock_credentials IS 'Stores AWS Bedrock credentials for users'; 