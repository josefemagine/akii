/**
 * Dashboard Health Check Utilities
 *
 * This module provides functions to diagnose and fix common issues with the
 * dashboard. It checks local storage, authentication state, and network connectivity.
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
/**
 * Runs a comprehensive health check on the dashboard
 */
export function runDashboardHealthCheck() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('[HealthCheck] Starting dashboard health check');
        const results = {
            localStorage: checkLocalStorage(),
            sessionStorage: checkSessionStorage(),
            authState: checkAuthState(),
            connectivity: yield checkConnectivity(),
        };
        console.log('[HealthCheck] Health check completed', results);
        return results;
    });
}
/**
 * Applies common fixes to resolve dashboard issues
 */
export function fixCommonDashboardIssues() {
    console.log('[HealthCheck] Applying common fixes');
    // Fix local storage issues
    try {
        fixLocalStorage();
        console.log('[HealthCheck] Fixed localStorage issues');
    }
    catch (error) {
        console.error('[HealthCheck] Error fixing localStorage:', error);
    }
    // Fix session storage issues
    try {
        fixSessionStorage();
        console.log('[HealthCheck] Fixed sessionStorage issues');
    }
    catch (error) {
        console.error('[HealthCheck] Error fixing sessionStorage:', error);
    }
    // Fix auth state issues
    try {
        fixAuthState();
        console.log('[HealthCheck] Fixed auth state issues');
    }
    catch (error) {
        console.error('[HealthCheck] Error fixing auth state:', error);
    }
    console.log('[HealthCheck] Completed applying fixes');
}
/**
 * Checks local storage for integrity and availability
 */
function checkLocalStorage() {
    try {
        // Test if localStorage is available
        localStorage.setItem('healthcheck-test', 'test');
        localStorage.removeItem('healthcheck-test');
        // Check for critical items
        const hasAuthToken = !!localStorage.getItem('supabase.auth.token');
        const hasRefreshToken = !!localStorage.getItem('akii-refresh-token');
        if (!hasAuthToken && !hasRefreshToken) {
            return {
                status: 'unhealthy',
                message: 'No authentication tokens found in localStorage'
            };
        }
        return {
            status: 'healthy',
            message: 'localStorage is available and contains authentication data'
        };
    }
    catch (error) {
        return {
            status: 'unhealthy',
            message: `localStorage error: ${String(error)}`,
            details: error
        };
    }
}
/**
 * Checks session storage for integrity and availability
 */
function checkSessionStorage() {
    try {
        // Test if sessionStorage is available
        sessionStorage.setItem('healthcheck-test', 'test');
        sessionStorage.removeItem('healthcheck-test');
        // Check for critical items
        const hasUserProfile = !!sessionStorage.getItem('akii-user-profile');
        const hasRedirectCount = !!sessionStorage.getItem('akii-redirect-count');
        if (!hasUserProfile) {
            return {
                status: 'unhealthy',
                message: 'User profile data not found in sessionStorage'
            };
        }
        return {
            status: 'healthy',
            message: 'sessionStorage is available and contains user data'
        };
    }
    catch (error) {
        return {
            status: 'unhealthy',
            message: `sessionStorage error: ${String(error)}`,
            details: error
        };
    }
}
/**
 * Checks the current authentication state
 */
function checkAuthState() {
    try {
        const hasAuthToken = !!localStorage.getItem('supabase.auth.token');
        const hasProfile = !!sessionStorage.getItem('akii-user-profile');
        const isAdminStr = localStorage.getItem('akii-is-admin');
        const isAdmin = isAdminStr === 'true';
        if (!hasAuthToken) {
            return {
                status: 'unhealthy',
                message: 'No active auth token found'
            };
        }
        if (!hasProfile) {
            return {
                status: 'unhealthy',
                message: 'Authenticated but no user profile found'
            };
        }
        if (!isAdmin) {
            return {
                status: 'unhealthy',
                message: 'User is not an admin (may be expected)'
            };
        }
        return {
            status: 'healthy',
            message: 'Authentication state is valid'
        };
    }
    catch (error) {
        return {
            status: 'unhealthy',
            message: `Auth state error: ${String(error)}`,
            details: error
        };
    }
}
/**
 * Checks network connectivity by making a simple fetch to the API
 */
function checkConnectivity() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('/api/health', {
                method: 'GET',
                headers: { 'Cache-Control': 'no-cache' }
            });
            if (response.ok) {
                return {
                    status: 'healthy',
                    message: 'API connectivity is working'
                };
            }
            else {
                return {
                    status: 'unhealthy',
                    message: `API returned status ${response.status}`
                };
            }
        }
        catch (error) {
            return {
                status: 'unhealthy',
                message: `Network error: ${String(error)}`,
                details: error
            };
        }
    });
}
/**
 * Fixes common localStorage issues
 */
function fixLocalStorage() {
    // Ensure we're not clearing critical data unnecessarily
    const authToken = localStorage.getItem('supabase.auth.token');
    const refreshToken = localStorage.getItem('akii-refresh-token');
    const isAdmin = localStorage.getItem('akii-is-admin');
    const userId = localStorage.getItem('akii-user-id');
    // Clear all localStorage items related to authentication and app state
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('akii-') || key.startsWith('supabase.')) {
            localStorage.removeItem(key);
        }
    });
    // Restore critical items we want to keep
    if (authToken)
        localStorage.setItem('supabase.auth.token', authToken);
    if (refreshToken)
        localStorage.setItem('akii-refresh-token', refreshToken);
    if (isAdmin)
        localStorage.setItem('akii-is-admin', isAdmin);
    if (userId)
        localStorage.setItem('akii-user-id', userId);
    // Set a timestamp for the last refresh
    localStorage.setItem('akii-auth-last-refresh', Date.now().toString());
    // Force admin status for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
        localStorage.setItem('akii-is-admin', 'true');
    }
}
/**
 * Fixes common sessionStorage issues
 */
function fixSessionStorage() {
    // Store current profile data if it exists
    const userProfile = sessionStorage.getItem('akii-user-profile');
    // Clear redirect counts and other problematic items
    sessionStorage.removeItem('akii-redirect-count');
    sessionStorage.removeItem('akii-redirect-timestamp');
    sessionStorage.removeItem('akii-auth-error');
    // Restore critical user data
    if (userProfile) {
        sessionStorage.setItem('akii-user-profile', userProfile);
    }
}
/**
 * Fixes common auth state issues
 */
function fixAuthState() {
    // Set auth refresh timestamp
    localStorage.setItem('akii-auth-last-refresh', Date.now().toString());
    // In development, force admin status for debugging
    if (process.env.NODE_ENV === 'development') {
        localStorage.setItem('akii-is-admin', 'true');
    }
    // Clear any auth error states
    sessionStorage.removeItem('akii-auth-error');
    sessionStorage.removeItem('akii-auth-retry-count');
}
