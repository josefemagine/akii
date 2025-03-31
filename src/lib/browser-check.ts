/**
 * Utility to check if we're in a browser environment
 */

export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

// Safe wrapper for browser storage operations
export const safeStorage = {
  getItem: (key: string): string | null => {
    if (isBrowser()) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
    }
    return null;
  },
  
  setItem: (key: string, value: string): void => {
    if (isBrowser()) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error setting localStorage:', error);
      }
    }
  },
  
  removeItem: (key: string): void => {
    if (isBrowser()) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
    }
  }
};
