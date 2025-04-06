-- Function to check if a table exists in the database
-- This is used by the frontend to check if the bedrock_credentials table exists
-- before trying to query it

CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = $1
  );
END;
$$;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION check_table_exists(text) TO authenticated;

-- Add comment
COMMENT ON FUNCTION check_table_exists IS 'Checks if a table exists in the public schema'; 