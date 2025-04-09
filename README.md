# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Authentication System

### Overview

The authentication system has been refactored to consolidate and simplify the implementation. The new structure features:

1. **Centralized Type System** - A unified set of authentication-related types in a single file for consistency.
2. **Shared Auth Utilities** - Common auth functions extracted into reusable utilities.
3. **Consolidated Auth Components** - A set of standardized, reusable authentication UI components.
4. **Unified Auth Context** - A React context that provides authentication state and methods throughout the application.

### Key Files

- **`src/types/auth.ts`** - Centralized type definitions for auth-related interfaces and constants.
- **`src/lib/auth-utils.ts`** - Reusable utility functions for auth operations.
- **`src/components/auth/AuthLogin.tsx`** - Unified login component that handles both display and form submission.
- **`src/components/auth/AuthStateManager.tsx`** - Manages and broadcasts auth state changes to the application.
- **`src/contexts/UnifiedAuthContext.tsx`** - React context provider for auth state.

### Architecture Improvements

The refactored authentication system follows these best practices:

1. **Separation of Concerns**:
   - Types are defined separately from implementation
   - UI components are decoupled from business logic
   - Event handling is centralized in dedicated components

2. **Type Safety**:
   - Consistent interfaces across the application
   - Improved type checking and autocompletion
   - Reduced use of `any` types

3. **Code Reusability**:
   - Shared utility functions prevent code duplication
   - Standardized components ensure consistent UI/UX
   - Common event handlers reduce redundant code

### Usage

```tsx
// Import the auth hook
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { AuthLogin } from '@/components/auth/AuthLogin';

function MyComponent() {
  // Access auth state and methods
  const { 
    user, 
    profile, 
    isAdmin, 
    hasUser,
    hasProfile, 
    signIn, 
    signOut,
    updateProfile 
  } = useAuth();

  // For custom sign-in handling
  const handleLogin = async (email, password) => {
    try {
      await signIn(email, password);
      // Success handling
    } catch (error) {
      // Error handling
    }
  };

  // Or use the unified component for a complete solution
  return (
    <div>
      {hasUser ? (
        <div>
          <h1>Welcome, {profile?.first_name || user?.email}</h1>
          <button onClick={() => signOut()}>Sign Out</button>
        </div>
      ) : (
        <AuthLogin 
          redirectPath="/dashboard" 
          showGoogleSignIn={true}
        />
      )}
    </div>
  );
}
```

### Implementation Details

#### Profile Type Standardization

The `Profile` interface is now defined in a single location (`types/auth.ts`) and imported throughout the application:

```typescript
export interface Profile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  // Additional fields...
}
```

#### Event Broadcasting

Auth state changes are broadcast using standardized custom events:

```typescript
// Event constants
export const AUTH_STATE_CHANGE_EVENT = 'akii:auth:stateChange';
export const AUTH_ERROR_EVENT = 'akii:auth:error';
export const AUTH_RECOVERY_EVENT = 'akii:auth:recovery';
```

#### Unified Components

The `AuthLogin` component provides a complete authentication solution that handles:
- Login form display and validation
- User authentication status
- Google sign-in integration
- Success/error messaging
- Redirection after authentication

### Migration Plan

The authentication system is currently in a transition phase. The following roadmap is planned:

1. **Phase 1** - Define centralized types and utilities (COMPLETED)
2. **Phase 2** - Create standardized authentication components (COMPLETED)
3. **Phase 3** - Update remaining components to use the new system (IN PROGRESS)

Developers should use the new authentication system for new components and gradually update existing components during regular maintenance.

## Building for Production

To build the project for production, run:

```bash
npm run build
```

The production build uses Vite's build system to create optimized assets without running TypeScript type checking, which improves build performance. 

If you want to ensure type safety during the build process, use:

```bash
npm run build-with-type-check
```

The project includes several TypeScript files related to auth context refactoring that are intentionally excluded from type checking in `tsconfig.json` and from Vite's build process. These files will be removed in a future update once the migration is complete.

## Bedrock API Endpoints

The application includes serverless API endpoints for AWS Bedrock integration. These endpoints use Next.js API routes, following Vercel's recommended pattern for JavaScript functions.

### Available Endpoints:

- **GET /api/bedrock** - Health check and documentation endpoint
- **GET /api/bedrock/instances** - Lists all Bedrock instances (requires API key)
- **POST /api/bedrock/provision-instance** - Provisions a new Bedrock instance (requires API key)
- **POST /api/bedrock/delete-instance** - Deletes a Bedrock instance (requires API key)
- **GET /api/bedrock/test-env** - Tests environment variable loading (requires API key)

### Implementation Details:

The API endpoints are implemented using Next.js API routes in the `/pages/api/bedrock-next/` directory. For backwards compatibility, the application includes URL rewrites in both `next.config.js` and `vercel.json` to route requests from the legacy `/api/bedrock/` path to the new Next.js API routes.

### API Configuration:

All endpoints share common utility functions for API key validation, environment variable access, and database operations, defined in the following files:
- `/api/bedrock/config.js` - Common configuration and validation functions
- `/api/bedrock/env-utils.js` - Environment variable utilities
- `/api/bedrock/db-utils.js` - Database access functions

## Environment Variable Configuration

This project uses environment variables for configuration. The application reads environment variables from multiple sources to ensure compatibility with various deployment environments.

### Required Environment Variables

- `VITE_SUPABASE_URL` - The URL of your Supabase instance
- `VITE_SUPABASE_ANON_KEY` - The anonymous key for Supabase authentication
- `BEDROCK_API_KEY` - API key for AWS Bedrock service

### Environment Variable Handling

To ensure maximum compatibility in different environments, the application uses a utility function to retrieve environment variables using various naming patterns:

1. Standard variable name (e.g., `SUPABASE_URL`)
2. Without `VITE_` prefix (if the variable starts with `VITE_`)
3. With `NEXT_` prefix (e.g., `NEXT_SUPABASE_URL`)
4. With `NEXT_PUBLIC_` prefix (e.g., `NEXT_PUBLIC_SUPABASE_URL`)

This ensures that the application can retrieve the necessary variables regardless of the specific deployment environment (Vercel, local development, etc.).

### Deployment on Vercel

When deploying on Vercel, be sure to set the following environment variables:

1. In your Vercel project settings, add the following environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `BEDROCK_API_KEY`
   - `SUPABASE_URL` (same value as `VITE_SUPABASE_URL`)
   - `SUPABASE_ANON_KEY` (same value as `VITE_SUPABASE_ANON_KEY`)

2. If you're encountering issues with environment variables, you can use the debugging endpoints:
   - `/api/bedrock/test-env` - Tests environment variable loading in the legacy API
   - `/api/bedrock-next/test-env` - Tests environment variable loading in the Next.js API

### Local Development

For local development, create a `.env` file with the required environment variables:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
BEDROCK_API_KEY=your-bedrock-api-key
```

## Database Integration

The application uses Supabase as the database provider. The `bedrock_instances` table is used to store information about Bedrock instances.

### Fallback Mechanism

The application includes a fallback mechanism for cases where the Supabase client cannot be initialized (e.g., missing environment variables). In such cases, the API will use mock data to ensure the application continues to function.

## API Troubleshooting

If you encounter issues with the API endpoints, here are some common problems and solutions:

### API Key Validation Errors

If you're getting `401 Unauthorized` errors with the message "Invalid or missing API key", try the following:

1. **Check API Key Format**: The API key should not contain any whitespace, quotes, or special characters. If you copy-pasted the key, ensure no extra characters were included.

2. **Verify Environment Variables**: Use the test endpoints (`/api/bedrock/test-env` or `/api/bedrock-next/test-env`) to verify that your API key is correctly loaded from environment variables.

3. **Browser Storage**: The frontend stores the API key in localStorage. Try clearing your browser's localStorage and entering the API key again.

4. **HTTP Headers**: Ensure the API key is being sent in the `x-api-key` header (case-sensitive).

### Database Connection Issues

If you're experiencing issues with the Supabase database connection:

1. **Environment Variables**: Verify that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correctly set in your environment.

2. **URL Format**: The Supabase URL must be a valid URL starting with `https://`.

3. **Fallback Mechanism**: If the database connection fails, the API will use mock data. Check the server logs for messages indicating that mock data is being used.

### Debugging API Requests

The API includes extensive logging to help diagnose issues:

1. **Server Logs**: Check the server logs for detailed information about API requests, environment variables, and error messages.

2. **Test Endpoints**: Use the test endpoints (`/api/bedrock/test-env` or `/api/bedrock-next/test-env`) to get diagnostic information about your environment setup.

3. **Request Headers**: The API logs all request headers (with sensitive information masked). Verify that your requests include the expected headers.

# Profile Access Fix

This document explains how to fix profile access issues in the Supabase database.

## The Problem

The application is experiencing issues with profile loading due to recursive Row Level Security (RLS) policies. This causes a circular dependency where:

1. To check if a user is an admin, we need to query the profiles table
2. But the profiles table RLS requires knowing if the user is an admin
3. This creates an infinite recursion error

## The Solution

We've created a migration that fixes this issue by:

1. Creating SECURITY DEFINER functions that bypass RLS
2. Rebuilding the RLS policies to avoid circular dependencies 
3. Ensuring proper access patterns for both users and admins

## How to Apply the Fix

### Using Supabase CLI (Recommended)

The Supabase CLI is the easiest way to apply this migration:

```bash
# Navigate to your project directory
cd your-project-directory

# Apply the migration
npx supabase db push

# If you need to apply just this specific migration
npx supabase db execute --file supabase/migrations/20240705000001_fix_profile_access_production.sql
```

### Verify the Fix

After applying the migration:

1. Restart your application
2. Go to the Settings page and check if your profile is loading properly
3. Test admin functionality if you have admin access

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify the Supabase connection is working
3. If needed, click the "Set as Admin" button in the Settings page to ensure your account has admin privileges

## Additional Information

This fix uses the SECURITY DEFINER attribute on key functions, which means they run with the permissions of the function owner (usually postgres) rather than the calling user. This allows these functions to bypass RLS restrictions and prevent the circular dependency.

# Database Access Guidelines

### Direct PostgreSQL Access (REQUIRED)

This project uses direct PostgreSQL queries for all database interactions. This is now the standard approach for all new development and refactoring of existing code.

### Implementation Details

1. **Edge Functions**:
   - Use the shared Postgres utilities in `supabase/functions/_shared/postgres.ts`
   - Direct SQL queries provide better performance and more granular control
   - Join tables directly in SQL rather than making multiple queries

```typescript
// Example of direct PostgreSQL query in Edge Function
import { query, queryOne, execute } from "../_shared/postgres.ts";

// Get user data with joined table
const userData = await queryOne(`
  SELECT 
    p.id, 
    p.email, 
    p.first_name, 
    p.last_name, 
    p.role,
    u.is_super_admin
  FROM 
    public.profiles p
  JOIN 
    auth.users u ON p.id = u.id
  WHERE 
    p.id = $1
`, [userId]);

// Update with parameterized query
const updatedProfile = await queryOne(`
  UPDATE public.profiles
  SET 
    first_name = $1,
    last_name = $2,
    updated_at = $3
  WHERE 
    id = $4
  RETURNING *
`, [firstName, lastName, new Date().toISOString(), userId]);
```

2. **Frontend API Calls**:
   - Use Edge Functions that implement direct PostgreSQL queries
   - Pass JWT tokens for authentication
   - Process database results directly in the component

```typescript
// Example of frontend calling an Edge Function with direct DB access
const response = await fetch("https://injxxchotrvgvvzelhvj.supabase.co/functions/v1/user-data", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${session.access_token}`
  }
});

const userData = await response.json();
```

### Why Direct PostgreSQL?

1. **Performance**: Direct SQL queries are significantly faster than using the Supabase client
2. **Control**: Complete control over query optimization, joins, and indexes
3. **Security**: Better control over data access with parameterized queries
4. **JOINs**: Ability to join across schemas (auth and public) in single queries
5. **Complexity**: Support for complex queries that aren't possible with the client library

### Deprecated Approaches

The following approaches are deprecated and should not be used in new code:

- ❌ `supabase.from('table').select()` - Use direct SQL queries instead
- ❌ Multiple sequential queries - Join tables in SQL instead
- ❌ Client-side joins - Perform joins in the database
- ❌ RPC calls without direct SQL - Use the postgres utilities instead

### Migration Plan

1. All new features must use direct PostgreSQL queries
2. Existing features should be migrated during regular maintenance
3. High-traffic or performance-critical features should be prioritized for migration

### Best Practices

1. **Always use parameterized queries** to prevent SQL injection
2. Use the correct utility function:
   - `query()` - Returns multiple rows
   - `queryOne()` - Returns a single row or null
   - `execute()` - For operations that don't return data
   - `transaction()` - For multi-step operations that need atomicity
3. Include proper error handling with specific error messages
4. Add proper type annotations for returned data
5. Keep SQL queries readable with proper formatting and comments

For questions about this approach, contact the team lead.

# Deno Edge Functions

## Import Map Consolidation

Edge Functions in this project now use a centralized import map system to ensure consistency across all functions. The imports are defined in a single `deno.json` file at the root of the functions directory.

### Structure

- **`supabase/functions/deno.json`** - Central import map defining all shared imports
- **Individual function `deno.json`** files - Reference the root import map

### Key Imports

```json
{
  "imports": {
    "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@2",
    "std/": "https://deno.land/std@0.208.0/",
    "postgres/": "https://deno.land/x/postgres@v0.17.0/",
    "fireworks/": "https://deno.land/x/fireworks_ai@0.1.0/",
    "cors": "./_shared/cors.ts"
  }
}
```

### Usage in Functions

Each function's `deno.json` file simply references the root import map:

```json
{
  "tasks": {
    "dev": "deno run --allow-net --allow-read --allow-env index.ts",
    "deploy": "supabase functions deploy function_name"
  },
  "imports": "../deno.json"
}
```

### Migration Scripts

The `scripts` directory contains utilities for migrating to the centralized import system:

- **`update_deno_configs.sh`** - Updates all function configurations
- **`update_imports.sh`** - Updates import statements in TypeScript files
- **`check_import_usage.sh`** - Analyzes current import patterns

## Best Practices

1. **Shared Utilities** - Place reusable code in the `_shared` directory
2. **Consistent Imports** - Use the centralized import map for all new functions
3. **Versioning** - When updating dependencies, update only the root import map

## Adding New Dependencies

To add a new dependency to all functions:

1. Add the import mapping to `supabase/functions/deno.json`
2. Update the TypeScript files to use the new import
3. Test the functions to ensure the dependency works as expected