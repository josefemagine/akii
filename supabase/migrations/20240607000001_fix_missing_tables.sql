-- Create missing subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  plan_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  payment_method TEXT
);

-- Create missing analytics table
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS but add policies to allow access
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update their own subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policies for analytics
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.analytics;
CREATE POLICY "Users can view their own analytics"
  ON public.analytics FOR SELECT
  USING (auth.uid() = user_id);

-- Add admin policies
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admins can view all analytics" ON public.analytics;
CREATE POLICY "Admins can view all analytics"
  ON public.analytics FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics;
