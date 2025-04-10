# React Component Refactoring Plan

This document tracks oversized React components that need refactoring into smaller, more modular files. 

## Criteria for Refactoring

Files are flagged for refactoring if they meet any of these criteria:
- File exceeds 300 lines
- Contains more than 3 React hooks
- Contains both data fetching and UI rendering logic
- Contains logic and JSX not directly related
- Contains deeply nested JSX (3+ levels)
- Has 3+ helper functions declared inline

## Files to Refactor

### ✅ src/pages/admin/SupabaseCheck.tsx - (1748 lines, 19 hooks)

**Reasons flagged:**
- Extremely large file (1748 lines)
- Many hooks (19 instances)
- Complex logic mixed with UI

**Refactoring completed:**
- [x] Extract diagnostic panels into separate components
  - Created `DiagnosticPanel.tsx` for individual service status
  - Created `DiagnosticLogs.tsx` for log display
  - Created `EnvironmentVariables.tsx` for config variables
  - Created `FunctionLogs.tsx` for edge function data
  - Created `DiagnosticDashboard.tsx` to combine everything
- [x] Move API/Supabase calls to service files
  - Created `supabaseDiagnostics.ts` service
- [x] Extract utility functions to utils folder
  - Moved utility functions into the service
- [x] Create custom hooks for repeated state logic
  - Created `useDiagnostics.ts` hook for centralized state management

### ✅ src/services/supabaseDiagnostics.ts - (511 lines)

**Reasons flagged:**
- Large service file (511 lines)
- Multiple unrelated utility functions 
- Combines different service check functions

**Refactoring completed:**
- [x] Extract utility functions to separate files
  - Created `src/utils/diagnostics/mask-utils.ts` for secret masking functions
  - Created `src/utils/diagnostics/service-checkers.ts` for individual service checks
  - Created `src/utils/diagnostics/function-utils.ts` for edge function utilities
  - Created `src/utils/diagnostics/diagnostic-runner.ts` for test coordination
  - Created `src/utils/diagnostics/index.ts` for unified exports
- [x] Create specific type files for diagnostic types
  - Created `src/types/diagnostics.ts` with all needed interfaces
- [x] Update components with new import paths
  - Updated all components to use the new utilities and types

### ✅ src/components/layout/DashboardLayout.tsx - (1626 lines, 25 hooks)

**Reasons flagged:**
- Very large file (1626 lines)
- Most hooks in the codebase (25 instances)
- Handles layout, authentication, and UI state

**Refactoring completed:**
- [x] Split into components:
  - Created `DashboardHeader.tsx` component
  - Created `DashboardErrorHandler.tsx` component
  - Kept existing `Sidebar.tsx` component
- [x] Move authentication logic to custom hook:
  - Created `useDashboardLayoutAuth.ts` hook for centralized auth management
  - Re-used existing `useDarkMode.ts` hook
- [x] Improved error handling with a dedicated component
- [x] Simplified component structure and made it more maintainable
- [x] Reduced code duplication and added separation of concerns

### ✅ src/pages/admin/SupabaseBedrock.tsx - (1556 lines, 22 hooks)
Refactored into smaller components:
- Created src/components/admin/bedrock/ directory with:
  - ErrorBoundary.tsx
  - StatusBadges.tsx
  - NoticeComponents.tsx
  - TestModal.tsx
  - ModelFilters.tsx
  - ApiConfigPanel.tsx
  - InstanceSkeleton.tsx
  - BedrockDashboardContent.tsx
  - index.ts (barrel file for exports)
- Fixed error handling throughout
- Properly typed all components
- Simplified main component

### ✅ src/contexts/UnifiedAuthContext.tsx - (998 lines, 21 hooks)

**Reasons flagged:**
- Large context provider (998 lines)
- Many hooks (21 instances)
- Handles complex auth logic and state

**Refactoring completed:**
- [x] Extract authentication utility functions to separate files:
  - Created `src/utils/auth/profile-cache.ts` for profile caching functions
  - Created `src/utils/auth/auth-events.ts` for event handling utilities
  - Created `src/utils/auth/session-manager.ts` for session management
  - Created `src/utils/auth/profile-utils.ts` for profile utility functions
  - Created `src/utils/auth/auth-api.ts` for authentication API functions
  - Added `src/utils/auth/index.ts` for unified exports
- [x] Create custom hooks for auth functionality:
  - Created `src/hooks/useAuthState.ts` for managing authentication state
  - Created `src/hooks/useAuthActions.ts` for authentication actions
  - Created `src/hooks/useUserProfile.ts` for profile operations
  - Created `src/hooks/useAuth.ts` as the main hook that combines all auth functionality
- [x] Update the context implementation to use these hooks and utilities:
  - Refactored `src/contexts/UnifiedAuthContext.tsx` to use the new hooks
  - Maintained compatibility with existing API for smooth migration
- [x] Create documentation for the new auth system:
  - Created `src/docs/auth-hooks.md` with comprehensive documentation

### ✅ src/pages/admin/Users.tsx - (917 lines)

**Reasons flagged:**
- Large component (917 lines)
- Complex CRUD operations mixed with UI
- Deeply nested JSX for table and modals

**Refactoring completed:**
- [x] Extract UserTable component
- [x] Create EditUserDialog component
- [x] Move user management API calls to userService.ts
- [x] Extract UI utility functions to UserBadges.tsx
- [x] Create comprehensive types for Users management

### ✅ src/components/dashboard/Sidebar.tsx - (791 lines)

**Reasons flagged:**
- Large component (791 lines)
- Complex navigation logic with UI rendering
- Many conditional sections and nested elements

**Refactoring completed:**
- [x] Extract SidebarLink, NestedLink components
- [x] Move navigation structure to LinkGroups component
- [x] Create modular navigation structure
- [x] Implement proper user permission checking
- [x] Improve component organization and readability

### ✅ src/hooks/useDashboardAuth.ts - (579 lines)

**Reasons flagged:**
- Large hook file (579 lines)
- Multiple responsibilities for auth, profile, and session management
- Complex error handling and fallback logic

**Refactoring completed:**
- [x] Split into smaller specialized hooks:
  - Created `useDashboardProfile.ts` for profile management
  - Created `useDashboardSession.ts` for session management
  - Created `useDashboardEmergencyAuth.ts` for emergency auth functions
- [x] Extract utility functions to separate files:
  - Created `utils/dashboard/profile-utils.ts` for profile-specific utilities
  - Created `utils/dashboard/auth-recovery.ts` for auth recovery functions
- [x] Simplify the main hook to compose these specialized hooks
- [x] Create comprehensive types file for dashboard auth

## Progress Tracking

| File | Hooks | Lines | Status |
|------|-------|-------|--------|
| src/pages/admin/SupabaseCheck.tsx | 19 | 1748 | ✅ Completed |
| src/services/supabaseDiagnostics.ts | - | 511 | ✅ Completed |
| src/components/layout/DashboardLayout.tsx | 25 | 1626 | ✅ Completed |
| src/pages/admin/SupabaseBedrock.tsx | 22 | 1556 | ✅ Completed |
| src/contexts/UnifiedAuthContext.tsx | 21 | 998 | ✅ Completed |
| src/pages/admin/Users.tsx | - | 917 | ✅ Completed |
| src/components/dashboard/Sidebar.tsx | - | 791 | ✅ Completed |
| src/hooks/useDashboardAuth.ts | - | 579 | ✅ Completed | 