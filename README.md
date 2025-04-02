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
- **`src/contexts/ConsolidatedAuthContext.tsx`** - React context provider for auth state.

### Usage

```tsx
// Import the auth hook
import { useAuth } from '@/contexts/ConsolidatedAuthContext';

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
