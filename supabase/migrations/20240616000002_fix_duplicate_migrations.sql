-- Clean up duplicate migrations from schema_migrations table
-- This allows Supabase to start properly without errors related to duplicate key violations

DO $$
DECLARE
    duplicate_count INT;
BEGIN
    -- Check for potential duplicate migrations
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT version, COUNT(*) 
        FROM supabase_migrations.schema_migrations 
        GROUP BY version 
        HAVING COUNT(*) > 1
    ) dupes;
    
    IF duplicate_count > 0 THEN
        -- Delete duplicate records keeping only one instance of each version
        DELETE FROM supabase_migrations.schema_migrations a
        WHERE a.ctid <> (
            SELECT MIN(b.ctid)
            FROM supabase_migrations.schema_migrations b
            WHERE a.version = b.version
        );
        
        RAISE NOTICE 'Removed % duplicate migration records', duplicate_count;
    ELSE
        RAISE NOTICE 'No duplicate migrations found';
    END IF;

    -- Also fix any migrations with null values which might cause issues
    UPDATE supabase_migrations.schema_migrations
    SET statements = '[]'::jsonb
    WHERE statements IS NULL;
END $$; 