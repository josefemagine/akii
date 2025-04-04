import { supabase } from './supabase';

/**
 * Direct database access utilities
 * These functions bypass the authentication system and directly access the database
 * using a hardcoded user ID for development and testing purposes.
 */

export const HARDCODED_USER_ID = "b574f273-e0e1-4cb8-8c98-f5a7569234c8";

// Keys used for localStorage/sessionStorage
const STORAGE_KEYS = {
  PROFILE: 'akii-direct-profile',
  USER_ID: 'akii-auth-user-id',
  USER_EMAIL: 'akii-auth-user-email',
  AUTH_TOKEN: 'akii-auth-token',
  IS_LOGGED_IN: 'akii-is-logged-in',
  LOGIN_TIMESTAMP: 'akii-login-timestamp',
  SESSION_EXPIRY: 'akii-session-expiry'
};

// Session duration in milliseconds (8 hours)
export const SESSION_DURATION = 8 * 60 * 60 * 1000;

/**
 * Initialize localStorage with default values for critical auth-related items
 */
export function initializeLocalStorage(): void {
  try {
    // Check for existing login state first
    const existingLoginFlag = localStorage.getItem('akii-is-logged-in');
    const existingUserId = localStorage.getItem('akii-auth-user-id');
    const existingTimestamp = localStorage.getItem('akii-login-timestamp');
    const existingDuration = localStorage.getItem('akii-session-duration');
    
    // If we have an existing login state with timestamp and user ID, check if it's valid
    if (existingLoginFlag === 'true' && existingUserId && existingTimestamp && existingTimestamp !== '0') {
      // Parse the timestamp and check if the session is still valid
      try {
        const timestamp = parseInt(existingTimestamp, 10);
        const duration = parseInt(existingDuration || (8 * 60 * 60 * 1000).toString(), 10);
        const currentTime = Date.now();
        
        if (!isNaN(timestamp) && !isNaN(duration) && (currentTime - timestamp) < duration) {
          console.log('Direct DB: Existing login state is valid, preserving it');
          return;
        } else {
          // Session has expired, clean up the stale state
          console.log('Direct DB: Existing login state is stale, resetting it');
          localStorage.setItem('akii-is-logged-in', 'false');
          localStorage.setItem('akii-login-timestamp', '0');
        }
      } catch (e) {
        console.error('Direct DB: Error validating existing login timestamp', e);
      }
    }
    
    // Only initialize these values if they don't exist
    // IMPORTANT: Do not reset existing values, especially akii-is-logged-in and akii-auth-user-id
    
    // Only set login flag if it doesn't exist
    if (existingLoginFlag === null) {
      localStorage.setItem('akii-is-logged-in', 'false');
    }
    
    // Only set user ID if it doesn't exist and we have a hardcoded ID available
    if (!existingUserId && HARDCODED_USER_ID) {
      localStorage.setItem('akii-auth-user-id', HARDCODED_USER_ID);
    }
    
    // Only set timestamp if it doesn't exist
    if (!existingTimestamp) {
      localStorage.setItem('akii-login-timestamp', '0');
    }
    
    // Only set session duration if it doesn't exist
    if (!existingDuration) {
      // Default session duration: 8 hours
      localStorage.setItem('akii-session-duration', (8 * 60 * 60 * 1000).toString());
    }
    
    console.log('Direct DB: LocalStorage initialized with default values');
  } catch (error) {
    console.error('Direct DB: Error initializing localStorage', error);
  }
}

// Call initialization immediately
initializeLocalStorage();

/**
 * Check if the user is logged in based on local storage values
 * This is a critical function as it determines authentication state
 */
export function isLoggedIn(): boolean {
  try {
    // Ensure localStorage is initialized
    initializeLocalStorage();
    
    // Get all necessary values for auth check
    const userId = localStorage.getItem('akii-auth-user-id');
    const storedLoginFlag = localStorage.getItem('akii-is-logged-in');
    const loginTimestampStr = localStorage.getItem('akii-login-timestamp');
    
    // Check for emergency login first - highest priority
    const emergencyLogin = localStorage.getItem('akii-auth-emergency') === 'true';
    const emergencyTime = localStorage.getItem('akii-auth-emergency-time');
    if (emergencyLogin && emergencyTime && userId) {
      // If emergency login was within the last hour, consider it valid
      const currentTime = Date.now();
      const timestamp = parseInt(emergencyTime, 10);
      if (!isNaN(timestamp) && (currentTime - timestamp) < (60 * 60 * 1000)) {
        console.log('Direct DB: Emergency login detected and is still valid');
        
        // Fix inconsistent state if needed
        if (storedLoginFlag !== 'true') {
          console.log('Direct DB: Fixing login flag based on emergency login');
          localStorage.setItem('akii-is-logged-in', 'true');
        }
        
        return true;
      } else {
        // Emergency login expired - clean it up
        console.log('Direct DB: Emergency login expired');
        localStorage.removeItem('akii-auth-emergency');
        localStorage.removeItem('akii-auth-emergency-time');
      }
    }
    
    // First check if we have a valid user ID as the primary indicator
    if (userId && userId.length >= 10) {
      // If userId exists but login flag is false, this could be an inconsistency
      if (storedLoginFlag !== 'true') {
        console.log('Direct DB: Found valid user ID but login flag is false, attempting recovery');
        
        // Check if we have a timestamp or can create one
        if (loginTimestampStr && loginTimestampStr !== '0' && loginTimestampStr !== 'null') {
          // We have a timestamp, check if the session is still valid
          try {
            const timestamp = parseInt(loginTimestampStr, 10);
            const currentTime = Date.now();
            const sessionDuration = parseInt(localStorage.getItem('akii-session-duration') || '28800000', 10);
            
            if (!isNaN(timestamp) && (currentTime - timestamp) < sessionDuration) {
              // Session is still valid, fix the inconsistent login flag
              console.log('Direct DB: Fixing inconsistent login state - setting login flag to true');
              localStorage.setItem('akii-is-logged-in', 'true');
              
              // Log diagnostic data
              console.log('Direct DB: Login state recovered from user ID', {
                userId,
                timestamp,
                sessionValid: true
              });
              
              return true;
            }
          } catch (error) {
            console.error('Direct DB: Error parsing timestamp during recovery', error);
          }
        } else if (storedLoginFlag !== 'true') {
          // No valid timestamp but we have a user ID - create a new session as last resort
          const currentTime = Date.now();
          console.log('Direct DB: Creating new session for existing user ID as recovery');
          
          localStorage.setItem('akii-is-logged-in', 'true');
          localStorage.setItem('akii-login-timestamp', currentTime.toString());
          localStorage.setItem('akii-session-duration', (8 * 60 * 60 * 1000).toString());
          
          return true;
        }
      }
    }
    
    // Standard login check if no recovery was needed
    // Step 1: Check login flag
    if (storedLoginFlag !== 'true') {
      return false;
    }
    
    // Step 2: Validate user ID
    if (!userId || userId.length < 10) {
      console.error('Direct DB: Login flag true but no valid user ID');
      localStorage.setItem('akii-is-logged-in', 'false'); // Fix inconsistent state
      return false;
    }
    
    // Step 3: Validate timestamp
    if (!loginTimestampStr || loginTimestampStr === 'null' || loginTimestampStr === '0') {
      console.error('Direct DB: Login flag true but no valid timestamp');
      localStorage.setItem('akii-is-logged-in', 'false'); // Fix inconsistent state
      return false;
    }
    
    // Step 4: Check session validity
    let loginTimestamp: number;
    try {
      loginTimestamp = parseInt(loginTimestampStr, 10);
      
      // Sanity check - timestamp must be a valid number and > 0
      if (isNaN(loginTimestamp) || loginTimestamp <= 0) {
        console.error('Direct DB: Invalid login timestamp', loginTimestampStr);
        localStorage.setItem('akii-is-logged-in', 'false'); // Fix inconsistent state
        return false;
      }
    } catch (parseError) {
      console.error('Direct DB: Error parsing login timestamp', parseError);
      localStorage.setItem('akii-is-logged-in', 'false'); // Fix inconsistent state
      return false;
    }
    
    // Get current time and calculate time difference
    const currentTime = Date.now();
    const timeDiff = currentTime - loginTimestamp;
    
    // Parse session duration with fallback
    let sessionDuration: number;
    try {
      const durationStr = localStorage.getItem('akii-session-duration');
      sessionDuration = durationStr ? parseInt(durationStr, 10) : 28800000; // 8 hours default
      
      // Sanity check - duration must be valid and reasonable
      if (isNaN(sessionDuration) || sessionDuration <= 0 || sessionDuration < 60000) {
        console.error('Direct DB: Invalid session duration', durationStr);
        sessionDuration = 28800000; // Reset to 8 hours as fallback
      }
    } catch (parseError) {
      console.error('Direct DB: Error parsing session duration', parseError);
      sessionDuration = 28800000; // 8 hours default
    }
    
    // Check session validity
    const isSessionValid = timeDiff < sessionDuration;
    
    // If session is expired, update localStorage and return false
    if (!isSessionValid) {
      console.warn('Direct DB: Session has expired - logging out');
      localStorage.setItem('akii-is-logged-in', 'false');
      return false;
    }
    
    // Log detailed diagnostic information
    console.log('Direct DB: isLoggedIn evaluation', {
      criteria: {
        hasValidLoginFlag: true,
        hasValidUserId: true,
        hasValidTimestamp: true,
        isSessionValid: true
      },
      values: {
        storedLoginFlag,
        userId,
        loginTimestamp,
        currentTime,
        timeDiff,
        sessionDuration
      },
      result: true
    });
    
    // All checks passed
    return true;
  } catch (error) {
    // On any unexpected error, log and fail closed (not authenticated)
    console.error('Direct DB: Critical error in isLoggedIn check', error);
    return false;
  }
}

/**
 * Check if the current user is an admin
 */
export function isAdmin(): boolean {
  try {
    // Try to get profile from session storage
    const profileStr = sessionStorage.getItem(STORAGE_KEYS.PROFILE);
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      return profile?.role === 'admin';
    }
    
    // If no profile in session storage, check if this is our hardcoded dev ID
    const userId = localStorage.getItem('akii-auth-user-id');
    if (userId === HARDCODED_USER_ID) {
      console.log('Direct DB: Using hardcoded admin status for development user ID');
      // In development mode, hardcoded user is always admin
      return true;
    }
    
    // Default to false for safety
    return false;
  } catch (e) {
    console.warn('Direct DB: Error checking admin status:', e);
    
    // Fallback for hardcoded ID
    const userId = localStorage.getItem('akii-auth-user-id');
    if (userId === HARDCODED_USER_ID) {
      return true;
    }
    
    return false;
  }
}

/**
 * Set the user as logged in, update all storage values
 */
export function setLoggedIn(userId: string, email?: string): void {
  try {
    console.log('Direct DB: Setting user as logged in', { userId, email });
    
    // Get the current timestamp
    const timestamp = Date.now();
    
    // Standardize session duration (8 hours)
    const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
    
    // Calculate session expiry timestamp
    const expiryTimestamp = timestamp + sessionDuration;
    
    // Log state before setting
    console.log('Direct DB: localStorage BEFORE setting logged in:', {
      current: {
        isLoggedIn: localStorage.getItem('akii-is-logged-in'),
        userId: localStorage.getItem('akii-auth-user-id'),
        timestamp: localStorage.getItem('akii-login-timestamp')
      },
      willSet: {
        isLoggedIn: 'true',
        userId,
        timestamp,
        sessionDuration,
        expiryTimestamp
      }
    });
    
    // First clear any existing values to prevent conflicts
    localStorage.removeItem('akii-is-logged-in');
    localStorage.removeItem('akii-auth-user-id');
    localStorage.removeItem('akii-login-timestamp');
    localStorage.removeItem('akii-session-duration');
    localStorage.removeItem('akii-session-expiry');
    
    // Force a small delay to ensure the browser has processed the removals
    // This helps prevent race conditions in some browsers
    setTimeout(() => {
      // Store all login-related info in localStorage - EXACT SAME FORMAT AS EMERGENCY LOGIN
      localStorage.setItem('akii-is-logged-in', 'true');
      localStorage.setItem('akii-auth-user-id', userId);
      localStorage.setItem('akii-login-timestamp', timestamp.toString());
      localStorage.setItem('akii-session-duration', sessionDuration.toString());
      localStorage.setItem('akii-session-expiry', expiryTimestamp.toString());
      
      if (email) {
        localStorage.setItem('akii-auth-user-email', email);
      }
      
      // Also store in sessionStorage for faster access
      sessionStorage.setItem('akii-is-logged-in', 'true');
      sessionStorage.setItem('akii-auth-user-id', userId);
      
      // Verify values were actually set
      const verifyLogin = localStorage.getItem('akii-is-logged-in');
      const verifyUserId = localStorage.getItem('akii-auth-user-id');
      const verifyTimestamp = localStorage.getItem('akii-login-timestamp');
      
      console.log('Direct DB: localStorage AFTER setting logged in:', {
        isLoggedIn: verifyLogin,
        userId: verifyUserId,
        timestamp: verifyTimestamp,
        allValues: {
          isLoggedIn: localStorage.getItem('akii-is-logged-in'),
          userId: localStorage.getItem('akii-auth-user-id'),
          timestamp: localStorage.getItem('akii-login-timestamp'),
          sessionDuration: localStorage.getItem('akii-session-duration'),
          expiryTimestamp: localStorage.getItem('akii-session-expiry')
        }
      });
      
      // Create a custom event to notify components of login change
      const loginEvent = new CustomEvent('akii-login-state-changed', { 
        detail: { isLoggedIn: true, userId } 
      });
      window.dispatchEvent(loginEvent);
      
      // Check if values are correctly set
      if (verifyLogin !== 'true' || !verifyUserId || !verifyTimestamp) {
        console.error('Direct DB: CRITICAL ERROR - localStorage values were not set correctly!', {
          expected: {
            isLoggedIn: 'true',
            userId,
            timestamp
          },
          actual: {
            isLoggedIn: verifyLogin,
            userId: verifyUserId,
            timestamp: verifyTimestamp
          }
        });
        
        // Last-ditch attempt - try synchronous writes once more
        localStorage.setItem('akii-is-logged-in', 'true');
        localStorage.setItem('akii-auth-user-id', userId);
        localStorage.setItem('akii-login-timestamp', timestamp.toString());
      }
    }, 50); // Small delay to ensure browser processing
  } catch (error) {
    console.error('Direct DB: Error setting logged in state', error);
    
    // Fallback direct setting if exception occurs
    try {
      localStorage.setItem('akii-is-logged-in', 'true');
      localStorage.setItem('akii-auth-user-id', userId);
      localStorage.setItem('akii-login-timestamp', Date.now().toString());
    } catch (fallbackError) {
      console.error('Direct DB: Critical fallback error', fallbackError);
    }
  }
}

/**
 * Clear all auth-related storage values for logout
 */
export function setLoggedOut(): void {
  try {
    console.log('Direct DB: Clearing all auth-related storage for logout');
    
    // Direct Auth Storage Keys
    const keysToRemove = [
      STORAGE_KEYS.IS_LOGGED_IN,
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.USER_EMAIL,
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.LOGIN_TIMESTAMP,
      STORAGE_KEYS.SESSION_EXPIRY,
      STORAGE_KEYS.PROFILE,
      'akii-is-logged-in',
      'akii-auth-user-id',
      'akii-auth-user-email',
      'akii-login-timestamp',
      'akii-session-expiry',
      'akii-is-admin',
      'akii-session-duration',
      
      // Admin override keys
      'admin_override',
      'admin_override_email',
      'admin_override_time',
      'akii_admin_override',
      'akii_admin_override_email',
      'akii_admin_override_expiry',
      'permanent-dashboard-access',
      'force-auth-login',
      
      // Other auth-related keys
      'auth-in-progress',
      'auth-user-role',
      'user-role',
      'akii-auth-role',
    ];
    
    // Clear localStorage keys
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Direct DB: Failed to remove ${key} from localStorage:`, error);
      }
    });
    
    // Clear sessionStorage keys
    keysToRemove.forEach(key => {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.warn(`Direct DB: Failed to remove ${key} from sessionStorage:`, error);
      }
    });
    
    // Clear any keys with certain prefixes (akii-, supabase, sb-, etc.)
    Object.keys(localStorage).forEach(key => {
      if (key.includes('akii-') || 
          key.includes('supabase') || 
          key.includes('sb-') || 
          key.includes('token') || 
          key.includes('auth')) {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Direct DB: Failed to remove ${key} from localStorage:`, error);
        }
      }
    });
    
    // Do the same for sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('akii-') || 
          key.includes('supabase') || 
          key.includes('sb-') || 
          key.includes('profile')) {
        try {
          sessionStorage.removeItem(key);
        } catch (error) {
          console.warn(`Direct DB: Failed to remove ${key} from sessionStorage:`, error);
        }
      }
    });
    
    console.log('Direct DB: User set as logged out, all storage cleared');
  } catch (e) {
    console.warn('Direct DB: Error setting logout state:', e);
    
    // Even if the comprehensive approach fails, try a direct approach
    try {
      localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'false');
      localStorage.removeItem(STORAGE_KEYS.LOGIN_TIMESTAMP);
      localStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
      sessionStorage.removeItem(STORAGE_KEYS.PROFILE);
    } catch (directError) {
      console.error('Direct DB: Critical error during emergency logout attempt:', directError);
    }
  }
}

/**
 * Refresh the login timestamp to extend the session
 */
export function refreshSession(): void {
  if (!isLoggedIn()) return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.LOGIN_TIMESTAMP, new Date().getTime().toString());
    localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, 
      (new Date().getTime() + SESSION_DURATION).toString());
    console.log('Direct DB: Session refreshed');
  } catch (e) {
    console.warn('Direct DB: Error refreshing session:', e);
  }
}

/**
 * Get user profile directly from the database
 */
export async function getProfileDirectly() {
  console.log("Direct DB: Getting profile directly for ID:", HARDCODED_USER_ID);
  
  try {
    // Check session storage cache first
    try {
      const cachedProfile = sessionStorage.getItem(STORAGE_KEYS.PROFILE);
      if (cachedProfile) {
        console.log('Direct DB: Using cached profile from sessionStorage');
        refreshSession(); // Keep session alive when using profile
        return { 
          data: JSON.parse(cachedProfile), 
          error: null,
          fromCache: true
        };
      }
    } catch (e) {
      console.warn('Direct DB: Error reading from sessionStorage:', e);
    }
    
    // If not cached, get from database
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', HARDCODED_USER_ID)
      .single();
    
    if (error) {
      console.error("Direct DB: Error getting profile:", error);
      
      // If we get a PGRST116 error (no rows returned), we should create a fallback profile
      if (error.code === 'PGRST116') {
        console.log("Direct DB: No profile found, using fallback profile");
        
        // Create a fallback profile to prevent cascading errors
        const fallbackProfile = {
          id: HARDCODED_USER_ID,
          email: localStorage.getItem(STORAGE_KEYS.USER_EMAIL) || 'dev@example.com',
          role: 'admin', // For development only
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_fallback: true
        };
        
        // Cache this fallback profile
        try {
          sessionStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(fallbackProfile));
        } catch (storageError) {
          console.warn('Direct DB: Error caching fallback profile:', storageError);
        }
        
        return { data: fallbackProfile, error: null, isFallback: true };
      }
      
      return { data: null, error };
    }
    
    if (data) {
      console.log("Direct DB: Profile retrieved from database:", data);
      
      // Cache the profile
      try {
        sessionStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data));
        localStorage.setItem(STORAGE_KEYS.USER_ID, HARDCODED_USER_ID);
        localStorage.setItem(STORAGE_KEYS.USER_EMAIL, data.email || '');
        refreshSession(); // Refresh session when successfully getting profile
      } catch (e) {
        console.warn('Direct DB: Error caching profile:', e);
      }
      
      return { data, error: null };
    }
    
    // If we get here, no profile was found but no error was thrown
    // Return a fallback profile
    console.log("Direct DB: No profile found but no error thrown, using fallback");
    const fallbackProfile = {
      id: HARDCODED_USER_ID,
      email: localStorage.getItem(STORAGE_KEYS.USER_EMAIL) || 'dev@example.com',
      role: 'admin', // For development only
      is_fallback: true
    };
    
    // Cache this fallback profile
    try {
      sessionStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(fallbackProfile));
    } catch (e) {
      console.warn('Direct DB: Error caching fallback profile:', e);
    }
    
    return { 
      data: fallbackProfile, 
      error: null,
      isFallback: true
    };
  } catch (e) {
    console.error("Direct DB: Unexpected error getting profile:", e);
    
    // Create emergency fallback profile on critical error
    const emergencyProfile = {
      id: HARDCODED_USER_ID,
      email: 'emergency@example.com',
      role: 'admin',
      is_emergency: true
    };
    
    // Try to cache emergency profile
    try {
      sessionStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(emergencyProfile));
    } catch (storageError) {
      // Non-critical, continue
    }
    
    return { 
      data: emergencyProfile, 
      error: e instanceof Error ? e : new Error(String(e)),
      isEmergency: true
    };
  }
}

/**
 * Update profile directly in the database
 */
export async function updateProfileDirectly(profileData: any) {
  console.log("Direct DB: Updating profile directly:", profileData);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', HARDCODED_USER_ID)
      .select()
      .single();
    
    if (error) {
      console.error("Direct DB: Error updating profile:", error);
      return { data: null, error };
    }
    
    if (data) {
      console.log("Direct DB: Profile updated successfully:", data);
      
      // Update the cache
      try {
        sessionStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data));
        refreshSession(); // Refresh session when updating profile
      } catch (e) {
        console.warn('Direct DB: Error updating cache:', e);
      }
      
      return { data, error: null };
    }
    
    return { 
      data: null, 
      error: new Error("Profile update returned no data") 
    };
  } catch (e) {
    console.error("Direct DB: Unexpected error updating profile:", e);
    return { 
      data: null, 
      error: e instanceof Error ? e : new Error(String(e))
    };
  }
}

/**
 * Get a minimal user object that can be used as a fallback
 */
export function getMinimalUser() {
  return {
    id: HARDCODED_USER_ID,
    email: localStorage.getItem(STORAGE_KEYS.USER_EMAIL) || 'unknown@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: ''
  };
}

/**
 * Ensure a profile exists for the user - creates one if it doesn't
 */
export async function ensureProfileExists(email?: string): Promise<{
  data: any | null;
  error: Error | null;
}> {
  try {
    console.log('Direct DB: Ensuring profile exists');
    
    // Get the current user ID from localStorage
    const userId = localStorage.getItem('akii-auth-user-id') || HARDCODED_USER_ID;
    
    if (!userId) {
      console.error('Direct DB: No user ID found, cannot ensure profile exists');
      return { data: null, error: new Error('No user ID found') };
    }
    
    // First, try to fetch database schema to see what columns are available
    try {
      console.log('Direct DB: Attempting to fetch database schema information');
      const schemaCheck = await supabase.rpc('get_schema_info', { table_name: 'profiles' });
      console.log('Direct DB: Schema info result:', schemaCheck);
    } catch (schemaError) {
      console.warn('Direct DB: Failed to get schema info:', schemaError);
    }
    
    // Try to get the existing profile
    const { data: existingProfile, error: getError } = await getProfileDirectly();
    
    // If profile exists, return it
    if (existingProfile) {
      console.log('Direct DB: Profile already exists:', existingProfile);
      return { data: existingProfile, error: null };
    }
    
    console.log('Direct DB: Profile not found, creating new profile');
    
    // Create a simplified profile with only the required fields
    // Removed potentially problematic fields like name, avatar_url
    const newProfile = {
      id: userId,
      email: email || 'dev@example.com',
      role: 'admin', // For development purposes
      updated_at: new Date().toISOString()
    };
    
    console.log('Direct DB: Attempting to create profile with fields:', Object.keys(newProfile));
    
    // Insert the profile into the database
    const { data, error } = await supabase
      .from('profiles')
      .upsert([newProfile], { onConflict: 'id' })
      .select('*')
      .single();
    
    if (error) {
      console.error('Direct DB: Error creating profile:', error);
      
      // Special fallback - create a minimal profile as last resort
      if (error.message && error.message.includes('column')) {
        console.log('Direct DB: Attempting minimal profile creation with just ID and email');
        const minimalProfile = {
          id: userId,
          email: email || 'dev@example.com'
        };
        
        const minimalResult = await supabase
          .from('profiles')
          .upsert([minimalProfile], { onConflict: 'id' })
          .select('*')
          .single();
          
        if (minimalResult.error) {
          console.error('Direct DB: Even minimal profile creation failed:', minimalResult.error);
          return { data: null, error: new Error(error.message || 'Error creating profile') };
        } else {
          console.log('Direct DB: Minimal profile created successfully:', minimalResult.data);
          
          // Store in sessionStorage for quicker access
          try {
            sessionStorage.setItem('akii-profile', JSON.stringify(minimalResult.data));
          } catch (storageError: unknown) {
            console.warn('Direct DB: Error storing profile in sessionStorage:', storageError);
          }
          
          return { data: minimalResult.data, error: null };
        }
      }
      
      // If not a column error or minimal profile failed
      return { data: null, error: new Error(error.message || 'Error creating profile') };
    }
    
    // Store in sessionStorage for quicker access
    try {
      sessionStorage.setItem('akii-profile', JSON.stringify(data));
    } catch (storageError: unknown) {
      console.warn('Direct DB: Error storing profile in sessionStorage:', storageError);
      // Non-critical error, continue
    }
    
    console.log('Direct DB: Profile created successfully:', data);
    return { data, error: null };
  } catch (error: unknown) {
    console.error('Direct DB: Error ensuring profile exists:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error ensuring profile exists')
    };
  }
}

/**
 * Fetch data for an agent directly
 */
export async function getAgentDataDirectly(agentId: string) {
  try {
    console.log("Direct DB: Fetching agent data for ID:", agentId);
    
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();
    
    if (error) {
      console.error("Direct DB: Error fetching agent:", error);
      return { data: null, error };
    }
    
    console.log("Direct DB: Agent data retrieved successfully");
    return { data, error: null };
  } catch (e) {
    console.error("Direct DB: Unexpected error fetching agent:", e);
    return { 
      data: null, 
      error: e instanceof Error ? e : new Error(String(e))
    };
  }
}

/**
 * Generic function to fetch data from any table
 */
export async function fetchFromTable(tableName: string, options: {
  columns?: string,
  filters?: Record<string, any>,
  limit?: number,
  single?: boolean
} = {}) {
  try {
    console.log(`Direct DB: Fetching from ${tableName} with options:`, options);
    
    let query = supabase
      .from(tableName)
      .select(options.columns || '*');
    
    // Apply filters if provided
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    // Apply limit if provided
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    // Get a single record if requested
    const { data, error } = options.single 
      ? await query.single()
      : await query;
    
    if (error) {
      console.error(`Direct DB: Error fetching from ${tableName}:`, error);
      return { data: null, error };
    }
    
    console.log(`Direct DB: Successfully fetched ${data?.length || 1} records from ${tableName}`);
    refreshSession(); // Refresh session on successful data fetch
    return { data, error: null };
  } catch (e) {
    console.error(`Direct DB: Unexpected error fetching from ${tableName}:`, e);
    return { 
      data: null, 
      error: e instanceof Error ? e : new Error(String(e))
    };
  }
}

/**
 * Generic function to insert data into any table
 */
export async function insertIntoTable(tableName: string, data: any, options: {
  returning?: boolean
} = { returning: true }) {
  try {
    console.log(`Direct DB: Inserting into ${tableName}:`, data);
    
    let query = supabase
      .from(tableName)
      .insert(data);
    
    if (options.returning) {
      query = query.select();
    }
    
    const { data: result, error } = await query;
    
    if (error) {
      console.error(`Direct DB: Error inserting into ${tableName}:`, error);
      return { data: null, error };
    }
    
    console.log(`Direct DB: Successfully inserted into ${tableName}`);
    refreshSession(); // Refresh session on successful data insertion
    return { data: result, error: null };
  } catch (e) {
    console.error(`Direct DB: Unexpected error inserting into ${tableName}:`, e);
    return { 
      data: null, 
      error: e instanceof Error ? e : new Error(String(e))
    };
  }
}

/**
 * Generic function to update data in any table
 */
export async function updateInTable(
  tableName: string, 
  filters: Record<string, any>, 
  updates: any, 
  options: { returning?: boolean } = { returning: true }
) {
  try {
    console.log(`Direct DB: Updating in ${tableName}:`, { filters, updates });
    
    let query = supabase
      .from(tableName)
      .update(updates);
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    if (options.returning) {
      query = query.select();
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Direct DB: Error updating in ${tableName}:`, error);
      return { data: null, error };
    }
    
    console.log(`Direct DB: Successfully updated in ${tableName}`);
    refreshSession(); // Refresh session on successful data update
    return { data, error: null };
  } catch (e) {
    console.error(`Direct DB: Unexpected error updating in ${tableName}:`, e);
    return { 
      data: null, 
      error: e instanceof Error ? e : new Error(String(e))
    };
  }
}

/**
 * Generic function to delete data from any table
 */
export async function deleteFromTable(
  tableName: string, 
  filters: Record<string, any>,
  options: { returning?: boolean } = { returning: false }
) {
  try {
    console.log(`Direct DB: Deleting from ${tableName} with filters:`, filters);
    
    let query = supabase
      .from(tableName)
      .delete();
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    if (options.returning) {
      query = query.select();
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Direct DB: Error deleting from ${tableName}:`, error);
      return { data: null, error };
    }
    
    console.log(`Direct DB: Successfully deleted from ${tableName}`);
    refreshSession(); // Refresh session on successful data deletion
    return { data, error: null };
  } catch (e) {
    console.error(`Direct DB: Unexpected error deleting from ${tableName}:`, e);
    return { 
      data: null, 
      error: e instanceof Error ? e : new Error(String(e))
    };
  }
} 