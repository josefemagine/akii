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

-- Check if the policy exists before creating it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bedrock_credentials' 
        AND policyname = 'Super admins can access all credentials'
    ) THEN
        -- Simplified admin policy - admins identified by email for now
        -- This avoids dependency on user_profiles table
        EXECUTE format('
            CREATE POLICY "Super admins can access all credentials" 
            ON bedrock_credentials 
            FOR ALL 
            TO authenticated 
            USING (
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND (
                        auth.users.email = ''josef@holm.com'' OR
                        auth.users.email LIKE ''%%@akii.com'' OR
                        auth.users.email LIKE ''%%@akii.ai''
                    )
                )
            )
        ');
    END IF;
END
$$;

-- Check if the policy exists before creating it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bedrock_credentials' 
        AND policyname = 'Users can access their own credentials'
    ) THEN
        -- Users can only access their own rows
        EXECUTE format('
            CREATE POLICY "Users can access their own credentials" 
            ON bedrock_credentials 
            FOR ALL 
            TO authenticated 
            USING (user_id = auth.uid())
        ');
    END IF;
END
$$;

-- Create the function if it doesn't exist
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if the trigger exists before creating it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'set_updated_at' 
        AND tgrelid = 'bedrock_credentials'::regclass
    ) THEN
        CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON bedrock_credentials
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
    END IF;
END
$$;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE
ON bedrock_credentials 
TO authenticated;

COMMENT ON TABLE bedrock_credentials IS 'Stores AWS Bedrock credentials for users'; 