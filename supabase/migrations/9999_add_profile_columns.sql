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

-- Add is_admin field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add address fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address1 TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address2 TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zip TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;

-- Add comment for the is_admin column
COMMENT ON COLUMN public.profiles.is_admin IS 'Indicates if the user has admin privileges';
COMMENT ON COLUMN public.profiles.address1 IS 'Primary address line';
COMMENT ON COLUMN public.profiles.address2 IS 'Secondary address line (apt, suite, etc.)';
COMMENT ON COLUMN public.profiles.city IS 'City';
COMMENT ON COLUMN public.profiles.state IS 'State or province';
COMMENT ON COLUMN public.profiles.zip IS 'Postal/ZIP code';
COMMENT ON COLUMN public.profiles.country IS 'Country';

-- Update admin status for users with admin role
UPDATE public.profiles
SET is_admin = true
WHERE role = 'admin' AND (is_admin IS NULL OR is_admin = false); 