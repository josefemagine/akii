-- Add RLS policy for profiles table to allow users to read their own profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Allow users to read their own profiles'
  ) THEN
    CREATE POLICY "Allow users to read their own profiles"
    ON profiles
    FOR SELECT
    USING (auth.uid() = id);
  END IF;
END $$;

-- Enable realtime for profiles table only if not already in publication
DO $$
DECLARE
  profile_count integer;
BEGIN
  SELECT COUNT(*) INTO profile_count
  FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime'
  AND tablename = 'profiles'
  AND schemaname = 'public';
  
  IF profile_count = 0 THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
END $$;