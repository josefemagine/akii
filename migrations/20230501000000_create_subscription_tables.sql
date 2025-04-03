-- Create subscription and payment tables for user management
-- This migration adds the plans, subscriptions, payment_methods, and invoices tables

-- Plans table - stores subscription plan information
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2) NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS to plans table
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for plans table
DROP POLICY IF EXISTS "Plans are viewable by authenticated users" ON public.plans;
DROP POLICY IF EXISTS "Plans are editable by admins" ON public.plans;

-- Policies for plans table
CREATE POLICY "Plans are viewable by authenticated users"
  ON public.plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Plans are editable by admins"
  ON public.plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Subscriptions table - stores user subscription information
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'expired', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  next_billing_date TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS to subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for subscriptions table
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admin users can manage all subscriptions" ON public.subscriptions;

-- Policies for subscriptions table
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can manage all subscriptions"
  ON public.subscriptions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Payment methods table - stores user payment method information
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit_card', 'paypal', 'bank_transfer', 'other')),
  details JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS to payment_methods table
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for payment_methods table
DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can manage their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admin users can view all payment methods" ON public.payment_methods;

-- Policies for payment_methods table
CREATE POLICY "Users can view their own payment methods"
  ON public.payment_methods FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own payment methods"
  ON public.payment_methods FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin users can view all payment methods"
  ON public.payment_methods FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Invoices table - stores billing information
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid', 'pending', 'failed', 'refunded')),
  billing_reason TEXT,
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  invoice_pdf_url TEXT,
  invoice_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- Add RLS to invoices table
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for invoices table
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admin users can view all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admin users can manage all invoices" ON public.invoices;

-- Policies for invoices table
CREATE POLICY "Users can view their own invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin users can view all invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can manage all invoices"
  ON public.invoices FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create or replace function to check if tables exist (used by the frontend)
CREATE OR REPLACE FUNCTION check_tables_exist(table_names TEXT[])
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}'::jsonb;
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY table_names LOOP
    result := result || jsonb_build_object(
      table_name,
      EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = table_name
      )
    );
  END LOOP;
  
  RETURN result;
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION check_tables_exist TO authenticated;

-- Add indexes for better performance (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscriptions_user_id') THEN
    CREATE INDEX idx_subscriptions_user_id ON public.subscriptions (user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_subscriptions_plan_id') THEN
    CREATE INDEX idx_subscriptions_plan_id ON public.subscriptions (plan_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payment_methods_user_id') THEN
    CREATE INDEX idx_payment_methods_user_id ON public.payment_methods (user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_user_id') THEN
    CREATE INDEX idx_invoices_user_id ON public.invoices (user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_subscription_id') THEN
    CREATE INDEX idx_invoices_subscription_id ON public.invoices (subscription_id);
  END IF;
END
$$;

-- Insert some initial plans (can be modified via admin interface later)
INSERT INTO public.plans (name, description, price_monthly, price_yearly, features, is_active)
VALUES 
  ('Basic', 'Basic plan with essential features', 9.99, 99.99, '["Feature 1", "Feature 2", "Feature 3"]'::jsonb, true),
  ('Pro', 'Professional plan with advanced features', 19.99, 199.99, '["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"]'::jsonb, true),
  ('Enterprise', 'Enterprise plan with all features', 49.99, 499.99, '["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5", "Feature A", "Feature B", "Feature C", "Feature D"]'::jsonb, true)
ON CONFLICT (id) DO NOTHING; 