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
import { supabase, auth } from "./supabase-singleton.tsx";
import { signIn, signUp, signOut, resetPasswordForEmail as resetPassword, updatePassword, getCurrentSession, getCurrentUser, getUserProfile, ensureUserProfile, updateUserProfile, setUserRole, setUserStatus, verifySupabaseConnection } from './auth-helpers.ts';
import { signInWithOAuth } from './supabase-auth.ts';
interface auth-coreProps {}

// Auth override helpers
export function hasValidAdminOverride(user) {
    if (!user)
        return false;
    let email = null;
    // Handle both User object and email string
    if (typeof user === 'string') {
        email = user;
    }
    else {
        // User object may have undefined email, handle it safely
        email = user.email || null;
    }
    // Check local storage for admin override
    const override = localStorage.getItem('akii_admin_override') === 'true';
    const storedEmail = localStorage.getItem('akii_admin_override_email');
    // Check if override is valid
    return override && storedEmail === email;
}
// Wrapper for verifySupabaseConnection that returns the expected format
export function verifyConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield verifySupabaseConnection();
            // Create simple success or error message
            const message = result.success
                ? `Connection successful (${result.latency}ms)`
                : `Connection failed${result.error ? ': ' + String(result.error) : ''}`;
            return {
                success: result.success,
                message,
                details: {
                    connected: result.success,
                    sessionExists: result.sessionExists || false,
                    hasError: !!result.error
                }
            };
        }
        catch (error) {
            console.error('Error in verifyConnection:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown connection error',
                details: {
                    connected: false,
                    error: true
                }
            };
        }
    });
}
// Storage cleanup
export function clearStoredAuth() {
    // Clear auth-related items from localStorage
    try {
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('akii_admin_override');
        localStorage.removeItem('akii_admin_override_email');
        localStorage.removeItem('akii-auth-token');
        localStorage.removeItem('akii-auth-user');
    }
    catch (e) {
        console.error('Error clearing stored auth:', e);
    }
}
/**
 * Extract user profile data from various potential sources in the User object
 */
export function extractUserProfileData(user) {
    var _a;
    if (!user) {
        return {
            firstName: null,
            lastName: null,
            email: null,
            avatarUrl: null,
            id: null
        };
    }
    // Get user metadata from various possible locations
    const userMeta = user.user_metadata || {};
    const rawMeta = ((_a = user._rawData) === null || _a === void 0 ? void 0 : _a.raw_user_meta_data) ||
        user.raw_user_meta_data || {};
    return {
        firstName: userMeta.first_name || rawMeta.first_name || null,
        lastName: userMeta.last_name || rawMeta.last_name || null,
        email: user.email || null,
        avatarUrl: userMeta.avatar_url || null,
        id: user.id || null
    };
}
/**
 * Helper function to safely get local storage auth data
 */
export function getLocalStorageAuthData() {
    try {
        const fallbackUserStr = localStorage.getItem("akii-auth-fallback-user");
        if (fallbackUserStr) {
            const fallbackData = JSON.parse(fallbackUserStr);
            return {
                firstName: fallbackData.first_name || null,
                lastName: fallbackData.last_name || null,
                email: fallbackData.email || null,
                id: fallbackData.id || null
            };
        }
    }
    catch (e) {
        console.error("Error parsing fallback user data:", e);
    }
    return {
        firstName: null,
        lastName: null,
        email: null,
        id: null
    };
}
// Re-export everything from auth helpers
export { signIn, signUp, signOut, signInWithOAuth, resetPassword, updatePassword, getCurrentSession, getCurrentUser, getUserProfile, ensureUserProfile, updateUserProfile, setUserRole, setUserStatus, verifySupabaseConnection, supabase, auth };
export default {
    extractUserProfileData,
    getLocalStorageAuthData,
    hasValidAdminOverride,
    clearStoredAuth,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    resetPassword,
    updatePassword
};
