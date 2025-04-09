/**
 * Admin utility functions to ensure reliable admin access and page loading
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { supabase } from './supabase';
/**
 * Checks all possible admin indicators to determine admin status
 * This is a fast, synchronous check that uses localStorage and other client-side indicators
 */
export const getClientSideAdminStatus = () => {
    // Check localStorage indicators first (fastest path)
    const localStorageAdmin = localStorage.getItem('akii-is-admin') === 'true';
    // Check admin override flag
    const adminOverride = localStorage.getItem('akii_admin_override') === 'true';
    // Check override expiry
    let overrideValid = false;
    if (adminOverride) {
        const expiryStr = localStorage.getItem('akii_admin_override_expiry');
        if (expiryStr) {
            try {
                const expiry = new Date(expiryStr);
                overrideValid = expiry > new Date();
            }
            catch (e) {
                console.error('Error parsing admin override expiry', e);
            }
        }
    }
    // In development mode, make admin checks more permissive
    const isDev = import.meta.env.DEV;
    if (isDev) {
        console.log('[Admin Utils] Running in development mode - enabling admin access');
        localStorage.setItem('akii-is-admin', 'true');
        return true;
    }
    return localStorageAdmin || (adminOverride && overrideValid);
};
/**
 * Forces admin status in localStorage for the current session
 * This prevents auth flicker during page navigation
 */
export const forceAdminStatus = (email) => {
    localStorage.setItem('akii-is-admin', 'true');
    if (email) {
        localStorage.setItem('akii-auth-user-email', email);
    }
    // Set a timestamp to track when this was last applied
    localStorage.setItem('akii-admin-force-timestamp', Date.now().toString());
};
/**
 * Check admin status directly in the database
 * This is a server-side check that should be used sparingly
 */
export const checkAdminStatusInDatabase = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First check if we've checked recently to avoid excessive queries
        const lastCheck = parseInt(localStorage.getItem('akii-last-db-admin-check') || '0');
        const now = Date.now();
        // Only check every 60 seconds at most
        if (now - lastCheck < 60000) {
            return getClientSideAdminStatus();
        }
        // Update last check time
        localStorage.setItem('akii-last-db-admin-check', now.toString());
        // Query the database
        const { data, error } = yield supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
        if (error) {
            console.error('Error checking admin status in database:', error);
            return false;
        }
        const isAdmin = (data === null || data === void 0 ? void 0 : data.role) === 'admin';
        // If admin, update localStorage
        if (isAdmin) {
            forceAdminStatus();
        }
        return isAdmin;
    }
    catch (error) {
        console.error('Exception checking admin status in database:', error);
        return false;
    }
});
/**
 * Initialize admin page - should be called at the top of each admin component
 * This ensures that admin state is properly set up before rendering
 */
export const initializeAdminPage = () => {
    const isAdmin = getClientSideAdminStatus();
    if (isAdmin) {
        // Refresh admin status in localStorage
        forceAdminStatus();
        // Log for debugging
        console.log('[Admin] Page initialized with admin access');
    }
    else {
        console.log('[Admin] Page initialized without admin access');
    }
};
/**
 * Utility to force admin status in development mode for testing
 * This should only be used in development
 */
export const enableDevAdminMode = () => {
    if (import.meta.env.DEV) {
        forceAdminStatus('admin@akii.com');
        console.log('[Admin] Development admin mode enabled');
    }
};
