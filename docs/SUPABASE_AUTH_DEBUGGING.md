# Debugging Supabase Authentication Issues

This guide provides solutions for common Supabase authentication issues and explains how the auth lock management system works.

## Common Auth Issues and Solutions

### 1. `_loadSession() used outside of an acquired lock` Error

This error occurs when multiple concurrent Supabase auth operations try to access the session state simultaneously.

**Solution:**
- Use the auth-lock-fix utilities to prevent concurrent operations:
  ```typescript
  import { getSessionSafely, getUserSafely } from '@/lib/auth-lock-fix';
  
  // Instead of:
  // const { data, error } = await supabase.auth.getSession();
  
  // Use:
  const { data, error } = await getSessionSafely();
  ```

### 2. Authentication State Not Updating

If your app shows incorrect authentication state or doesn't respond to sign in/sign out:

**Solutions:**
- Make sure you're using the consolidated auth hooks from `auth-compatibility.ts`:
  ```typescript
  import { useAuth } from '@/contexts/auth-compatibility';
  ```
- Clear auth state by navigating to:
  ```
  http://localhost:3000?logout=true
  ```
- Check browser console for auth errors and session status

### 3. PKCE Flow Issues

If OAuth or email sign-in redirects aren't working correctly:

**Solutions:**
- Make sure `detectSessionInUrl` and `flowType: 'pkce'` are enabled in Supabase client config
- Look for the `code` parameter in URL after redirect and check if it's being processed
- Check that the `redirect_to` URL is correct and matches your app's domain
- See if you get any errors in the `exchangeCodeForSession` process

### 4. Authentication Loops or Timeouts

If you're experiencing redirect loops or timeouts in auth flows:

**Solutions:**
- Increase timeout durations in components that depend on auth state
- Check for race conditions between route guards and auth state
- Use the `emergency Session Reset` function:
  ```typescript
  import { emergencySessionReset } from '@/lib/auth-lock-fix';
  emergencySessionReset();
  ```

## Auth Lock Management System

The auth lock system (`auth-lock-fix.ts`) handles the following:

1. **Lock Queue**: Ensures only one auth operation runs at a time
2. **Auto-Recovery**: Automatically releases locks if they're held too long
3. **Safe Operations**: Provides safe wrappers for common auth operations
4. **Retry Mechanism**: Automatically retries failed operations with exponential backoff

### Key Functions

```typescript
// Get session safely
const { data, error } = await getSessionSafely();

// Get user safely
const { data, error } = await getUserSafely();

// Sign out safely
const { error } = await signOutSafely({ scope: 'global' });

// Custom auth operations
const result = await withAuthLock(
  () => supabase.auth.customOperation(),
  'operationName'
);

// Emergency reset
emergencySessionReset();

// Get lock status
const status = getAuthLockStatus();
```

## Checking Auth Status

### From the Browser Console

Run these commands in your browser console to diagnose auth issues:

```javascript
// Check current session
const session = await window.supabase.auth.getSession();
console.log('Session:', session);

// Check current user
const user = await window.supabase.auth.getUser();
console.log('User:', user);

// Check auth lock status
const status = window.__AUTH_LOCK_STATUS;
console.log('Lock Status:', status);

// View stored auth in localStorage
const authItems = Object.keys(localStorage)
  .filter(key => key.includes('auth') || key.includes('supabase') || key.includes('sb-'))
  .reduce((obj, key) => {
    obj[key] = localStorage.getItem(key);
    return obj;
  }, {});
console.log('Auth in localStorage:', authItems);
```

### From Components

Add temporary logging in components to track auth state:

```typescript
useEffect(() => {
  async function checkAuth() {
    console.log('Auth state:', {
      user: auth.user,
      session: auth.session,
      isLoading: auth.isLoading
    });
    
    // Check Supabase directly
    const { data: session } = await getSessionSafely();
    console.log('Direct session check:', session);
  }
  
  checkAuth();
}, []);
```

## Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [PKCE Flow Explanation](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui#pkce-flow)
- [Supabase Auth Error Codes](https://supabase.com/docs/guides/auth/auth-deep-dive/error-codes)
- [OAuth Provider Configuration](https://supabase.com/docs/guides/auth/social-login)

## Troubleshooting Checklist

1. ✅ Are you using the correct auth utilities from `auth-lock-fix.ts`?
2. ✅ Is Supabase client configured with `persistSession: true` and `flowType: 'pkce'`?
3. ✅ Are there any console errors indicating auth issues?
4. ✅ Have you tried clearing auth state with `?logout=true`?
5. ✅ Are you using the latest version of Supabase client?
6. ✅ Are your environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) correct?
7. ✅ Have you checked for infinite re-render loops in auth-dependent components?
8. ✅ Is your server's clock synchronized (important for JWT validation)?
9. ✅ Are you checking for race conditions in `useEffect` hooks?
10. ✅ Have you tested with incognito/private browser mode? 