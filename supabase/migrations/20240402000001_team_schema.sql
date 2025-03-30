-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create team_invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  token TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days')
);

-- Enable RLS on teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Enable RLS on team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Enable RLS on team_invitations
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for teams
DROP POLICY IF EXISTS "Teams are viewable by team members" ON teams;
CREATE POLICY "Teams are viewable by team members"
  ON teams FOR SELECT
  USING (id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Team admins can update teams" ON teams;
CREATE POLICY "Team admins can update teams"
  ON teams FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND team_id = teams.id 
    AND role = 'admin'
  ));

-- Create policy for team_members
DROP POLICY IF EXISTS "Team members are viewable by team members" ON team_members;
CREATE POLICY "Team members are viewable by team members"
  ON team_members FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Team admins can insert team members" ON team_members;
CREATE POLICY "Team admins can insert team members"
  ON team_members FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND team_id = new.team_id 
    AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Team admins can update team members" ON team_members;
CREATE POLICY "Team admins can update team members"
  ON team_members FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND team_id = team_members.team_id 
    AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Team admins can delete team members" ON team_members;
CREATE POLICY "Team admins can delete team members"
  ON team_members FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND team_id = team_members.team_id 
    AND role = 'admin'
  ));

-- Create policy for team_invitations
DROP POLICY IF EXISTS "Team invitations are viewable by team members" ON team_invitations;
CREATE POLICY "Team invitations are viewable by team members"
  ON team_invitations FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Team admins can insert invitations" ON team_invitations;
CREATE POLICY "Team admins can insert invitations"
  ON team_invitations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND team_id = new.team_id 
    AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Team admins can update invitations" ON team_invitations;
CREATE POLICY "Team admins can update invitations"
  ON team_invitations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND team_id = team_invitations.team_id 
    AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Team admins can delete invitations" ON team_invitations;
CREATE POLICY "Team admins can delete invitations"
  ON team_invitations FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid() 
    AND team_id = team_invitations.team_id 
    AND role = 'admin'
  ));

-- Create a function to automatically create a team for new users
CREATE OR REPLACE FUNCTION create_team_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_team_id UUID;
  user_email TEXT;
  user_id UUID;
BEGIN
  -- Get values from the NEW record
  user_email := NEW.email;
  user_id := NEW.id;
  
  -- Create a new team for the user
  INSERT INTO teams (name)
  VALUES (user_email || '''s Team')
  RETURNING id INTO new_team_id;
  
  -- Add the user as an admin of the team
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (new_team_id, user_id, 'admin');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS create_team_for_new_user_trigger ON auth.users;
CREATE TRIGGER create_team_for_new_user_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_team_for_new_user();

-- Add realtime support
alter publication supabase_realtime add table teams;
alter publication supabase_realtime add table team_members;
alter publication supabase_realtime add table team_invitations;