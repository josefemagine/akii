# Authentication Hooks Documentation

This document outlines the new authentication hooks system that provides a modular, maintainable approach to authentication in the application.

## Overview

The authentication system has been refactored into a set of specialized hooks and utility functions, organized as follows:

1. **Utility Functions** (`src/utils/auth/*`) - Low-level functions that handle specific auth operations
2. **Specialized Hooks** (`src/hooks/*`) - React hooks that use the utility functions to provide specific functionality
3. **Unified Auth Hook** (`src/hooks/useAuth.ts`) - Main hook that combines all auth functionality into a single interface

## Main Auth Hook (useAuth)

The `useAuth` hook is the primary entry point for authentication in components. It combines all auth functionality in one place.

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { 
    user, 
    profile,
    isLoading,
    signIn,
    signOut,
    isAdmin
  } = useAuth();
  
  // Use auth functionality...
}
```

### Available Properties and Methods

#### Auth State
- `user` - Current authenticated user (null if not authenticated)
- `session` - Current auth session (null if not authenticated)
- `profile` - User profile data (null if not available)
- `hasUser` - Boolean indicating if a user is authenticated
- `hasProfile` - Boolean indicating if profile data is available
- `isLoading` - Boolean indicating if auth state is loading
- `authError` - Any errors that occurred during auth operations

#### Auth Actions
- `signIn({ email, password })` - Sign in with email and password
- `signUp({ email, password, metadata })` - Register a new user
- `signOut()` - Sign out the current user
- `resetPassword({ email, redirectTo })` - Send password reset email
- `updatePassword(newPassword)` - Update the current user's password

#### Profile Operations
- `refreshProfile()` - Refresh the current user's profile
- `updateProfile(updates)` - Update the current user's profile
- `isValidProfile(profile)` - Check if a profile is valid

#### Admin/Permissions
- `isAdmin` - Boolean indicating if current user is an admin
- `isSuperAdmin` - Boolean indicating if current user is a super admin
- `isTeamOwner` - Boolean indicating if current user is a team owner
- `checkAdminStatus()` - Check admin status from the server
- `setUserAsAdmin()` - Set current user as admin

## Specialized Hooks

For situations where you need more specialized auth functionality, you can use the individual hooks:

### useAuthState

Manages authentication state, tracking the current user, session, and profile.

```tsx
const { user, session, profile, loading } = useAuthState();
```

### useAuthActions

Provides authentication actions like sign in, sign up, and sign out.

```tsx
const { signIn, signUp, signOut, resetPassword } = useAuthActions();

// Sign in example
const handleSignIn = async () => {
  const { success, error } = await signIn({ 
    email: 'user@example.com', 
    password: 'password' 
  });
  if (success) {
    // Handle successful sign in
  }
};
```

### useUserProfile

Manages user profile operations.

```tsx
const { getUserProfile, updateProfile, checkUserAdminStatus } = useUserProfile();

// Update profile example
const updateUserName = async (userId) => {
  const result = await updateProfile(userId, { 
    first_name: 'New',
    last_name: 'Name' 
  });
  // Handle result
};
```

## Utility Functions

The specialized hooks are built on top of utility functions that can be imported directly if needed:

```tsx
import { 
  saveSession, 
  clearSession, 
  fetchUserProfile,
  isAdmin 
} from '@/utils/auth';
```

Available utility categories:
- Profile caching (`profile-cache.ts`)
- Auth events (`auth-events.ts`)
- Session management (`session-manager.ts`)
- Profile utilities (`profile-utils.ts`)
- Auth API functions (`auth-api.ts`)

## Best Practices

1. **Use the main `useAuth` hook in most components**
   ```tsx
   const { user, isLoading, signOut } = useAuth();
   ```

2. **Use specialized hooks only when necessary**
   For example, if you're building a custom auth-related component that needs fine-grained control.

3. **Handle loading states**
   ```tsx
   const { isLoading, profile } = useAuth();
   
   if (isLoading) {
     return <LoadingSpinner />;
   }
   ```

4. **Check authentication before accessing user data**
   ```tsx
   const { hasUser, user } = useAuth();
   
   if (!hasUser) {
     return <LoginPrompt />;
   }
   ```

5. **Use error handling with async operations**
   ```tsx
   const { signIn } = useAuth();
   
   try {
     const { success, error } = await signIn({ email, password });
     if (!success) {
       // Handle error
     }
   } catch (err) {
     // Handle unexpected errors
   }
   ```

## Migration Guide

When refactoring components to use the new auth system:

1. Replace import from context:
   ```tsx
   // OLD
   import { useAuth } from '@/contexts/UnifiedAuthContext';
   
   // NEW
   import { useAuth } from '@/hooks/useAuth';
   ```

2. The new hook API is largely compatible with the old context API, but with improved error handling and loading states.

3. Replace direct Supabase client calls with hook methods:
   ```tsx
   // OLD
   const { data, error } = await supabase.auth.signInWithPassword({
     email,
     password
   });
   
   // NEW
   const { success, error, data } = await signIn({ email, password });
   ```

## Example Usage

### Sign In Component

```tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { success, error } = await signIn({ email, password });
      
      if (!success) {
        setError(error.message || 'Failed to sign in');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

### Protected Page

```tsx
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

function ProtectedPage() {
  const { hasUser, isLoading, user, profile, signOut } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!hasUser) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div>
      <h1>Welcome, {profile?.first_name || user?.email}</h1>
      <button onClick={signOut}>Sign Out</button>
      <div>Your protected content here</div>
    </div>
  );
}
```

### Admin-Only Section

```tsx
import { useAuth } from '@/hooks/useAuth';

function AdminSection() {
  const { isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAdmin) {
    return <div>You don't have permission to access this section</div>;
  }
  
  return (
    <div>
      <h2>Admin Dashboard</h2>
      {/* Admin functionality */}
    </div>
  );
}
``` 