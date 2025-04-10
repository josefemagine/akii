/**
 * Repositories Index
 * 
 * Central export point for all repository classes that standardize REST API interactions.
 * Import from this file to get access to all repository classes.
 */

// Database service (core functionality)
export { DatabaseService } from './index';

// Domain-specific repositories
export { AuthRepository } from './auth-repository';
export { UserRepository } from './user-repository';
export { TeamRepository } from './team-repository';

// Export types from repositories
export type { UserProfile } from './user-repository';
export type { Team, TeamMember, TeamInvitation } from './team-repository'; 