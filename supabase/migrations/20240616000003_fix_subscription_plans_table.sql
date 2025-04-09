-- Fix the subscription_plans table to ensure is_active column exists
-- Previous migration was failing due to missing column

DO $$
BEGIN
    -- Check if the subscription_plans table exists
    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'subscription_plans'
    ) THEN
        -- Check if is_active column already exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'subscription_plans' 
            AND column_name = 'is_active'
        ) THEN
            -- Add is_active column if it doesn't exist
            ALTER TABLE public.subscription_plans 
            ADD COLUMN is_active BOOLEAN DEFAULT true;
            
            RAISE NOTICE 'Added is_active column to subscription_plans table';
        ELSE
            RAISE NOTICE 'is_active column already exists in subscription_plans table';
        END IF;
        
        -- Make sure proper policy exists for active plans viewing
        IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'subscription_plans' 
            AND policyname = 'Anyone can view active plans'
        ) THEN
            DROP POLICY IF EXISTS "Anyone can view active plans" ON subscription_plans;
            CREATE POLICY "Anyone can view active plans"
              ON subscription_plans
              FOR SELECT
              USING (is_active = true);
            
            RAISE NOTICE 'Created policy for viewing active plans';
        END IF;
    ELSE
        RAISE NOTICE 'subscription_plans table does not exist yet';
    END IF;
END $$; 