-- Grant necessary permissions for edge functions to access service role key

-- Ensure the service role has proper permissions
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT SELECT ON auth.users TO service_role;

-- Ensure anon role has necessary permissions for basic operations
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.profiles TO anon;

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
