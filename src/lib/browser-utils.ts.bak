// Comprehensive browser utilities
export const isBrowser = typeof window !== 'undefined';

// Safe storage utilities
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    if (!isBrowser) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.error('Error setting localStorage:', e);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    if (!isBrowser) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Error removing from localStorage:', e);
      return false;
    }
  },
  
  clear: (): boolean => {
    if (!isBrowser) return false;
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Error clearing localStorage:', e);
      return false;
    }
  }
};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.error('Error accessing sessionStorage:', e);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    if (!isBrowser) return false;
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.error('Error setting sessionStorage:', e);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    if (!isBrowser) return false;
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Error removing from sessionStorage:', e);
      return false;
    }
  },
  
  clear: (): boolean => {
    if (!isBrowser) return false;
    try {
      sessionStorage.clear();
      return true;
    } catch (e) {
      console.error('Error clearing sessionStorage:', e);
      return false;
    }
  }
};

// Admin override utilities
export const adminOverride = {
  enable: (email: string, durationDays = 30): boolean => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + durationDays);
    
    return safeLocalStorage.setItem("akii_admin_override", "true") &&
           safeLocalStorage.setItem("akii_admin_override_email", email) &&
           safeLocalStorage.setItem("akii_admin_override_expiry", expiryDate.toISOString());
  },
  
  check: (email: string): boolean => {
    const override = safeLocalStorage.getItem("akii_admin_override") === "true";
    const storedEmail = safeLocalStorage.getItem("akii_admin_override_email");
    const expiryStr = safeLocalStorage.getItem("akii_admin_override_expiry");
    
    if (override && storedEmail === email && expiryStr) {
      const expiry = new Date(expiryStr);
      return expiry > new Date();
    }
    return false;
  },
  
  clear: (): boolean => {
    return safeLocalStorage.removeItem("akii_admin_override") &&
           safeLocalStorage.removeItem("akii_admin_override_email") &&
           safeLocalStorage.removeItem("akii_admin_override_expiry");
  },
  
  forceJosefAsAdmin: (): boolean => {
    return adminOverride.enable("josef@holm.com", 365);
  }
}; 