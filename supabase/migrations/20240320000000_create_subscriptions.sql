-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free',
    status TEXT NOT NULL DEFAULT 'active',
    message_limit INTEGER NOT NULL DEFAULT 1000,
    messages_used INTEGER NOT NULL DEFAULT 0,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    renews_at TIMESTAMP WITH TIME ZONE,
    addons JSONB DEFAULT '{}'::jsonb,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_plan CHECK (plan IN ('free', 'pro', 'enterprise')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'trial', 'cancelled', 'expired'))
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Add comment to the table
COMMENT ON TABLE public.subscriptions IS 'Stores user subscription information';

-- Create trigger to update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Remove subscription column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS subscription;

-- Create function to handle subscription creation
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create subscription for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_subscription();

-- Grant access to authenticated users
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
    ON public.subscriptions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
    ON public.subscriptions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id); 