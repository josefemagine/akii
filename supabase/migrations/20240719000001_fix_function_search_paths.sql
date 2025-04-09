-- Migration to fix search_path security warnings in functions
-- Note: This migration only modifies the function definitions to add SET search_path
-- and doesn't change the function logic

-- Function: create_teams_table_if_not_exists
CREATE OR REPLACE FUNCTION public.create_teams_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if teams table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'teams') THEN
    -- Create teams table
    CREATE TABLE public.teams (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      created_by UUID REFERENCES auth.users(id),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Enable row level security
    ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Team members can view their teams"
      ON public.teams FOR SELECT
      USING (id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

    CREATE POLICY "Team owners can update their teams"
      ON public.teams FOR UPDATE
      USING (id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'owner'));

    -- Enable realtime
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END;
$$;

-- Function: create_team_members_table_if_not_exists
CREATE OR REPLACE FUNCTION public.create_team_members_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if team_members table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_members') THEN
    -- Create team_members table
    CREATE TABLE public.team_members (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      ai_instance_access JSONB DEFAULT '[]'::jsonb,
      UNIQUE(team_id, user_id)
    );

    -- Enable row level security
    ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Team members can view their team members"
      ON public.team_members FOR SELECT
      USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

    CREATE POLICY "Team owners can manage team members"
      ON public.team_members FOR ALL
      USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'owner'));

    -- Enable realtime
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END;
$$;

-- Function: create_team_ai_instance_access_table_if_not_exists
CREATE OR REPLACE FUNCTION public.create_team_ai_instance_access_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if team_ai_instance_access table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_ai_instance_access') THEN
    -- Create team_ai_instance_access table
    CREATE TABLE public.team_ai_instance_access (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
      ai_instance_id UUID NOT NULL,
      access_level TEXT NOT NULL DEFAULT 'read',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE(team_id, ai_instance_id)
    );

    -- Enable row level security
    ALTER TABLE public.team_ai_instance_access ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Team members can view their team's AI instance access"
      ON public.team_ai_instance_access FOR SELECT
      USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

    CREATE POLICY "Team owners can manage AI instance access"
      ON public.team_ai_instance_access FOR ALL
      USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'owner'));

    -- Enable realtime
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.team_ai_instance_access;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END;
$$;

-- Function: create_ai_instances_table_if_not_exists
CREATE OR REPLACE FUNCTION public.create_ai_instances_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if ai_instances table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_instances') THEN
    -- Create ai_instances table
    CREATE TABLE public.ai_instances (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      model TEXT NOT NULL,
      owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      settings JSONB DEFAULT '{}'::jsonb,
      status TEXT DEFAULT 'active'
    );

    -- Enable row level security
    ALTER TABLE public.ai_instances ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view their own AI instances"
      ON public.ai_instances FOR SELECT
      USING (owner_id = auth.uid() OR id IN (
        SELECT ai_instance_id FROM public.team_ai_instance_access 
        WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
      ));

    CREATE POLICY "Users can manage their own AI instances"
      ON public.ai_instances FOR ALL
      USING (owner_id = auth.uid());

    -- Enable realtime
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_instances;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END;
$$;

-- Function: update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name,
    last_name,
    company,
    role, 
    status, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'company',
    'user',
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    company = COALESCE(EXCLUDED.company, profiles.company),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$; 