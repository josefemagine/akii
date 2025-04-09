-- Check if subscription_plans table exists and modify it
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'subscription_plans'
  ) THEN
    -- Add any missing columns to the existing table
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'subscription_plans'
      AND column_name = 'stripe_product_id'
    ) THEN
      ALTER TABLE subscription_plans ADD COLUMN stripe_product_id TEXT;
    END IF;
    
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'subscription_plans'
      AND column_name = 'stripe_price_id_monthly'
    ) THEN
      ALTER TABLE subscription_plans ADD COLUMN stripe_price_id_monthly TEXT;
    END IF;
    
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'subscription_plans'
      AND column_name = 'stripe_price_id_yearly'
    ) THEN
      ALTER TABLE subscription_plans ADD COLUMN stripe_price_id_yearly TEXT;
    END IF;
    
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'subscription_plans'
      AND column_name = 'message_limit'
    ) THEN
      ALTER TABLE subscription_plans ADD COLUMN message_limit INTEGER;
    END IF;
    
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'subscription_plans'
      AND column_name = 'agent_limit'
    ) THEN
      ALTER TABLE subscription_plans ADD COLUMN agent_limit INTEGER;
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'subscription_plans'
      AND column_name = 'is_active'
    ) THEN
      ALTER TABLE subscription_plans ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
    
    -- Rename price_annual to price_yearly if needed
    IF EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'subscription_plans'
      AND column_name = 'price_annual'
    ) AND NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'subscription_plans'
      AND column_name = 'price_yearly'
    ) THEN
      ALTER TABLE subscription_plans RENAME COLUMN price_annual TO price_yearly;
    END IF;
    
  ELSE
    -- Create the table if it doesn't exist
    CREATE TABLE subscription_plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      code TEXT UNIQUE,
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
  END IF;
END $$;

-- Check if is_admin column exists in profiles
DO $$
BEGIN
  -- Add is_admin column to profiles if it doesn't exist
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

-- Check if profiles table exists and add the needed columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    CREATE TABLE profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT,
      first_name TEXT,
      last_name TEXT,
      avatar_url TEXT,
      is_admin BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Check if is_active column exists and create indexes
DO $$
BEGIN
  -- Check if is_active column exists before creating the index
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscription_plans'
    AND column_name = 'is_active'
  ) THEN
    -- Create indexes if they don't already exist
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans(is_active)';
  END IF;
  
  -- Check if stripe_product_id column exists before creating the index
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscription_plans'
    AND column_name = 'stripe_product_id'
  ) THEN
    -- Create index for stripe_product_id
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_product_id ON subscription_plans(stripe_product_id) WHERE stripe_product_id IS NOT NULL';
  END IF;
END
$$;

-- Add RLS policies for subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones
DROP POLICY IF EXISTS "Anyone can view active plans" ON subscription_plans;
DROP POLICY IF EXISTS "Anyone can view all plans" ON subscription_plans;
DROP POLICY IF EXISTS "Only admins can insert plans" ON subscription_plans;
DROP POLICY IF EXISTS "Only admins can update plans" ON subscription_plans;
DROP POLICY IF EXISTS "Only admins can delete plans" ON subscription_plans;
DROP POLICY IF EXISTS "Allow all users to read subscription plans" ON subscription_plans;

-- Create policy based on is_active column existence
DO $$
BEGIN
  -- Check if is_active column exists
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscription_plans'
    AND column_name = 'is_active'
  ) THEN
    -- Anyone can view active plans if is_active exists
    EXECUTE 'CREATE POLICY "Anyone can view active plans" ON subscription_plans
      FOR SELECT 
      USING (is_active = TRUE)';
  ELSE
    -- Fallback policy for all users to view plans
    EXECUTE 'CREATE POLICY "Anyone can view all plans" ON subscription_plans
      FOR SELECT 
      USING (true)';
  END IF;
END $$;

-- Create admin policies with checks for is_admin column
DO $$
BEGIN
  -- Check if is_admin column exists in profiles
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name = 'is_admin'
  ) THEN
    -- Only admins can insert plans
    EXECUTE 'CREATE POLICY "Only admins can insert plans" ON subscription_plans
      FOR INSERT
      WITH CHECK (
        (SELECT is_admin FROM profiles WHERE id = auth.uid())
      )';
    
    -- Only admins can update plans
    EXECUTE 'CREATE POLICY "Only admins can update plans" ON subscription_plans
      FOR UPDATE
      USING (
        (SELECT is_admin FROM profiles WHERE id = auth.uid())
      )';
    
    -- Only admins can delete plans
    EXECUTE 'CREATE POLICY "Only admins can delete plans" ON subscription_plans
      FOR DELETE
      USING (
        (SELECT is_admin FROM profiles WHERE id = auth.uid())
      )';
  ELSE
    -- If is_admin doesn't exist, create a policy for service_role
    EXECUTE 'CREATE POLICY "Service role can manage plans" ON subscription_plans
      FOR ALL
      USING (auth.jwt() ->> ''role'' = ''service_role'')
      WITH CHECK (auth.jwt() ->> ''role'' = ''service_role'')';
  END IF;
END $$;

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

-- Check if stripe_subscription_id column exists before creating the index
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscriptions'
    AND column_name = 'stripe_subscription_id'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL';
  END IF;
END $$;

-- Add RLS policies for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists before creating it
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;

-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all subscriptions
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name = 'is_admin'
  ) THEN
    DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
    EXECUTE 'CREATE POLICY "Admins can view all subscriptions" ON subscriptions
      FOR SELECT
      USING (
        (SELECT is_admin FROM profiles WHERE id = auth.uid())
      )';
  END IF;
END $$;

-- Drop service role policy if it exists
DROP POLICY IF EXISTS "Service roles can manage subscriptions" ON subscriptions;

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

-- Drop policies before creating them
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can view all invoices" ON invoices;
DROP POLICY IF EXISTS "Service roles can manage invoices" ON invoices;

-- Users can view their own invoices
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all invoices
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name = 'is_admin'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view all invoices" ON invoices
      FOR SELECT
      USING (
        (SELECT is_admin FROM profiles WHERE id = auth.uid())
      )';
  END IF;
END $$;

-- Stripe webhook service can create/update invoices
CREATE POLICY "Service roles can manage invoices" ON invoices
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role'); 