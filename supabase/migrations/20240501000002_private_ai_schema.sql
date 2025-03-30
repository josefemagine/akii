-- Create private_ai_instances table
CREATE TABLE IF NOT EXISTS private_ai_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  endpoint_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL REFERENCES private_ai_instances(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions TEXT[] DEFAULT ARRAY['read']::TEXT[],
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create api_usage table
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL REFERENCES private_ai_instances(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  latency_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE private_ai_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for private_ai_instances
DROP POLICY IF EXISTS "Users can view their own private AI instances" ON private_ai_instances;
CREATE POLICY "Users can view their own private AI instances"
  ON private_ai_instances
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own private AI instances" ON private_ai_instances;
CREATE POLICY "Users can create their own private AI instances"
  ON private_ai_instances
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own private AI instances" ON private_ai_instances;
CREATE POLICY "Users can update their own private AI instances"
  ON private_ai_instances
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own private AI instances" ON private_ai_instances;
CREATE POLICY "Users can delete their own private AI instances"
  ON private_ai_instances
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for api_keys
DROP POLICY IF EXISTS "Users can view their own API keys" ON api_keys;
CREATE POLICY "Users can view their own API keys"
  ON api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own API keys" ON api_keys;
CREATE POLICY "Users can create their own API keys"
  ON api_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own API keys" ON api_keys;
CREATE POLICY "Users can update their own API keys"
  ON api_keys
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own API keys" ON api_keys;
CREATE POLICY "Users can delete their own API keys"
  ON api_keys
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for api_usage
DROP POLICY IF EXISTS "Users can view their own API usage" ON api_usage;
CREATE POLICY "Users can view their own API usage"
  ON api_usage
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert API usage" ON api_usage;
CREATE POLICY "System can insert API usage"
  ON api_usage
  FOR INSERT
  WITH CHECK (true);

-- Add realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'api_keys'
  ) THEN
    alter publication supabase_realtime add table api_keys;
  END IF;
END
$$;