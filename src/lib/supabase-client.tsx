import React from "react";
/**
 * SUPABASE CLIENT MODULE
 * This module re-exports the supabase client from the singleton implementation
 * to maintain backward compatibility with existing code.
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
// Import the singleton client instead of creating a new one
import supabase, { auth } from "./supabase-singleton.tsx";
import { isBrowser } from './browser-check.ts';
// Debug helper
export function logSupabaseClientInfo() {
    var _a, _b;
    const supabaseUrl = isBrowser && ((_a = window.ENV) === null || _a === void 0 ? void 0 : _a.VITE_SUPABASE_URL)
        ? window.ENV.VITE_SUPABASE_URL
        : import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = isBrowser && ((_b = window.ENV) === null || _b === void 0 ? void 0 : _b.VITE_SUPABASE_ANON_KEY)
        ? window.ENV.VITE_SUPABASE_ANON_KEY
        : import.meta.env.VITE_SUPABASE_ANON_KEY || '';
interface supabase-clientProps {}

    console.log('Using Supabase singleton client with URL:', supabaseUrl);
    return {
        url: supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        timestamp: new Date().toISOString()
    };
}
// Store user and profile in module variables for caching
let _currentUser = null;
let _currentProfile = null;
// Export the singleton supabase client
export default supabase;
export { auth };
/**
 * Gets the current user from the session
 */
export function getCurrentUser() {
    return _currentUser;
}
/**
 * Gets the current user profile
 */
export function getCurrentProfile() {
    return _currentProfile;
}
/**
 * Signs in a user with email and password using proper REST API auth
 */
export function signIn(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) {
                console.error('Sign in error:', error);
                throw error;
            }
            // Cache the user
            _currentUser = data.user;
            // Fetch profile after sign in
            if (data.user) {
                yield refreshProfile();
            }
            return data;
        }
        catch (err) {
            console.error('Exception in signIn:', err);
            throw err;
        }
    });
}
/**
 * Signs out the current user
 */
export function signOut() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { error } = yield supabase.auth.signOut();
            if (error) {
                console.error('Sign out error:', error);
                throw error;
            }
            // Clear cached user and profile
            _currentUser = null;
            _currentProfile = null;
            return true;
        }
        catch (err) {
            console.error('Exception in signOut:', err);
            throw err;
        }
    });
}
/**
 * Refreshes the user profile
 */
export function refreshProfile(updates) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get the current user
            const { data: { user } } = yield supabase.auth.getUser();
            if (!user) {
                console.log('Cannot refresh profile: No authenticated user');
                return null;
            }
            _currentUser = user;
            let query = supabase
                .from('profiles')
                .select('*');
            if (updates) {
                // If updates provided, update the profile first
                const { data: updateData, error: updateError } = yield supabase
                    .from('profiles')
                    .update(Object.assign(Object.assign({}, updates), { updated_at: new Date().toISOString() }))
                    .eq('id', user.id)
                    .select('*')
                    .single();
                if (updateError) {
                    console.error('Error updating profile:', updateError);
                    // Continue to try to fetch the profile even if update failed
                }
                else if (updateData) {
                    _currentProfile = updateData;
                    return _currentProfile;
                }
            }
            // Fetch the profile
            const { data, error } = yield query
                .eq('id', user.id)
                .single();
            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }
            _currentProfile = data;
            return _currentProfile;
        }
        catch (error) {
            console.error('Exception in refreshProfile:', error);
            return null;
        }
    });
}
/**
 * Updates the user profile
 */
export function updateProfile(updates) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield refreshProfile(updates);
    });
}
/**
 * Sets up a listener for auth state changes
 */
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
}
