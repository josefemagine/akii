-- Update existing plans to match the new pricing and features

-- First, check if there are any existing subscriptions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.subscriptions LIMIT 1) THEN
    -- If subscriptions exist, we need to handle them carefully
    -- For now, we'll just update the existing plans without deleting them
    UPDATE public.plans SET name = 'Basic', description = 'For small teams starting with AI', price_monthly = 29, price_yearly = 290, features = '{"agents": 3, "platforms": 3, "training_mb": 5}', message_limit = 1000 WHERE name = 'Free';
    
    UPDATE public.plans SET name = 'Pro', description = 'Best for SMBs using AI across daily operations', price_monthly = 99, price_yearly = 990, features = '{"agents": 10, "platforms": 5, "training_mb": 20}', message_limit = 5000 WHERE name = 'Starter';
    
    UPDATE public.plans SET name = 'Scale', description = 'For growing companies that need volume + performance', price_monthly = 499, price_yearly = 4990, features = '{"agents": 25, "platforms": 10, "training_mb": 100}', message_limit = 25000 WHERE name = 'Professional';
    
    UPDATE public.plans SET description = 'Custom solutions for large organizations', features = '{"agents": null, "platforms": null, "training_mb": 1000, "priority_support": true, "custom_branding": true, "dedicated_support": true, "custom_models": true, "on_premise": true, "sla": true}', message_limit = 50000 WHERE name = 'Enterprise';
  ELSE
    -- If no subscriptions exist, we can safely delete and recreate the plans
    DELETE FROM public.plans;
    
    -- Insert updated plans
    INSERT INTO public.plans (name, description, price_monthly, price_yearly, features, message_limit, is_active)
    VALUES 
    ('Basic', 'For small teams starting with AI', 29, 290, '{"agents": 3, "platforms": 3, "training_mb": 5}', 1000, true),
    ('Pro', 'Best for SMBs using AI across daily operations', 99, 990, '{"agents": 10, "platforms": 5, "training_mb": 20}', 5000, true),
    ('Scale', 'For growing companies that need volume + performance', 499, 4990, '{"agents": 25, "platforms": 10, "training_mb": 100}', 25000, true),
    ('Enterprise', 'Custom solutions for large organizations', 0, 0, '{"agents": null, "platforms": null, "training_mb": 1000, "priority_support": true, "custom_branding": true, "dedicated_support": true, "custom_models": true, "on_premise": true, "sla": true}', 50000, true);
  END IF;
END
$$;