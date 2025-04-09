-- Add new fields to subscription_plans table for Bedrock model integration and plan details

-- Add bedrock_model_id column for AWS Bedrock integration
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS bedrock_model_id TEXT DEFAULT 'amazon.titan-text-lite-v1';

-- Add trial information
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS has_trial BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 0;

-- Add message limit and overage settings
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS message_limit INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS has_overage BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS overage_rate DECIMAL(10, 5) DEFAULT 0.00;

-- Safe update with defaults for all plans
UPDATE subscription_plans
SET 
  bedrock_model_id = 'amazon.titan-text-lite-v1',
  has_trial = false,
  trial_days = 0,
  message_limit = 1000,
  has_overage = false,
  overage_rate = 0.00
WHERE bedrock_model_id IS NULL;

-- Comment explaining the migration
COMMENT ON TABLE subscription_plans IS 'Subscription plans with Bedrock model associations and pricing details';
COMMENT ON COLUMN subscription_plans.bedrock_model_id IS 'AWS Bedrock model ID assigned to this plan';
COMMENT ON COLUMN subscription_plans.has_trial IS 'Whether this plan offers a free trial';
COMMENT ON COLUMN subscription_plans.trial_days IS 'Number of days in the free trial period';
COMMENT ON COLUMN subscription_plans.message_limit IS 'Monthly message limit for this plan';
COMMENT ON COLUMN subscription_plans.has_overage IS 'Whether overage pricing is enabled for this plan';
COMMENT ON COLUMN subscription_plans.overage_rate IS 'Per-1000 token rate for overage pricing'; 