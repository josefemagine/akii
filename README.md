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

The new authentication system follows these best practices:

1. **Modular Hook-Based Design**:
   - Core authentication functionality split into specialized hooks
   - Each hook has a single responsibility
   - Hooks can be composed together as needed

2. **Improved State Management**:
   - Centralized auth state tracking in `useAuthState`
   - Dedicated action handling in `useAuthActions`
   - Profile management in `useUserProfile`
   - Combined functionality in the main `useAuth` hook

3. **Enhanced Error Handling**:
   - Consistent error pattern with typed return values
   - Detailed logging for debugging
   - Event-based error broadcasting

### Key Files in the New System

#### Hooks
- **`src/hooks/useAuth.ts`** - Main hook that combines all auth functionality
- **`src/hooks/useAuthState.ts`** - Manages auth state (user, session, profile)
- **`src/hooks/useAuthActions.ts`** - Handles auth actions (sign in, sign out, etc.)
- **`src/hooks/useUserProfile.ts`** - Manages user profile operations

#### Utilities
- **`src/utils/auth/auth-events.ts`** - Event handling for auth state changes
- **`src/utils/auth/profile-cache.ts`** - Profile caching utilities
- **`src/utils/auth/profile-utils.ts`** - Profile management helpers
- **`src/utils/auth/session-manager.ts`** - Session management utilities
- **`src/utils/auth/auth-api.ts`** - Authentication API functions
- **`src/utils/auth/index.ts`** - Unified exports

#### Documentation
- **`src/docs/auth-hooks.md`** - Comprehensive documentation of the new system

### Usage

```tsx
// Import the auth hook
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  // Access auth state and methods
  const { 
    user,
    profile,
    hasUser,
    hasProfile,
    isLoading,
    
    // Auth actions
    signIn,
    signUp,
    signOut,
    
    // Profile operations
    refreshProfile,
    updateProfile,
    
    // Permission checks
    isAdmin,
    isSuperAdmin,
    isTeamOwner
  } = useAuth();

  // Sign in example with the new hook API
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const { success, error } = await signIn({ 
        email: 'user@example.com', 
        password: 'password'
      });
      
      if (success) {
        // Redirect or update UI
      } else {
        // Handle error
        console.error(error);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  return (
    // Your component JSX
  );
}
```

### Backwards Compatibility

The old `UnifiedAuthContext` has been preserved with adapter functions to maintain backwards compatibility while components are gradually updated to use the new hooks. This ensures a smooth transition without breaking existing functionality.

To migrate existing components:

1. Replace:
   ```tsx
   import { useAuth } from '@/contexts/UnifiedAuthContext';
   ```
   
   With:
   ```tsx
   import { useAuth } from '@/hooks/useAuth';
   ```

2. Update function calls for the new API (primarily `signIn` which now takes an object parameter)

### Server Function Integration

The authentication system integrates seamlessly with our server functions using the new `invokeServerFunction` utility:

```tsx
import { useAuth } from '@/hooks/useAuth';
import { invokeServerFunction } from '@/utils/supabase/functions';

function MyComponent() {
  const { profile } = useAuth();
  
  const handleAction = async () => {
    if (!profile) return;
    
    const result = await invokeServerFunction('my_function', {
      userId: profile.id,
      // other parameters
    });
    
    // Handle result
  };
}
```

For more detailed information, see the comprehensive documentation in `src/docs/auth-hooks.md`.

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

# Akii Web Application

## Overview

Akii is a modern React application that provides a secure interface for managing AI agents, user authentication, and team collaboration. The application follows a modular architecture with a focus on maintainability, performance, and security.

## Application Architecture

### Core Architecture Principles

- **Component-Based**: UI is broken down into reusable, focused components
- **Custom Hooks**: Business logic is extracted into custom hooks
- **Service Layers**: API calls and data manipulation happen in dedicated service files
- **Type Safety**: TypeScript ensures type safety throughout the application
- **Separation of Concerns**: Clear separation between UI rendering, data fetching, and state management

### Directory Structure

```
src/
├── components/         # UI components
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   │   ├── bedrock/    # Bedrock dashboard components
│   │   ├── sidebar/    # Sidebar components
│   │   └── team/       # Team management components
│   ├── layout/         # Layout components
│   ├── shared/         # Shared components
│   └── ui/             # UI primitives
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Page components
│   └── admin/          # Admin page components
├── services/           # Service layer for API calls
├── styles/             # CSS and style-related files
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
    ├── auth/           # Authentication utilities
    ├── dashboard/      # Dashboard utilities
    └── diagnostics/    # Diagnostic utilities
```

## Key Components

### Layout Components

- **DashboardLayout**: Main layout for authenticated users
  - Composed of smaller components:
    - `DashboardHeader`: Header with user profile and navigation
    - `DashboardErrorHandler`: Error boundary for connection issues
    - `Sidebar`: Navigation sidebar with collapsible sections

### Authentication System

- **Supabase Integration**: Authentication is powered by Supabase
- **Custom Hooks**:
  - `useAuth`: Main authentication hook combining all auth functionality
  - `useAuthState`: Manages authentication state
  - `useAuthActions`: Provides authentication actions (sign in, sign up, etc.)
  - `useUserProfile`: Handles user profile operations
  - `useDashboardLayoutAuth`: Custom hook for dashboard authentication needs

### Team Management

- **Team Members Management**: Components for managing team members
  - Invitation system
  - Role management
  - Member removal
- **Permissions System**: Role-based access control

### Admin Functionality

- **SupabaseCheck**: Diagnostic tools for checking Supabase connectivity
- **SupabaseBedrock**: Management interface for AWS Bedrock instances
- **Users Management**: Admin interface for managing application users

## Best Practices

### Component Size and Responsibility

- Components are kept under 300 lines when possible
- Components have a single responsibility
- Large components are broken down into smaller, focused components

### Custom Hooks

- Logic is extracted into custom hooks
- Hooks follow the single responsibility principle
- Complex state management is handled via custom hooks

### Type Safety

- TypeScript interfaces for component props
- Strong typing for API responses
- Consistent type naming conventions

## Recent Refactorings

We've recently completed a major refactoring of the codebase to improve maintainability and performance:

1. **Reduced Component Size**: Broke down large components (>1000 lines) into smaller, focused components
2. **Extracted Logic**: Moved business logic from components to custom hooks
3. **Improved Error Handling**: Created dedicated error handling components
4. **Centralized Authentication**: Refactored authentication into a modular system with specialized hooks
5. **Optimized State Management**: Reduced unnecessary re-renders and improved state isolation

### Refactored Components

| Component | Before | After | Improvements |
|-----------|--------|-------|--------------|
| DashboardLayout | 1626 lines, 25 hooks | 122 lines, 3 hooks | Extracted header, sidebar, and error handling into separate components |
| SupabaseCheck | 1748 lines, 19 hooks | 300~ lines, 3 hooks | Extracted diagnostic panels into separate components |
| SupabaseBedrock | 1556 lines, 22 hooks | 350~ lines, 5 hooks | Created specialized components for AWS Bedrock management |
| UnifiedAuthContext | 998 lines, 21 hooks | 250~ lines, 4 hooks | Extracted authentication logic into custom hooks |
| Users | 917 lines | 250~ lines | Extracted CRUD operations and UI into separate components |
| Sidebar | 791 lines | 200~ lines | Created modular navigation system with specialized components |

## Development

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account for backend services

### Setup

1. Clone the repository
2. Install dependencies: `npm install` or `yarn`
3. Create a `.env` file based on `.env.example`
4. Start the development server: `npm run dev` or `yarn dev`

### Building for Production

```bash
npm run build
# or
yarn build
```

## Testing

```bash
npm run test
# or
yarn test
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
