# Dashboard Components

This directory contains the consolidated dashboard layout components that replace the previous implementation spread across multiple files. The goal of this refactoring was to create a more maintainable and consistent dashboard experience.

## Components

### DashboardLayout

The main layout component that handles:
- Responsive layout for desktop and mobile
- Theme management (light/dark mode)
- Sidebar state management
- Header with user profile and navigation

Usage:

```tsx
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Basic usage
<DashboardLayout>
  <YourDashboardPage />
</DashboardLayout>

// For admin views
<DashboardLayout isAdmin={true}>
  <YourAdminPage />
</DashboardLayout>
```

### Sidebar

A unified sidebar component that:
- Shows different navigation options based on user role
- Supports collapsible mode
- Handles responsive design for mobile/desktop
- Preserves user preferences for sidebar state

### TrialBanner

A banner component that shows trial information:
- Displays days remaining in user's trial
- Can be dismissed by the user
- Provides upgrade action
- Only appears for users on trial plans

## DashboardPageContainer

A container component that ensures consistent styling across dashboard pages:
- Maintains consistent padding and spacing
- Provides optional full-width mode
- Ensures responsive behavior

## Usage Guidelines

1. Always use the `DashboardLayout` component for any protected dashboard routes
2. For admin-specific routes, use `isAdmin={true}` prop on the layout
3. Make sure new dashboard pages maintain consistent styling by using the built-in container

## Examples

### Adding a new dashboard page:

```tsx
// YourNewPage.tsx
import React from 'react';

const YourNewPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your New Page</h1>
      {/* Your page content */}
    </div>
  );
};

export default YourNewPage;
```

### Adding a new route in App.tsx:

```tsx
<Route
  path="/dashboard/your-new-page"
  element={
    <PrivateRoute>
      <DashboardLayout>
        <YourNewPage />
      </DashboardLayout>
    </PrivateRoute>
  }
/>
``` 