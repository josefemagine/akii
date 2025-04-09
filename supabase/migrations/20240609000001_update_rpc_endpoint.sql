-- Update RPC endpoint from run_sql to execute_sql
-- This migration addresses the 404 error when accessing the run_sql endpoint

-- If there are any existing functions using run_sql, they should be updated
-- For example:

-- DROP FUNCTION IF EXISTS run_sql;
-- CREATE FUNCTION execute_sql(query text) RETURNS json AS $$
-- BEGIN
--   RETURN (SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM query_result) t);
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The actual implementation will depend on your specific database setup
-- This is just a placeholder migration to document the change
