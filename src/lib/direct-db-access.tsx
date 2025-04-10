import React from "react";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { supabase } from "./supabase.tsx";
interface STORAGE_KEYSProps {}

/**
 * Database access utilities for Supabase integration
 * These functions provide a standardized interface for accessing the database
 * and handling authentication state.
 */
// Storage keys for consistent access
export const STORAGE_KEYS = {
    USER_ID: 'akii-auth-user-id',
    USER_EMAIL: 'akii-auth-user-email',
    IS_LOGGED_IN: 'akii-is-logged-in',
    LOGIN_TIMESTAMP: 'akii-login-timestamp',
    SESSION_EXPIRY: 'akii-session-expiry',
    PROFILE: 'akii-direct-profile',
    SESSION_DURATION: 'akii-session-duration'
};
// Session duration in milliseconds (8 hours)
export const SESSION_DURATION = 8 * 60 * 60 * 1000;
/**
 * Initialize localStorage with default values if needed
 */
export function initializeLocalStorage() {
    if (typeof localStorage === 'undefined') {
        console.warn('LocalStorage is not available');
        return;
    }
    // Make sure the session duration is set
    if (!localStorage.getItem(STORAGE_KEYS.SESSION_DURATION)) {
        localStorage.setItem(STORAGE_KEYS.SESSION_DURATION, SESSION_DURATION.toString());
    }
}
/**
 * Set logged in state in localStorage
 */
export function setLoggedIn(userId, email) {
    try {
        initializeLocalStorage();
        const timestamp = Date.now();
        const sessionDuration = parseInt(localStorage.getItem(STORAGE_KEYS.SESSION_DURATION) || SESSION_DURATION.toString());
        const expiry = timestamp + sessionDuration;
        localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
        localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
        if (email) {
            localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
        }
        localStorage.setItem(STORAGE_KEYS.LOGIN_TIMESTAMP, timestamp.toString());
        localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, expiry.toString());
        return true;
    }
    catch (e) {
        console.error('Error setting logged in state:', e);
        return false;
    }
}
/**
 * Set logged out state in localStorage
 */
export function setLoggedOut() {
    try {
        initializeLocalStorage();
        localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
        localStorage.removeItem(STORAGE_KEYS.USER_ID);
        localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
        localStorage.removeItem(STORAGE_KEYS.LOGIN_TIMESTAMP);
        localStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
        localStorage.removeItem(STORAGE_KEYS.PROFILE);
        return true;
    }
    catch (e) {
        console.error('Error setting logged out state:', e);
        return false;
    }
}
/**
 * Check if the user is logged in based on local storage values
 * This is a critical function as it determines authentication state
 */
export function isLoggedIn() {
    try {
        // Ensure localStorage is initialized
        initializeLocalStorage();
        // Get all necessary values for auth check
        const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        const storedLoginFlag = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
        const loginTimestampStr = localStorage.getItem(STORAGE_KEYS.LOGIN_TIMESTAMP);
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
                    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
                }
                return true;
            }
            else {
                // Emergency login expired - clean it up
                console.log('Direct DB: Emergency login expired');
                localStorage.removeItem('akii-auth-emergency');
                localStorage.removeItem('akii-auth-emergency-time');
            }
        }
        // If no user ID is found, user is not logged in
        if (!userId) {
            return false;
        }
        // If login flag is explicitly set to 'true', user is logged in
        if (storedLoginFlag === 'true') {
            // Optional: Check if session has expired
            if (loginTimestampStr) {
                const loginTimestamp = parseInt(loginTimestampStr, 10);
                const currentTime = Date.now();
                const sessionDuration = parseInt(localStorage.getItem(STORAGE_KEYS.SESSION_DURATION) || SESSION_DURATION.toString());
                if (!isNaN(loginTimestamp) && (currentTime - loginTimestamp) > sessionDuration) {
                    console.log('Direct DB: Session expired');
                    setLoggedOut();
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    catch (e) {
        console.error('Error checking logged in state:', e);
        return false;
    }
}
/**
 * Check if the current user is an admin
 */
export function isAdmin() {
    try {
        // Try to get profile from session storage
        const profileStr = sessionStorage.getItem(STORAGE_KEYS.PROFILE);
        if (profileStr) {
            const profile = JSON.parse(profileStr);
            return (profile === null || profile === void 0 ? void 0 : profile.role) === 'admin';
        }
        // Default to false for safety
        return false;
    }
    catch (e) {
        console.warn('Direct DB: Error checking admin status:', e);
        return false;
    }
}
/**
 * Get minimal user object from local storage
 */
export function getMinimalUser() {
    try {
        const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        const email = localStorage.getItem(STORAGE_KEYS.USER_EMAIL);
        if (!userId) {
            return null;
        }
        return {
            id: userId,
            email: email || 'unknown@example.com',
            user_metadata: {
                email: email
            }
        };
    }
    catch (e) {
        console.warn('Error getting minimal user:', e);
        return null;
    }
}
/**
 * Ensure a user profile exists, creating it if needed
 */
export function ensureProfileExists(userId, email) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            // If no userId provided, get it from the current session
            if (!userId) {
                const { data: { session } } = yield supabase.auth.getSession();
                userId = (_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!email && ((_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.email)) {
                    email = session.user.email;
                }
            }
            if (!userId) {
                console.error('Cannot ensure profile exists without a user ID');
                return { data: null, error: new Error('User ID is required') };
            }
            // Check if profile already exists
            const { data: existingProfile, error: fetchError } = yield supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (fetchError) {
                // If error is not "no rows returned", something went wrong
                if (!fetchError.message.includes('no rows')) {
                    console.error('Error checking for existing profile:', fetchError);
                    return { data: null, error: fetchError };
                }
            }
            // If profile exists, return it
            if (existingProfile) {
                console.log('Profile already exists for user', userId);
                // Cache this profile
                try {
                    sessionStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(existingProfile));
                }
                catch (e) {
                    console.warn('Error caching profile:', e);
                }
                return { data: existingProfile, error: null };
            }
            // Create a new profile if it doesn't exist
            console.log('Creating new profile for user', userId);
            const newProfile = {
                id: userId,
                email: email || '',
                role: 'user',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            const { data: insertedProfile, error: insertError } = yield supabase
                .from('profiles')
                .insert(newProfile)
                .select()
                .single();
            if (insertError) {
                console.error('Error creating profile:', insertError);
                return { data: null, error: insertError };
            }
            // Cache this profile
            try {
                sessionStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(insertedProfile));
            }
            catch (e) {
                console.warn('Error caching profile:', e);
            }
            return { data: insertedProfile, error: null };
        }
        catch (e) {
            console.error('Unexpected error in ensureProfileExists:', e);
            return {
                data: null,
                error: e instanceof Error ? e : new Error(String(e))
            };
        }
    });
}
/**
 * Refresh the login timestamp to extend the session
 */
export function refreshSession() {
    if (!isLoggedIn())
        return;
    try {
        localStorage.setItem(STORAGE_KEYS.LOGIN_TIMESTAMP, new Date().getTime().toString());
        localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, (new Date().getTime() + SESSION_DURATION).toString());
        console.log('Direct DB: Session refreshed');
    }
    catch (e) {
        console.warn('Direct DB: Error refreshing session:', e);
    }
}
/**
 * Get user profile using the current user ID from auth state
 */
export function getProfileDirectly() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            // Get current user session for the ID
            const { data: { session } } = yield supabase.auth.getSession();
            const userId = (_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                console.log('Direct DB: No user session available');
                return {
                    data: null,
                    error: new Error('No active user session')
                };
            }
            console.log("Direct DB: Getting profile for user ID:", userId);
            // Check session storage cache first
            try {
                const cachedProfile = sessionStorage.getItem(STORAGE_KEYS.PROFILE);
                if (cachedProfile) {
                    const profile = JSON.parse(cachedProfile);
                    // Only use cached profile if it matches the current user
                    if (profile && profile.id === userId) {
                        console.log('Direct DB: Using cached profile from sessionStorage');
                        refreshSession(); // Keep session alive when using profile
                        return {
                            data: profile,
                            error: null,
                            fromCache: true
                        };
                    }
                }
            }
            catch (e) {
                console.warn('Direct DB: Error reading from sessionStorage:', e);
            }
            // If not cached, get from database
            const { data, error } = yield supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (error) {
                console.error("Direct DB: Error getting profile:", error);
                // Try to ensure a profile exists if there are no rows
                if (error.message.includes('no rows')) {
                    console.log("Direct DB: No profile found, creating one");
                    return ensureProfileExists(userId, (_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.email);
                }
                return { data: null, error };
            }
            console.log("Direct DB: Profile retrieved successfully");
            // Cache the profile
            try {
                sessionStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data));
                refreshSession(); // Refresh session when getting profile
            }
            catch (e) {
                console.warn('Direct DB: Error caching profile:', e);
            }
            return { data, error: null };
        }
        catch (e) {
            console.error("Direct DB: Unexpected error getting profile:", e);
            return {
                data: null,
                error: e instanceof Error ? e : new Error(String(e))
            };
        }
    });
}
/**
 * Update profile directly in the database
 */
export function updateProfileDirectly(profileData) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // Get current user session for the ID
            const { data: { session } } = yield supabase.auth.getSession();
            const userId = (_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                console.log('Direct DB: No user session available');
                return {
                    data: null,
                    error: new Error('No active user session')
                };
            }
            console.log("Direct DB: Updating profile for user:", userId);
            const { data, error } = yield supabase
                .from('profiles')
                .update(Object.assign(Object.assign({}, profileData), { updated_at: new Date().toISOString() }))
                .eq('id', userId)
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
                }
                catch (e) {
                    console.warn('Direct DB: Error updating cache:', e);
                }
                return { data, error: null };
            }
            return {
                data: null,
                error: new Error("Profile update returned no data")
            };
        }
        catch (e) {
            console.error("Direct DB: Unexpected error updating profile:", e);
            return {
                data: null,
                error: e instanceof Error ? e : new Error(String(e))
            };
        }
    });
}
/**
 * Fetch data for an agent directly
 */
export function getAgentDataDirectly(agentId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Direct DB: Fetching agent data for ID:", agentId);
            const { data, error } = yield supabase
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
        }
        catch (e) {
            console.error("Direct DB: Unexpected error fetching agent:", e);
            return {
                data: null,
                error: e instanceof Error ? e : new Error(String(e))
            };
        }
    });
}
/**
 * Generic function to fetch data from any table
 */
export function fetchFromTable(tableName_1) {
    return __awaiter(this, arguments, void 0, function* (tableName, options = {}) {
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
                ? yield query.single()
                : yield query;
            if (error) {
                console.error(`Direct DB: Error fetching from ${tableName}:`, error);
                return { data: null, error };
            }
            console.log(`Direct DB: Successfully fetched ${(data === null || data === void 0 ? void 0 : data.length) || 1} records from ${tableName}`);
            refreshSession(); // Refresh session on successful data fetch
            return { data, error: null };
        }
        catch (e) {
            console.error(`Direct DB: Unexpected error fetching from ${tableName}:`, e);
            return {
                data: null,
                error: e instanceof Error ? e : new Error(String(e))
            };
        }
    });
}
/**
 * Generic function to insert data into any table
 */
export function insertIntoTable(tableName_1, data_1) {
    return __awaiter(this, arguments, void 0, function* (tableName, data, options = { returning: true }) {
        try {
            console.log(`Direct DB: Inserting into ${tableName}:`, data);
            let query = supabase
                .from(tableName)
                .insert(data);
            // Type-safe approach to handle the select() call
            const { data: result, error } = options.returning
                ? yield query.select()
                : yield query;
            if (error) {
                console.error(`Direct DB: Error inserting into ${tableName}:`, error);
                return { data: null, error };
            }
            console.log(`Direct DB: Successfully inserted into ${tableName}`);
            refreshSession(); // Refresh session on successful data insertion
            return { data: result, error: null };
        }
        catch (e) {
            console.error(`Direct DB: Unexpected error inserting into ${tableName}:`, e);
            return {
                data: null,
                error: e instanceof Error ? e : new Error(String(e))
            };
        }
    });
}
/**
 * Generic function to update data in any table
 */
export function updateInTable(tableName_1, filters_1, updates_1) {
    return __awaiter(this, arguments, void 0, function* (tableName, filters, updates, options = { returning: true }) {
        try {
            console.log(`Direct DB: Updating in ${tableName}:`, { filters, updates });
            let query = supabase
                .from(tableName)
                .update(updates);
            // Apply filters
            Object.entries(filters).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
            // Type-safe approach to handle the select() call
            const { data, error } = options.returning
                ? yield query.select()
                : yield query;
            if (error) {
                console.error(`Direct DB: Error updating in ${tableName}:`, error);
                return { data: null, error };
            }
            console.log(`Direct DB: Successfully updated in ${tableName}`);
            refreshSession(); // Refresh session on successful data update
            return { data, error: null };
        }
        catch (e) {
            console.error(`Direct DB: Unexpected error updating in ${tableName}:`, e);
            return {
                data: null,
                error: e instanceof Error ? e : new Error(String(e))
            };
        }
    });
}
/**
 * Generic function to delete data from any table
 */
export function deleteFromTable(tableName_1, filters_1) {
    return __awaiter(this, arguments, void 0, function* (tableName, filters, options = { returning: false }) {
        try {
            console.log(`Direct DB: Deleting from ${tableName} with filters:`, filters);
            let query = supabase
                .from(tableName)
                .delete();
            // Apply filters
            Object.entries(filters).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
            // Type-safe approach to handle the select() call
            const { data, error } = options.returning
                ? yield query.select()
                : yield query;
            if (error) {
                console.error(`Direct DB: Error deleting from ${tableName}:`, error);
                return { data: null, error };
            }
            console.log(`Direct DB: Successfully deleted from ${tableName}`);
            refreshSession(); // Refresh session on successful data deletion
            return { data, error: null };
        }
        catch (e) {
            console.error(`Direct DB: Unexpected error deleting from ${tableName}:`, e);
            return {
                data: null,
                error: e instanceof Error ? e : new Error(String(e))
            };
        }
    });
}
