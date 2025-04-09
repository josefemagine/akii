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

1. **Centralized Supabase Client** - A single source of truth for Supabase client instances, preventing multiple initializations.
2. **Core Authentication Module** - Comprehensive auth functions with robust error handling and consistent return types.
3. **Unified Auth Context** - A React context that provides authentication state and methods throughout the application.

### Key Files

- **`src/lib/supabase-client.ts`** - Singleton pattern for Supabase client instances.
- **`src/lib/auth-core.ts`** - Core authentication functions and types.
- **`src/contexts/UnifiedAuthContext.tsx`** - React context provider for auth state.

### Usage

```tsx
// Import the auth hook
import { useAuth } from '@/contexts/UnifiedAuthContext';

function MyComponent() {
  // Access auth state and methods
  const { 
    user, 
    profile, 
    isAdmin, 
    isAuthenticated, 
    signIn, 
    signOut,
    updateProfile 
  } = useAuth();

  // Use auth methods
  const handleLogin = async (email, password) => {
    const { data, error } = await signIn(email, password);
    if (error) {
      // Handle error
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>Welcome, {profile?.first_name || user?.email}</h1>
          <button onClick={() => signOut()}>Sign Out</button>
        </div>
      ) : (
        <button onClick={() => handleLogin('test@example.com', 'password')}>
          Sign In
        </button>
      )}
    </div>
  );
}
```

### Migration Plan

The authentication system is currently in a transition phase. The following roadmap is planned:

1. **Phase 1** - Introduce consolidated implementation alongside existing code (CURRENT)
2. **Phase 2** - Migrate components to use the new auth context
3. **Phase 3** - Remove deprecated auth implementations

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
