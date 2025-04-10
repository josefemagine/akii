# Standardized REST API Approach

This document outlines our standardized approach to using Supabase's REST API for all database interactions.

## Core Principles

1. **Use Repository Pattern**: All database access is through repository classes that provide a consistent interface
2. **Avoid Direct SQL**: Use Supabase's REST API instead of direct SQL queries
3. **Centralize Database Logic**: Database logic is in SQL functions, not in the client
4. **Type Safety**: All repositories and functions are strongly typed
5. **Error Handling**: Consistent error handling across all repositories

## Available Repositories

### DatabaseService

Base service that provides core CRUD operations:

```typescript
// Get an item by ID
const user = await DatabaseService.getById<User>('profiles', userId);

// Get items with filters
const activeUsers = await DatabaseService.getItems<User>('profiles', {
  filters: { status: 'active' },
  limit: 10
});

// Insert an item
const newUser = await DatabaseService.insertItem<User>('profiles', userObject);

// Update an item
const updatedUser = await DatabaseService.updateItem<User>('profiles', userId, updates);

// Delete an item
const success = await DatabaseService.deleteItem('profiles', userId);

// Call an RPC function
const result = await DatabaseService.callFunction<ReturnType>('function_name', params);
```

### AuthRepository

Authentication and user management:

```typescript
// Get the current session
const { session, user } = await AuthRepository.getSession();

// Sign in
const { session, user, error } = await AuthRepository.signIn(email, password);

// Sign up
const { session, user, error } = await AuthRepository.signUp(email, password, metadata);

// Sign out
const { error } = await AuthRepository.signOut();

// Refresh session
const { session, user } = await AuthRepository.refreshSession();

// Check if user is admin
const isAdmin = await AuthRepository.isUserAdmin(userId);

// Get user profile
const profile = await AuthRepository.getUserProfile(userId);

// Ensure a profile exists
const profile = await AuthRepository.ensureProfileExists(userId, email, role, status);

// Update profile
const updatedProfile = await AuthRepository.updateProfile(userId, updates);

// Set user as admin
const success = await AuthRepository.setUserAsAdmin(userId);
```

### UserRepository

User and profile management:

```typescript
// Get a user profile
const profile = await UserRepository.getProfile(userId);

// Get multiple profiles
const profiles = await UserRepository.getProfiles({
  limit: 10,
  filters: { status: 'active' }
});

// Update a profile
const updatedProfile = await UserRepository.updateProfile(userId, updates);

// Check if user is admin
const isAdmin = await UserRepository.isAdmin(userId);

// Get detailed user info
const userDetails = await UserRepository.getUserDetails(userId);

// Toggle admin status
const success = await UserRepository.toggleAdminStatus(userId);

// Search for users
const results = await UserRepository.searchUsers('john', 10);
```

### TeamRepository

Team and team membership management:

```typescript
// Get user's teams
const teams = await TeamRepository.getUserTeams(userId);

// Get team details
const team = await TeamRepository.getTeam(teamId);

// Create a team
const newTeam = await TeamRepository.createTeam(teamObject);

// Update a team
const updatedTeam = await TeamRepository.updateTeam(teamId, updates);

// Delete a team
const success = await TeamRepository.deleteTeam(teamId);

// Get team members
const members = await TeamRepository.getTeamMembers(teamId);

// Add team member
const success = await TeamRepository.addTeamMember(teamId, userId, role);

// Remove team member
const success = await TeamRepository.removeTeamMember(teamId, userId);

// Update member role
const success = await TeamRepository.updateTeamMemberRole(teamId, userId, newRole);

// Get team invitations
const invitations = await TeamRepository.getTeamInvitations(teamId);

// Create invitation
const invitation = await TeamRepository.createInvitation(invitationObject);

// Cancel invitation
const success = await TeamRepository.cancelInvitation(invitationId);

// Accept invitation
const success = await TeamRepository.acceptInvitation(invitationId, userId);

// Decline invitation
const success = await TeamRepository.declineInvitation(invitationId);
```

## SQL Functions

All repositories use SQL functions for complex operations. These are defined in:

- `src/admin/sql/rest-api-functions.sql`
- `src/admin/sql/diagnostic-functions.sql`

## Implementation Notes

### Import Repositories

Import repositories and types from the central export point:

```typescript
import { 
  DatabaseService, 
  UserRepository, 
  AuthRepository, 
  TeamRepository,
  UserProfile,
  Team,
  TeamMember
} from '@/lib/database/repositories';
```

### Error Handling

All repository methods include proper error handling:

```typescript
try {
  const result = await UserRepository.getProfile(userId);
  // Handle success case
} catch (err) {
  console.error('Error fetching profile:', err);
  // Handle error case
}
```

### Extending Functionality

To add new functionality:

1. Create a SQL function if complex logic is needed
2. Add the method to the appropriate repository
3. Update this documentation

## Migration Path

When updating existing code to use the standardized approach:

1. Replace direct `supabase.from()` calls with repository methods
2. Replace direct `supabase.auth` calls with AuthRepository methods
3. Move complex logic to SQL functions 
4. Update components to use the new repositories 