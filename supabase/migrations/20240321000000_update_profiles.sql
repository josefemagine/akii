-- Update profiles table to include subscription fields (skip role which is already added)
DO $$
BEGIN
    -- Check if subscription column doesn't exist before adding
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'subscription'
    ) THEN
        ALTER TABLE profiles
        ADD COLUMN subscription jsonb NOT NULL DEFAULT '{
          "plan": "free",
          "status": "active",
          "messageLimit": 1000,
          "messagesUsed": 0,
          "trialEndsAt": null,
          "renewsAt": null,
          "addons": {},
          "paymentMethod": null
        }'::jsonb;

        -- Add normal index for subscription status instead of GIN index
        CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx ON profiles((subscription->>'status'));
    END IF;
END
$$;

-- Add comment to the table
COMMENT ON TABLE profiles IS 'User profiles with role and subscription information'; 