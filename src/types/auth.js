// Auth-related event names
export const AUTH_STATE_CHANGE_EVENT = 'akii:auth:stateChange';
export const AUTH_ERROR_EVENT = 'akii:auth:error';
export const AUTH_RECOVERY_EVENT = 'akii:auth:recovery';
// Auth roles
export const AUTH_ROLES = {
    ADMIN: 'admin',
    USER: 'user',
    DEVELOPER: 'developer',
};
// Auth status
export const AUTH_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    SUSPENDED: 'suspended',
};
// Profile validation helpers
export const isCompleteProfile = (profile) => {
    return profile &&
        typeof profile.id === 'string' &&
        typeof profile.email === 'string' &&
        typeof profile.role === 'string' &&
        typeof profile.status === 'string';
};
