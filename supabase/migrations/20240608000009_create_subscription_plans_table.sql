-- Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_annual DECIMAL(10, 2) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add some default plans if the table is empty
INSERT INTO subscription_plans (name, code, description, price_monthly, price_annual, features, is_popular)
SELECT 'Free', 'free', 'For individuals just getting started', 0, 0, 
  '[{"name":"1,000 messages per month"},{"name":"1 AI agent"},{"name":"Web integration only"},{"name":"Basic analytics"}]'::jsonb, false
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE code = 'free');

INSERT INTO subscription_plans (name, code, description, price_monthly, price_annual, features, is_popular)
SELECT 'Professional', 'pro', 'For small to medium businesses', 99, 79, 
  '[{"name":"5,000 messages per month"},{"name":"Up to 10 AI agents"},{"name":"Web, mobile, and WhatsApp integration"},{"name":"Advanced analytics"},{"name":"Team collaboration (up to 5 members)"}]'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE code = 'pro');

INSERT INTO subscription_plans (name, code, description, price_monthly, price_annual, features, is_popular)
SELECT 'Enterprise', 'enterprise', 'For large organizations with advanced needs', 499, 399, 
  '[{"name":"50,000 messages per month"},{"name":"Unlimited AI agents"},{"name":"All platform integrations"},{"name":"Advanced analytics and reporting"},{"name":"Unlimited team members"},{"name":"Dedicated support"},{"name":"Custom AI model training"}]'::jsonb, false
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE code = 'enterprise');

-- Enable row level security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read subscription plans
DROP POLICY IF EXISTS "Allow all users to read subscription plans" ON subscription_plans;
CREATE POLICY "Allow all users to read subscription plans"
  ON subscription_plans FOR SELECT
  USING (true);

-- Add to realtime publication
alter publication supabase_realtime add table subscription_plans;
