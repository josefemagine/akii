-- Migration to fix vector extension in public schema warning
-- WARNING: This migration requires superuser privileges
-- and might temporarily break functionality that relies on the vector extension

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Only run this part if vector extension is in public schema
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'vector' 
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    -- Move vector extension to extensions schema
    ALTER EXTENSION vector SET SCHEMA extensions;
    
    -- Update permissions on extensions schema
    REVOKE ALL ON SCHEMA extensions FROM PUBLIC;
    GRANT USAGE ON SCHEMA extensions TO authenticated;
    GRANT USAGE ON SCHEMA extensions TO service_role;
    
    -- Update function access
    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO authenticated;
    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO service_role;
    
    -- Add comment for documentation
    COMMENT ON EXTENSION vector IS 'Vector extension moved to extensions schema for security';
  ELSE
    RAISE NOTICE 'Vector extension is not in public schema or does not exist';
  END IF;
END;
$$; 