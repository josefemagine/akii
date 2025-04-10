# Admin Permission System Changes

## Overview

We've refactored the way admin permissions are managed in the application. The previous implementation used an Edge Function (`is_super_admin`) to check if a user had admin privileges, which was unnecessarily complex and introduced network latency. The new implementation:

1. Uses direct Postgres queries instead of Edge Functions
2. Consolidates permission naming from `is_super_admin` to `is_admin` for consistency
3. Stores the admin flag directly in the `profiles` table

## Key Changes

### Database Changes

Two migration files have been created:

1. `20240705000001_add_is_admin_to_profiles.sql`:
   - Adds an `is_admin` boolean column to the `profiles` table
   - Sets `is_admin = true` for any existing profiles with `role = 'admin'`
   - Creates an index for better query performance

2. `20240705000002_rename_is_super_admin_in_users_table.sql`:
   - Renames the `is_super_admin` column to `is_admin` in the `users` table if it exists
   - Creates the `is_admin` column if it doesn't exist
   - Updates indices accordingly

### Code Changes

1. `useSuperAdmin.ts` and `useSuperAdmin.js`:
   - Now perform direct database queries instead of calling the Edge Function
   - Check both the `profiles` and `users` tables for admin status
   - First look for `role = 'super_admin'` or `is_admin = true` in the `profiles` table
   - Fall back to checking the `is_admin` column in the `users` table

2. Various other references:
   - Updated interface definitions to use `is_admin` instead of `is_super_admin`
   - Updated all direct references to the column name throughout the codebase

## Benefits

- **Performance**: Direct database queries are faster than Edge Function calls
- **Simplicity**: Consolidated permission naming makes the code easier to understand
- **Reliability**: Less reliance on external services means fewer points of failure

## Migration Notes

The migration is designed to be non-disruptive:

- Existing users with `role = 'admin'` will automatically get `is_admin = true`
- The system checks multiple fields to ensure no one loses permissions during the transition
- Both old and new field names are handled during the transition period

## Using Admin Permissions

To check if a user has admin privileges:

```typescript
// Using the hook (preferred)
const { isSuperAdmin } = useSuperAdmin();

// Or directly check the profile
const hasAdminAccess = profile?.is_admin === true || profile?.role === 'admin';
``` 