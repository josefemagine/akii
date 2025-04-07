-- Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  message_limit INTEGER,
  agent_limit INTEGER,
  features JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  stripe_product_id TEXT,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_product_id ON subscription_plans(stripe_product_id) WHERE stripe_product_id IS NOT NULL;

-- Add RLS policies for subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can view active plans
CREATE POLICY "Anyone can view active plans" ON subscription_plans
  FOR SELECT 
  USING (is_active = TRUE);

-- Only admins can insert, update, delete plans
CREATE POLICY "Only admins can insert plans" ON subscription_plans
  FOR INSERT
  WITH CHECK (
    (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Only admins can update plans" ON subscription_plans
  FOR UPDATE
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Only admins can delete plans" ON subscription_plans
  FOR DELETE
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

-- Create subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  subscription_item_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  billing_cycle TEXT DEFAULT 'monthly',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for subscriptions table
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- Add RLS policies for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON subscriptions
  FOR SELECT
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

-- Stripe webhook service can create/update subscriptions
CREATE POLICY "Service roles can manage subscriptions" ON subscriptions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create invoices table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  stripe_invoice_id TEXT,
  amount_due DECIMAL(10, 2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  invoice_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for invoices table
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id) WHERE stripe_invoice_id IS NOT NULL;

-- Add RLS policies for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Users can view their own invoices
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all invoices
CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

-- Stripe webhook service can create/update invoices
CREATE POLICY "Service roles can manage invoices" ON invoices
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role'); 