-- Create the column_exists function if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'column_exists'
    ) THEN
        CREATE OR REPLACE FUNCTION public.column_exists(
            table_name text,
            column_name text
        )
        RETURNS boolean
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $$
        DECLARE
            column_exists boolean;
        BEGIN
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = column_exists.table_name
                AND column_name = column_exists.column_name
            ) INTO column_exists;
            
            RETURN column_exists;
        END;
        $$;

        -- Grant execute permission to authenticated users
        GRANT EXECUTE ON FUNCTION public.column_exists(text, text) TO authenticated;
        
        -- Add a comment to the function
        COMMENT ON FUNCTION public.column_exists(text, text) IS 'Check if a column exists in a table';
    END IF;
END
$$; 