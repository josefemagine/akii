-- Fix RLS Policies for tables with RLS enabled but no policies
-- This script creates appropriate policies for tables that have RLS enabled but no policies defined

-- 1. Fix RLS policies for public.agents table
DO $$
BEGIN
  -- Check if the table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'agents') THEN
    -- Check if table already has policies
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'agents' AND schemaname = 'public') THEN
      -- Policy for owners to manage their own agents
      CREATE POLICY "Users can view their own agents" 
      ON public.agents FOR SELECT 
      USING (user_id = auth.uid());
      
      CREATE POLICY "Users can create their own agents" 
      ON public.agents FOR INSERT 
      WITH CHECK (user_id = auth.uid());
      
      CREATE POLICY "Users can update their own agents" 
      ON public.agents FOR UPDATE 
      USING (user_id = auth.uid());
      
      CREATE POLICY "Users can delete their own agents" 
      ON public.agents FOR DELETE 
      USING (user_id = auth.uid());
      
      RAISE NOTICE 'Added RLS policies to public.agents table';
    ELSE
      RAISE NOTICE 'public.agents table already has policies, skipping';
    END IF;
  ELSE
    RAISE NOTICE 'public.agents table does not exist, skipping';
  END IF;
END;
$$;

-- 2. Fix RLS policies for public.ai_instances table
DO $$
BEGIN
  -- Check if the table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_instances') THEN
    -- Check if table already has policies
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'ai_instances' AND schemaname = 'public') THEN
      -- Based on the schema, ai_instances has a team_id column linking to teams
      CREATE POLICY "Team members can view AI instances" 
      ON public.ai_instances FOR SELECT 
      USING (
        team_id IN (
          SELECT team_id FROM public.team_members 
          WHERE user_id = auth.uid()
        )
      );
      
      -- Only team owners/admins can manage AI instances
      CREATE POLICY "Team owners can manage AI instances" 
      ON public.ai_instances FOR ALL 
      USING (
        team_id IN (
          SELECT team_id FROM public.team_members 
          WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
      );
      
      RAISE NOTICE 'Added RLS policies to public.ai_instances table';
    ELSE
      RAISE NOTICE 'public.ai_instances table already has policies, skipping';
    END IF;
  ELSE
    RAISE NOTICE 'public.ai_instances table does not exist, skipping';
  END IF;
END;
$$;

-- 3. Fix RLS policies for public.team_ai_instance_access table
DO $$
BEGIN
  -- Check if the table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_ai_instance_access') THEN
    -- Check if table already has policies
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'team_ai_instance_access' AND schemaname = 'public') THEN
      -- Based on the schema, team_ai_instance_access has team_member_id column
      CREATE POLICY "Members can view their AI instance access" 
      ON public.team_ai_instance_access FOR SELECT 
      USING (
        team_member_id IN (
          SELECT id FROM public.team_members 
          WHERE user_id = auth.uid()
        )
      );
      
      -- Policy for team owners to manage access
      CREATE POLICY "Team owners can manage AI instance access" 
      ON public.team_ai_instance_access FOR ALL 
      USING (
        EXISTS (
          SELECT 1 FROM public.team_members tm1
          JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
          WHERE tm1.user_id = auth.uid() 
          AND tm1.role IN ('owner', 'admin')
          AND tm2.id = team_member_id
        )
      );
      
      RAISE NOTICE 'Added RLS policies to public.team_ai_instance_access table';
    ELSE
      RAISE NOTICE 'public.team_ai_instance_access table already has policies, skipping';
    END IF;
  ELSE
    RAISE NOTICE 'public.team_ai_instance_access table does not exist, skipping';
  END IF;
END;
$$;

-- If any of these tables don't have the expected columns, you may need to adjust the policies
-- by examining the table structure first and customizing the policies accordingly. 