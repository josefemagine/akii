-- Create teams table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Create team_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ai_instance_access JSONB DEFAULT '[]'::jsonb,
    UNIQUE(team_id, user_id)
);

-- Create ai_instances table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ai_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active'
);

-- Create team_ai_instance_access table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.team_ai_instance_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    ai_instance_id UUID REFERENCES public.ai_instances(id) ON DELETE CASCADE,
    access_level TEXT DEFAULT 'read',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(team_id, ai_instance_id)
);

-- Enable RLS on teams table
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Enable RLS on team_members table
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Enable RLS on ai_instances table
ALTER TABLE public.ai_instances ENABLE ROW LEVEL SECURITY;

-- Enable RLS on team_ai_instance_access table
ALTER TABLE public.team_ai_instance_access ENABLE ROW LEVEL SECURITY;

-- Create policy for teams table
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;
CREATE POLICY "Team members can view their teams"
    ON public.teams
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_members.team_id = teams.id
            AND team_members.user_id = auth.uid()
        )
    );

-- Create policy for team_members table
DROP POLICY IF EXISTS "Team members can view their team members" ON public.team_members;
CREATE POLICY "Team members can view their team members"
    ON public.team_members
    FOR SELECT
    USING (
        team_id IN (
            SELECT team_id FROM public.team_members
            WHERE user_id = auth.uid()
        )
    );

-- Add tables to realtime publication if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        -- Check if tables are already in the publication
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = 'teams'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE teams;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = 'team_members'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = 'ai_instances'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE ai_instances;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = 'team_ai_instance_access'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE team_ai_instance_access;
        END IF;
    END IF;
END
$$;