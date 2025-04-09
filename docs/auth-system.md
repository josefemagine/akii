# Authentication System Documentation

This document outlines the authentication system used in the Akii application, how it works, and how to troubleshoot common issues.

## Overview

The Akii authentication system is built around Supabase Auth, with a focus on reliability, simplicity, and maintainability. The system handles user authentication, profile management, and session state throughout the application.

## Key Components

1. **AuthContext**: A React context provider that manages authentication state and exposes auth-related functions.
2. **PrivateRoute**: A component that protects routes from unauthorized access and includes circuit breaker logic to prevent redirect loops.
3. **Database Design**: A profiles table with appropriate RLS (Row Level Security) policies for user data management.
4. **Migration Scripts**: SQL migrations to set up and maintain the authentication infrastructure.
5. **Reset Script**: A `reset-supabase.sh` script to reset the Supabase instance and reapply migrations.

## How It Works

### Authentication Flow

1. **Sign-In Process**:
   - User provides credentials via the sign-in form.
   - AuthContext calls Supabase's `signInWithPassword` method.
   - On success, Supabase's auth state listener updates the application's state.
   - The user's profile is automatically fetched or created if it doesn't exist.

2. **Session Management**:
   - Sessions are managed by Supabase Auth, with automatic refresh handling.
   - The AuthContext monitors auth state changes and updates the UI accordingly.

3. **Profile Management**:
   - Each user has a corresponding profile record in the database.
   - The system will automatically create a profile if one doesn't exist.
   - Profiles contain additional user metadata like role, status, etc.

4. **Route Protection**:
   - Routes are protected using the PrivateRoute component.
   - The component redirects unauthenticated users to the login page.
   - It includes a circuit breaker to prevent infinite redirect loops.

### Core Files

- `/src/contexts/UnifiedAuthContext.tsx`: The main authentication context provider.
- `/src/components/PrivateRoute.tsx`: Route protection component.
- `/supabase/migrations/20240608000010_auth_system_optimization.sql`: Database schema and security policies.
- `/scripts/test-auth.js`: Script to test the auth system functionality.
- `/reset-supabase.sh`: Script to reset the local Supabase instance.

## Setup and Configuration

### Initial Setup

1. Start Supabase locally:
   ```bash
   supabase start
   ```

2. Run the reset script to set up the database and create a test admin user:
   ```bash
   ./reset-supabase.sh
   ```

3. (Re)start your development server:
   ```bash
   npm run dev
   ```

4. Test the authentication system with the provided script by opening your browser console and running:
   ```javascript
   // Import the test script
   const script = document.createElement('script');
   script.src = '/scripts/test-auth.js';
   document.head.appendChild(script);
   
   // Wait a moment and then run the test
   setTimeout(() => {
     testAuthSystem();
   }, 1000);
   ```

### Default Admin Credentials

The reset script creates a default admin user:
- Email: `admin@example.com`
- Password: `Admin123!`

## Common Issues and Troubleshooting

### Authentication Loop

**Symptom**: The application keeps redirecting between routes without resolving.

**Solution**: The circuit breaker will automatically stop redirect loops after 3 redirects within 5 seconds. 
If you encounter this issue manually:

1. Clear your browser cache and cookies.
2. Try opening the app in incognito/private mode.
3. Run the reset script again to ensure a clean database state.

### Profile Not Created

**Symptom**: User can authenticate but profile data is missing.

**Solution**:
1. Check if the `ensure_profile_exists` function is properly installed:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'ensure_profile_exists';
   ```
2. Run the migration script manually:
   ```bash
   supabase db reset
   ```
3. Verify profiles table exists and has correct permissions:
   ```sql
   SELECT * FROM pg_tables WHERE tablename = 'profiles';
   ```

### RLS Policy Issues

**Symptom**: Users can authenticate but can't access their profile data.

**Solution**:
1. Check RLS policies on the profiles table:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```
2. Verify the current user's role:
   ```sql
   SELECT role FROM profiles WHERE id = auth.uid();
   ```
3. Run the auth system test script to validate functionality.

## Best Practices

1. **Use the AuthContext**: Always use the provided hooks to access authentication functionality:
   ```tsx
   import { useAuth } from '@/contexts/UnifiedAuthContext';
   
   function MyComponent() {
     const { user, signOut, isAdmin } = useAuth();
     // ...
   }
   ```

2. **Protect Routes**: Always wrap private routes with the PrivateRoute component:
   ```tsx
   <Route
     path="/dashboard"
     element={
       <PrivateRoute>
         <Dashboard />
       </PrivateRoute>
     }
   />
   ```

3. **Admin Routes**: For admin-only routes, use the adminOnly prop:
   ```tsx
   <PrivateRoute adminOnly={true}>
     <AdminPanel />
   </PrivateRoute>
   ```

4. **Profile Data**: Access user profile data through the AuthContext:
   ```tsx
   const { profile } = useAuth();
   console.log(profile?.first_name);
   ```

## Testing and Development

### Local Development Bypasses

For development purposes only, you can bypass authentication checks:

```javascript
// Bypass auth check in development (use with caution)
if (import.meta.env.DEV) {
  sessionStorage.setItem('akii-dev-bypass', 'true');
}

// Bypass admin check in development (use with caution)
if (import.meta.env.DEV) {
  sessionStorage.setItem('akii-dev-admin-bypass', 'true');
}
```

### Testing Auth with the Console

You can use the Supabase object directly in the console for testing:

```javascript
// Get current user
const { data, error } = await supabase.auth.getUser();
console.log(data.user);

// Sign out
await supabase.auth.signOut();
```

## Maintenance and Future Work

The authentication system is designed to be maintainable and extensible. Future work may include:

1. **OAuth Integration**: Adding social login providers (Google, GitHub, etc.).
2. **Multi-factor Authentication**: Adding 2FA support.
3. **Role-based Access Control**: Enhanced RBAC beyond admin/user roles.
4. **Audit Logging**: Track authentication events for security purposes.

## Conclusion

This authentication system provides a reliable foundation for user management in the Akii application. By focusing on Supabase SDK integration and eliminating custom workarounds, it offers improved reliability and maintainability. 