-- Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_annual DECIMAL(10, 2) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add code column constraint if it doesn't exist
DO $$
BEGIN
  -- First ensure the column exists
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscription_plans'
    AND column_name = 'code'
  ) AND NOT EXISTS (
    SELECT FROM pg_constraint
    WHERE conname = 'subscription_plans_code_key'
  ) THEN
    ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_code_key UNIQUE (code);
  END IF;
END $$;

-- Add some default plans if the table is empty
DO $$
BEGIN
  -- Only insert if table exists and is empty
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'subscription_plans'
  ) AND NOT EXISTS (SELECT 1 FROM subscription_plans LIMIT 1) THEN
    
    -- Free plan
    INSERT INTO subscription_plans (name, code, description, price_monthly, price_annual, features, is_popular)
    VALUES ('Free', 'free', 'For individuals just getting started', 0, 0, 
      '[{"name":"1,000 messages per month"},{"name":"1 AI agent"},{"name":"Web integration only"},{"name":"Basic analytics"}]'::jsonb, false);

    -- Professional plan  
    INSERT INTO subscription_plans (name, code, description, price_monthly, price_annual, features, is_popular)
    VALUES ('Professional', 'pro', 'For small to medium businesses', 99, 79, 
      '[{"name":"5,000 messages per month"},{"name":"Up to 10 AI agents"},{"name":"Web, mobile, and WhatsApp integration"},{"name":"Advanced analytics"},{"name":"Team collaboration (up to 5 members)"}]'::jsonb, true);

    -- Enterprise plan
    INSERT INTO subscription_plans (name, code, description, price_monthly, price_annual, features, is_popular)
    VALUES ('Enterprise', 'enterprise', 'For large organizations with advanced needs', 499, 399, 
      '[{"name":"50,000 messages per month"},{"name":"Unlimited AI agents"},{"name":"All platform integrations"},{"name":"Advanced analytics and reporting"},{"name":"Unlimited team members"},{"name":"Dedicated support"},{"name":"Custom AI model training"}]'::jsonb, false);
  END IF;
END $$;

-- Enable row level security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read subscription plans
DROP POLICY IF EXISTS "Allow all users to read subscription plans" ON subscription_plans;
CREATE POLICY "Allow all users to read subscription plans"
  ON subscription_plans FOR SELECT
  USING (true);

-- Add to realtime publication only if it's not already a member
DO $$
DECLARE
  subscription_plans_count integer;
BEGIN
  SELECT COUNT(*) INTO subscription_plans_count
  FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime'
  AND tablename = 'subscription_plans'
  AND schemaname = 'public';
  
  IF subscription_plans_count = 0 THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE subscription_plans;
  END IF;
END $$;
