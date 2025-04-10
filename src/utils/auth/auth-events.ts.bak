import { AuthError } from "@supabase/supabase-js";

// Auth event constants
export const AUTH_STATE_CHANGE_EVENT = 'akii:auth:stateChange';
export const AUTH_ERROR_EVENT = 'akii:auth:error';
export const AUTH_RECOVERY_EVENT = 'akii:auth:recovery';
export const PROFILE_UPDATED_EVENT = 'akii:profile:updated';

// Debug logger
const log = (...args: any[]) => console.log('[Auth Events]', ...args);

/**
 * Dispatch an auth state change event
 */
export const dispatchAuthStateChange = (data: any = {}) => {
  log('Dispatching auth state change event', data);
  window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGE_EVENT, { detail: data }));
};

/**
 * Dispatch an auth error event
 */
export const dispatchAuthError = (error: AuthError | Error | string, context: string = '') => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  log('Dispatching auth error event', { error, context });
  window.dispatchEvent(new CustomEvent(AUTH_ERROR_EVENT, {
    detail: { error, errorMessage, context }
  }));
};

/**
 * Dispatch an auth recovery event (used when fallback auth methods are triggered)
 */
export const dispatchAuthRecovery = (data: any = {}) => {
  log('Dispatching auth recovery event', data);
  window.dispatchEvent(new CustomEvent(AUTH_RECOVERY_EVENT, { detail: data }));
};

/**
 * Dispatch a profile updated event
 */
export const dispatchProfileUpdated = (userId: string, profile: any = {}) => {
  log('Dispatching profile updated event', { userId, profile });
  window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, {
    detail: { userId, profile }
  }));
};

/**
 * Listen for auth state change events
 */
export const onAuthStateChange = (callback: (event: CustomEvent) => void): () => void => {
  const handler = (event: Event) => {
    callback(event as CustomEvent);
  };
  window.addEventListener(AUTH_STATE_CHANGE_EVENT, handler);
  return () => window.removeEventListener(AUTH_STATE_CHANGE_EVENT, handler);
};

/**
 * Listen for auth error events
 */
export const onAuthError = (callback: (event: CustomEvent) => void): () => void => {
  const handler = (event: Event) => {
    callback(event as CustomEvent);
  };
  window.addEventListener(AUTH_ERROR_EVENT, handler);
  return () => window.removeEventListener(AUTH_ERROR_EVENT, handler);
};

/**
 * Listen for auth recovery events
 */
export const onAuthRecovery = (callback: (event: CustomEvent) => void): () => void => {
  const handler = (event: Event) => {
    callback(event as CustomEvent);
  };
  window.addEventListener(AUTH_RECOVERY_EVENT, handler);
  return () => window.removeEventListener(AUTH_RECOVERY_EVENT, handler);
};

/**
 * Listen for profile updated events
 */
export const onProfileUpdated = (callback: (event: CustomEvent) => void): () => void => {
  const handler = (event: Event) => {
    callback(event as CustomEvent);
  };
  window.addEventListener(PROFILE_UPDATED_EVENT, handler);
  return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handler);
}; 