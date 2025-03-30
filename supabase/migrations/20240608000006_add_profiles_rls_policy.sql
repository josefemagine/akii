-- Add RLS policy for profiles table to allow users to read their own profiles
CREATE POLICY "Allow users to read their own profiles"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Enable realtime for profiles table
alter publication supabase_realtime add table profiles;