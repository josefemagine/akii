import React from "react";
/**
 * Supabase Client Duplicate Detector
 *
 * This module helps detect and report duplicate Supabase client instances
 * across the application, which can cause authentication issues.
 */
import { supabase } from "./supabase.tsx";
interface SUPABASE_SINGLETON_KEYProps {}

/**
 * Check if a given client instance matches the singleton instance
 */
export function checkClientInstance(client, source) {
    if (!client) {
        return { source, isMatch: false };
    }
    // Simple identity comparison to check if it's the same instance
    const isSame = client === supabase;
    return { source, isMatch: isSame };
}
/**
 * Check all places where client instances might be stored
 */
export function detectDuplicateClients() {
    var _a, _b;
    const clients = [];
    const globalObj = typeof window !== 'undefined' ? window :
        typeof globalThis !== 'undefined' ? globalThis : {};
    // Check window properties
    if (typeof window !== 'undefined') {
        if (window.__supabaseClient) {
            clients.push(checkClientInstance(window.__supabaseClient, 'window.__supabaseClient'));
        }
        if (window.__supabase) {
            clients.push(checkClientInstance(window.__supabase, 'window.__supabase'));
        }
        if ((_a = window.__SUPABASE_SINGLETON) === null || _a === void 0 ? void 0 : _a.client) {
            clients.push(checkClientInstance(window.__SUPABASE_SINGLETON.client, 'window.__SUPABASE_SINGLETON.client'));
        }
    }
    // Check localStorage for auth info
    const checkLocalStorageKeys = (): void => {
        try {
            const authKeys = Object.keys(localStorage).filter(key => key.includes('supabase') ||
                key.includes('sb-'));
            return {
                hasAuthData: authKeys.length > 0,
                keys: authKeys
            };
        }
        catch (e) {
            console.error('Error checking localStorage:', e);
            return { hasAuthData: false, keys: [] };
        }
    };
    const localStorageInfo = checkLocalStorageKeys();
    // Check for Symbol singleton
    const SUPABASE_SINGLETON_KEY = Symbol.for('__SUPABASE_GLOBAL_SINGLETON__');
    if ((_b = globalObj[SUPABASE_SINGLETON_KEY]) === null || _b === void 0 ? void 0 : _b.client) {
        clients.push(checkClientInstance(globalObj[SUPABASE_SINGLETON_KEY].client, 'Symbol.for(__SUPABASE_GLOBAL_SINGLETON__).client'));
    }
    // Filter matches and non-matches
    const matches = clients.filter(client => client.isMatch);
    const nonMatches = clients.filter(client => !client.isMatch);
    // If any client doesn't match the singleton, we have duplicates
    const hasDuplicates = nonMatches.length > 0;
    return {
        hasDuplicates,
        matches,
        nonMatches
    };
}
/**
 * Run a full diagnostic of Supabase client instances
 */
export function runClientDiagnostic() {
    console.log('🔍 Running Supabase client diagnostic...');
    // Check for duplicates
    const duplicateCheck = detectDuplicateClients();
    if (duplicateCheck.hasDuplicates) {
        console.warn('⚠️ Duplicate Supabase clients detected:');
        console.table(duplicateCheck.nonMatches);
        console.log('✅ Matching Supabase clients:');
        console.table(duplicateCheck.matches);
    }
    else if (duplicateCheck.matches.length > 0) {
        console.log('✅ All Supabase clients match the singleton instance:');
        console.table(duplicateCheck.matches);
    }
    else {
        console.log('ℹ️ No Supabase client instances found other than the singleton.');
    }
    // Check localStorage for auth data
    try {
        const authKeys = Object.keys(localStorage).filter(key => key.includes('supabase') ||
            key.includes('sb-'));
        if (authKeys.length > 0) {
            console.log(`ℹ️ Found ${authKeys.length} auth-related localStorage keys:`, authKeys);
        }
        else {
            console.log('ℹ️ No auth-related localStorage keys found.');
        }
    }
    catch (e) {
        console.error('Error checking localStorage:', e);
    }
    // Return diagnostic result for use in components
    return Object.assign(Object.assign({}, duplicateCheck), { clientExists: !!supabase, hasSingletonClient: duplicateCheck.matches.length > 0 });
}
