-- This migration ensures the edge function has the necessary permissions

-- First, let's make sure the service_role has all necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Ensure the anon role has appropriate read permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Make sure the edge function can access the necessary tables
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for the service_role to access these tables
DROP POLICY IF EXISTS "service_role can do everything" ON subscriptions;
CREATE POLICY "service_role can do everything"
  ON subscriptions FOR ALL
  TO service_role
  USING (true);

DROP POLICY IF EXISTS "service_role can do everything" ON analytics;
CREATE POLICY "service_role can do everything"
  ON analytics FOR ALL
  TO service_role
  USING (true);

-- Add service_role policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'service_role can do everything'
  ) THEN
    CREATE POLICY "service_role can do everything"
      ON public.subscriptions FOR ALL
      TO service_role
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'analytics' 
    AND policyname = 'service_role can do everything'
  ) THEN
    CREATE POLICY "service_role can do everything"
      ON public.analytics FOR ALL
      TO service_role
      USING (true);
  END IF;
END $$;

-- Ensure edge functions can access auth schema
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT SELECT ON auth.users TO service_role;
