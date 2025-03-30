-- Add additional fields to profiles table for better subscription tracking

-- Add field for tracking when subscription was last updated
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add field for tracking subscription renewal date
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_renews_at TIMESTAMPTZ;

-- Add field for tracking payment method
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_method_type TEXT;

-- Add field for tracking customer ID in payment processor
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_customer_id TEXT;

-- Add field for tracking subscription ID in payment processor
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_subscription_id TEXT;

-- Add field for tracking if user has been notified about trial ending
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_notification_sent BOOLEAN DEFAULT FALSE;

-- Add field for tracking if user has been notified about usage limits
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_limit_notification_sent BOOLEAN DEFAULT FALSE;

-- Add field for tracking add-ons
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_addons JSONB DEFAULT '{}'::jsonb;

-- NOTE: We're not adding the profiles table to supabase_realtime publication
-- because it's already a member of the publication.
-- The error was: ERROR: 42710: relation "profiles" is already member of publication "supabase_realtime"
