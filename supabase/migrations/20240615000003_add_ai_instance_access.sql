-- Add ai_instance_access column to team_members table
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS ai_instance_access TEXT[] DEFAULT '{}';

-- Create ai_instances table if it doesn't exist
CREATE TABLE IF NOT EXISTS ai_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::JSONB,
  status TEXT DEFAULT 'active'
);

-- Add realtime support for ai_instances
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'ai_instances'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE ai_instances';
  END IF;
END
$$;

-- Create team_ai_instance_access table for many-to-many relationship
CREATE TABLE IF NOT EXISTS team_ai_instance_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  ai_instance_id UUID NOT NULL REFERENCES ai_instances(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_member_id, ai_instance_id)
);

-- Add realtime support for team_ai_instance_access
DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'team_ai_instance_access'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE team_ai_instance_access';
  END IF;
END
$$;