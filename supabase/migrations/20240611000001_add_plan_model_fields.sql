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

-- Optional: Update existing plans
UPDATE subscription_plans
SET 
  bedrock_model_id = CASE 
    WHEN code = 'free' OR code = 'starter' THEN 'amazon.titan-text-lite-v1'
    WHEN code = 'pro' THEN 'amazon.titan-text-express-v1'
    WHEN code = 'business' THEN 'anthropic.claude-instant-v1'
    WHEN code = 'enterprise' THEN 'anthropic.claude-v2'
    ELSE 'amazon.titan-text-lite-v1'
  END,
  has_trial = CASE 
    WHEN code = 'starter' THEN true
    ELSE false
  END,
  trial_days = CASE 
    WHEN code = 'starter' THEN 14
    ELSE 0
  END,
  message_limit = CASE 
    WHEN code = 'free' THEN 1000
    WHEN code = 'starter' THEN 5000
    WHEN code = 'pro' THEN 20000
    WHEN code = 'business' THEN 50000
    WHEN code = 'enterprise' THEN 100000
    ELSE 1000
  END,
  has_overage = CASE 
    WHEN code = 'pro' OR code = 'business' OR code = 'enterprise' THEN true
    ELSE false
  END,
  overage_rate = CASE 
    WHEN code = 'pro' THEN 0.005
    WHEN code = 'business' THEN 0.004
    WHEN code = 'enterprise' THEN 0.003
    ELSE 0.00
  END
WHERE EXISTS (SELECT 1 FROM subscription_plans);

-- Comment explaining the migration
COMMENT ON TABLE subscription_plans IS 'Subscription plans with Bedrock model associations and pricing details';
COMMENT ON COLUMN subscription_plans.bedrock_model_id IS 'AWS Bedrock model ID assigned to this plan';
COMMENT ON COLUMN subscription_plans.has_trial IS 'Whether this plan offers a free trial';
COMMENT ON COLUMN subscription_plans.trial_days IS 'Number of days in the free trial period';
COMMENT ON COLUMN subscription_plans.message_limit IS 'Monthly message limit for this plan';
COMMENT ON COLUMN subscription_plans.has_overage IS 'Whether overage pricing is enabled for this plan';
COMMENT ON COLUMN subscription_plans.overage_rate IS 'Per-1000 token rate for overage pricing'; 