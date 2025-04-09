-- Create analytics tables for dashboard

-- Sessions table to track user sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  ip_address TEXT,
  user_agent TEXT
);

-- Analytics table for visitor tracking
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitors INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  bounce_rate FLOAT DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI metrics table
CREATE TABLE IF NOT EXISTS ai_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  avg_response_time FLOAT DEFAULT 0,
  satisfaction_rate FLOAT DEFAULT 0,
  total_requests INTEGER DEFAULT 0,
  error_rate FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content moderation metrics
CREATE TABLE IF NOT EXISTS moderation_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_moderated INTEGER DEFAULT 0,
  flagged_content INTEGER DEFAULT 0,
  approval_rate FLOAT DEFAULT 0,
  active_rules INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent ratings table
CREATE TABLE IF NOT EXISTS agent_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add messages count and conversations count to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS messages INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS conversations INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS rating FLOAT DEFAULT 0;

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Admins can read all sessions" ON sessions;
CREATE POLICY "Admins can read all sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Users can read their own sessions" ON sessions;
CREATE POLICY "Users can read their own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read analytics" ON analytics;
CREATE POLICY "Admins can read analytics"
  ON analytics FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can read AI metrics" ON ai_metrics;
CREATE POLICY "Admins can read AI metrics"
  ON ai_metrics FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can read moderation metrics" ON moderation_metrics;
CREATE POLICY "Admins can read moderation metrics"
  ON moderation_metrics FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can read all agent ratings" ON agent_ratings;
CREATE POLICY "Admins can read all agent ratings"
  ON agent_ratings FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Users can read their own agent ratings" ON agent_ratings;
CREATE POLICY "Users can read their own agent ratings"
  ON agent_ratings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create agent ratings" ON agent_ratings;
CREATE POLICY "Users can create agent ratings"
  ON agent_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert initial data
INSERT INTO analytics (visitors, page_views, bounce_rate, avg_session_duration)
VALUES (2450, 8750, 42.5, 185)
ON CONFLICT (id) DO NOTHING;

INSERT INTO ai_metrics (avg_response_time, satisfaction_rate, total_requests, error_rate)
VALUES (1.2, 92, 8750, 0.8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO moderation_metrics (total_moderated, flagged_content, approval_rate, active_rules)
VALUES (5280, 124, 97.6, 18)
ON CONFLICT (id) DO NOTHING;

-- Enable realtime
alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table analytics;
alter publication supabase_realtime add table ai_metrics;
alter publication supabase_realtime add table moderation_metrics;
alter publication supabase_realtime add table agent_ratings;
