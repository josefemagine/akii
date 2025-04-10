-- Create the execute_sql function if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'execute_sql'
    ) THEN
        CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
        RETURNS JSONB
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $$
        DECLARE
            result JSONB;
        BEGIN
            EXECUTE sql;
            RETURN jsonb_build_object('success', true);
        EXCEPTION WHEN OTHERS THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', SQLERRM,
                'errorcode', SQLSTATE
            );
        END;
        $$;

        -- Grant execute permission to authenticated users
        GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated;
        
        -- Add a comment to the function
        COMMENT ON FUNCTION public.execute_sql(text) IS 'Execute arbitrary SQL with security definer privileges';
    END IF;
END
$$; 