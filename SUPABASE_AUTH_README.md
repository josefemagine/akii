# Supabase Authentication System

This application uses Supabase for authentication following best practices for session handling, error management, and lock prevention.

## Features

- **PKCE Authentication Flow**: Secure authentication using the PKCE flow for better security
- **Lock Prevention**: Advanced lock management to prevent `_loadSession() used outside of an acquired lock` errors
- **Identity Management**: Support for multiple identity types (email, OAuth)
- **Session Management**: Reliable session management with automatic recovery
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Using Authentication in Components

### Sign In

```javascript
import { signIn } from '@/lib/auth-helpers';

async function handleLogin(email, password) {
  const { data, error } = await signIn(email, password);
  
  if (error) {
    showErrorToast(error.message);
    return;
  }
  
  // Success! User is signed in
  navigateToDashboard();
}
```

### Sign Up

```javascript
import { signUp } from '@/lib/auth-helpers';

async function handleSignUp(email, password, userData) {
  const { data, error } = await signUp(email, password, userData);
  
  if (error) {
    showErrorToast(error.message);
    return;
  }
  
  // Success! User is registered
  showSuccessMessage("Check your email to confirm your account");
}
```

### Sign Out

```javascript
import { signOut } from '@/lib/auth-helpers';

async function handleLogout() {
  // Options: 'global', 'local', 'others'
  const { error } = await signOut('global');
  
  if (error) {
    showErrorToast(error.message);
    return;
  }
  
  // Success! User is logged out
  navigateToHomePage();
}
```

### Get Current User

```javascript
import { getCurrentUser, getCurrentSession } from '@/lib/auth-helpers';

async function checkAuthStatus() {
  const { data: user, error: userError } = await getCurrentUser();
  
  if (userError || !user) {
    // User is not authenticated
    return false;
  }
  
  const { data: session, error: sessionError } = await getCurrentSession();
  
  if (sessionError || !session) {
    // Session is invalid
    return false;
  }
  
  // User is authenticated with a valid session
  return true;
}
```

### Reset Password

```javascript
import { resetPasswordForEmail } from '@/lib/auth-helpers';

async function handlePasswordReset(email) {
  const { data, error } = await resetPasswordForEmail(email);
  
  if (error) {
    showErrorToast(error.message);
    return;
  }
  
  // Success! Password reset email sent
  showSuccessMessage("Check your email to reset your password");
}
```

## Advanced Usage

### PKCE Flow Support

The application automatically handles PKCE authentication flow, including code exchange. This happens in `main.tsx` where we:

1. Check for `code` parameter in URL
2. Exchange code for session
3. Remove code from URL to prevent reuse
4. Update the application state

### Lock Management

To prevent Supabase lock errors, all authentication operations are wrapped in a queue system. You can use the lock management system directly:

```javascript
import { withAuthLock } from '@/lib/auth-lock-fix';

async function customAuthOperation() {
  const result = await withAuthLock(
    () => supabase.auth.someOperation(),
    'operationName'
  );
  
  return result;
}
```

### Emergency Reset

If you experience persistent authentication issues, you can use the emergency reset:

```javascript
import { emergencySessionReset } from '@/lib/auth-lock-fix';

function handlePersistentAuthIssues() {
  // Clear all auth-related data and locks
  emergencySessionReset();
  
  // Redirect to login page
  window.location.href = '/login';
}
```

## Troubleshooting

### Common Error Messages

- **_loadSession() used outside of an acquired lock**: This error is now automatically handled by the lock management system
- **flow_state_not_found**: The authentication flow expired. Start the sign-in process again.
- **Invalid login credentials**: Check email and password combination
- **Email not confirmed**: User needs to confirm their email before signing in

### Force Logout

If you encounter persistent issues, you can force a logout by navigating to:

```
https://your-app-url/?logout=true
```

This will clear all authentication tokens and reset the auth state.

### Diagnostics

For diagnostic information about the authentication system, use:

```javascript
import { getAuthLockStatus } from '@/lib/auth-lock-fix';

function checkAuthSystem() {
  const status = getAuthLockStatus();
  console.log('Auth system status:', status);
  
  // Returns:
  // {
  //   isLocked: boolean,
  //   lockHolder: string,
  //   queueLength: number,
  //   lockHeldDuration: number
  // }
}
``` 