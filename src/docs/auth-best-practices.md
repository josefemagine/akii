# Authentication & Authorization Best Practices

## Overview

This document outlines the authentication and authorization patterns used in our application. Following these guidelines will ensure consistent and secure implementation across all components.

## Authentication Context

### Using the UnifiedAuthContext

The `UnifiedAuthContext` is our central authentication system that provides access to user information, profile data, and authentication state.

```jsx
import { useAuth } from "@/contexts/UnifiedAuthContext";

function MyComponent() {
  const { 
    user,              // Supabase User object
    profile,           // User profile with additional details
    hasUser,           // Boolean indicating if authenticated user exists
    hasProfile,        // Boolean indicating if profile exists
    isAdmin,           // Boolean indicating admin status
    authLoading,       // Boolean indicating if auth is loading
    signIn,            // Function to sign in user
    signOut,           // Function to sign out user
    refreshProfile,    // Function to refresh user profile
    updateProfile      // Function to update user profile
  } = useAuth();
  
  // Component logic...
}
```

### Best Practices

1. **Loading States**: Always check `authLoading` before relying on auth state:

```jsx
if (authLoading) {
  return <LoadingSpinner />;
}
```

2. **Auth Guards**: Use `hasUser` to check for authentication:

```jsx
if (!hasUser) {
  return <NotAuthenticatedMessage />;
}
```

3. **Role-Based Access**: Use `isAdmin` for admin-only features:

```jsx
{isAdmin && <AdminControls />}
```

4. **Profile Data**: Always check `hasProfile` before accessing profile data:

```jsx
if (hasProfile) {
  // Safe to use profile data
}
```

## Server Function Invocation

### Using invokeServerFunction

All server-side functionality should be accessed through the `invokeServerFunction` utility:

```jsx
import { invokeServerFunction } from "@/utils/supabase/functions";

// Example usage
const data = await invokeServerFunction("function_name", { 
  param1: "value1",
  param2: "value2"
});
```

### Best Practices

1. **Type Safety**: Always define types for request and response data:

```jsx
interface MyRequestType {
  userId: string;
  data: string;
}

interface MyResponseType {
  success: boolean;
  message?: string;
  data?: any;
}

const response = await invokeServerFunction<MyResponseType, MyRequestType>(
  "function_name", 
  { userId: user.id, data: "test" }
);
```

2. **Error Handling**: Use the unified error handling pattern:

```jsx
import { handleError } from "@/lib/utils/error-handler";

try {
  const response = await invokeServerFunction("function_name", params);
  if (!response || !response.success) {
    throw new Error(response?.message || "Function failed");
  }
  // Handle success
} catch (error) {
  handleError(error, {
    title: "Operation Failed",
    context: "ComponentName.methodName"
  });
}
```

## Error Handling

### Using the Error Handler

We've implemented a unified error handling system in `@/lib/utils/error-handler.ts`:

```jsx
import { handleError, showSuccess, withErrorHandling } from "@/lib/utils/error-handler";

// Basic error handling
try {
  // Risky operation
} catch (error) {
  handleError(error, {
    title: "Custom Error Title",
    fallbackMessage: "Something went wrong",
    context: "ComponentName.methodName",
    logToConsole: true,
    showToast: true
  });
}

// Success messages
showSuccess("Operation Successful", "Your changes have been saved");

// Wrapping an async function with error handling
const fetchDataSafely = withErrorHandling(
  async () => {
    // Fetch data...
    return data;
  },
  { context: "fetchData" }
);

// Using the wrapped function
const { data, error } = await fetchDataSafely();
if (error) {
  // Handle specific error case
} else {
  // Use data
}
```

## Loading States

### Best Practices

1. **Local Loading States**: Use local state for operation-specific loading:

```jsx
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    // Async operation
  } catch (error) {
    handleError(error);
  } finally {
    setIsLoading(false);
  }
};

// In render
{isLoading ? <LoadingSpinner /> : <Button onClick={handleSubmit}>Submit</Button>}
```

2. **Auth Loading**: Always check `authLoading` before using auth state:

```jsx
const { authLoading, hasUser } = useAuth();

if (authLoading) {
  return <LoadingState />;
}

if (!hasUser) {
  return <NotAuthorized />;
}

return <ProtectedContent />;
```

## Component Structure Pattern

Follow this structure for components that use authentication:

```jsx
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { handleError } from "@/lib/utils/error-handler";
import { invokeServerFunction } from "@/utils/supabase/functions";

const MyComponent = () => {
  // 1. Auth context
  const { user, hasUser, authLoading } = useAuth();
  
  // 2. Component state
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  
  // 3. Data fetching
  useEffect(() => {
    if (hasUser) {
      fetchData();
    }
  }, [hasUser]);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await invokeServerFunction("get_data", { 
        userId: user.id 
      });
      
      if (!response) {
        throw new Error("Failed to fetch data");
      }
      
      setData(response);
    } catch (error) {
      handleError(error, {
        context: "MyComponent.fetchData"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 4. Handle loading states
  if (authLoading) {
    return <AuthLoadingState />;
  }
  
  if (!hasUser) {
    return <NotAuthenticated />;
  }
  
  if (isLoading) {
    return <ComponentLoadingState />;
  }
  
  // 5. Render component
  return (
    <div>
      {/* Component content */}
    </div>
  );
};
```

## Migrations from Old Auth Pattern

When updating components from the old auth pattern:

1. Replace direct Supabase client calls with `invokeServerFunction`
2. Use `hasUser` and `authLoading` instead of checking `user` directly
3. Apply the unified error handling pattern
4. Remove `session` references (rely on `user` and `profile` instead)
5. Add proper loading states for better UX

## Security Considerations

1. Always validate user permissions server-side
2. Don't trust client-side role checks for security-critical operations
3. Use row-level security (RLS) in Supabase tables
4. Implement proper error handling that doesn't leak sensitive information
5. Keep authorization logic in server functions, not client components 