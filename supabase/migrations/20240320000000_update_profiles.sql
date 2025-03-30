-- Update profiles table to include role and subscription fields
ALTER TABLE profiles
ADD COLUMN role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'team_member')),
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

-- Add indexes for better query performance
CREATE INDEX profiles_role_idx ON profiles(role);
CREATE INDEX profiles_subscription_status_idx ON profiles USING gin ((subscription->>'status'));

-- Update existing profiles to have the correct role
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- Add comment to the table
COMMENT ON TABLE profiles IS 'User profiles with role and subscription information'; 