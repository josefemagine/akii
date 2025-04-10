-- Migration: Remove superadmin role and functionality
-- Description: This migration documents the removal of the superadmin role and related functionality.
-- The application now uses a single isAdmin flag for administrative privileges.

-- Note: No actual database changes are being made in this migration, as we're simply
-- documenting the change in application logic. The superadmin column/field in the database
-- is kept for backward compatibility, but the application code no longer uses it.

COMMENT ON TABLE IF EXISTS profiles IS 'User profiles - NOTE: superadmin functionality has been removed, use isAdmin instead';

-- Add comments to document the changes
DO $$
BEGIN
    RAISE NOTICE 'MIGRATION: Removed superadmin role from application logic';
    RAISE NOTICE 'The application now uses a single isAdmin flag for administrative privileges';
    RAISE NOTICE 'Any role=''superadmin'' in the database should be treated as role=''admin''';
END $$; 