-- Grant necessary permissions for edge functions to access service role key

-- Ensure the service role has the right permissions for all required operations
DO $$
BEGIN
  EXECUTE 'GRANT USAGE ON SCHEMA auth TO service_role';
  EXECUTE 'GRANT SELECT ON auth.users TO service_role';
END $$;

-- Add RLS policies for key tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Service role can access all profiles'
  ) THEN
    CREATE POLICY "Service role can access all profiles"
      ON public.profiles FOR ALL
      TO service_role
      USING (true);
  END IF;
END $$;

-- Only add to realtime if not already in the publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;
