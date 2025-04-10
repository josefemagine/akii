import { Session } from "@supabase/supabase-js";

// Debug logger
const log = (...args: any[]) => console.log('[Session Manager]', ...args);

// Session storage keys
const SESSION_KEY = 'akii-auth-session';
const SESSION_EXPIRY_KEY = 'akii-auth-session-expiry';

/**
 * Save the current session to localStorage 
 */
export const saveSession = (session: Session | null): void => {
  if (!session) {
    clearSession();
    return;
  }
  
  try {
    // Store the session
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    // Store the expiry time
    const expiryTime = new Date(session.expires_at! * 1000).getTime();
    localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
    
    log('Saved session to localStorage, expires at:', new Date(expiryTime).toLocaleString());
  } catch (e) {
    console.error('Error saving session to localStorage:', e);
  }
};

/**
 * Clear the stored session from localStorage
 */
export const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    log('Cleared session from localStorage');
  } catch (e) {
    console.error('Error clearing session from localStorage:', e);
  }
};

/**
 * Get the stored session from localStorage
 */
export const getStoredSession = (): Session | null => {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    
    const session = JSON.parse(sessionStr) as Session;
    
    // Check if the session is expired
    if (isSessionExpired()) {
      log('Retrieved stored session but it is expired');
      clearSession();
      return null;
    }
    
    log('Retrieved valid session from localStorage');
    return session;
  } catch (e) {
    console.error('Error retrieving session from localStorage:', e);
    return null;
  }
};

/**
 * Check if the stored session is expired
 */
export const isSessionExpired = (): boolean => {
  try {
    const expiryTimeStr = localStorage.getItem(SESSION_EXPIRY_KEY);
    if (!expiryTimeStr) return true;
    
    const expiryTime = parseInt(expiryTimeStr, 10);
    const now = Date.now();
    
    // Session is expired if current time is past expiry time
    const isExpired = now > expiryTime;
    
    if (isExpired) {
      log('Session is expired, expired at:', new Date(expiryTime).toLocaleString());
    }
    
    return isExpired;
  } catch (e) {
    console.error('Error checking session expiry:', e);
    return true; // Consider expired on error
  }
};

/**
 * Get the expiry time of the stored session
 */
export const getSessionExpiryTime = (): Date | null => {
  try {
    const expiryTimeStr = localStorage.getItem(SESSION_EXPIRY_KEY);
    if (!expiryTimeStr) return null;
    
    const expiryTime = parseInt(expiryTimeStr, 10);
    return new Date(expiryTime);
  } catch (e) {
    console.error('Error getting session expiry time:', e);
    return null;
  }
};

/**
 * Get the remaining time (in milliseconds) for the current session
 */
export const getSessionRemainingTime = (): number | null => {
  try {
    const expiryTimeStr = localStorage.getItem(SESSION_EXPIRY_KEY);
    if (!expiryTimeStr) return null;
    
    const expiryTime = parseInt(expiryTimeStr, 10);
    const now = Date.now();
    
    // Return the time difference (0 if expired)
    return Math.max(0, expiryTime - now);
  } catch (e) {
    console.error('Error calculating session remaining time:', e);
    return null;
  }
}; 