/**
 * Browser environment detection utility
 * Used to safely check if code is running in a browser environment
 */

/**
 * Checks if the current environment is a browser
 * @returns boolean indicating if code is running in a browser
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Checks if the current environment supports localStorage
 * @returns boolean indicating if localStorage is available
 */
export function hasLocalStorage(): boolean {
  if (!isBrowser()) return false;

  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Safely accesses localStorage
 * @returns localStorage object or null if not available
 */
export function safeLocalStorage(): Storage | null {
  return hasLocalStorage() ? localStorage : null;
}

/**
 * Safely accesses sessionStorage
 * @returns sessionStorage object or null if not available
 */
export function safeSessionStorage(): Storage | null {
  if (!isBrowser()) return null;

  try {
    const testKey = "__storage_test__";
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return sessionStorage;
  } catch (e) {
    return null;
  }
}

// Utility object for safe storage operations
export const safeStorage = {
  getItem: (key: string): string | null => {
    if (isBrowser()) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error("Error accessing localStorage:", error);
      }
    }
    return null;
  },

  setItem: (key: string, value: string): void => {
    if (isBrowser()) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error("Error setting localStorage:", error);
      }
    }
  },

  removeItem: (key: string): void => {
    if (isBrowser()) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error("Error removing from localStorage:", error);
      }
    }
  },
};
