import React from "react";
interface browser-checkProps {}

/**
 * Browser environment detection utility
 * Used to safely check if code is running in a browser environment
 */
/**
 * Checks if the current environment is a browser
 * @returns boolean indicating if code is running in a browser
 */
export const isBrowser = typeof window !== 'undefined';
/**
 * Checks if the current environment supports localStorage
 * @returns boolean indicating if localStorage is available
 */
export function hasLocalStorage() {
    if (!isBrowser)
        return false;
    try {
        const testKey = "__storage_test__";
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    }
    catch (e) {
        return false;
    }
}
/**
 * Safely accesses localStorage
 * @returns localStorage object or null if not available
 */
export const safeLocalStorage = {
    getItem: (key) => {
        if (!isBrowser)
            return null;
        try {
            return localStorage.getItem(key);
        }
        catch (e) {
            console.error('Error accessing localStorage:', e);
            return null;
        }
    },
    setItem: (key, value) => {
        if (!isBrowser)
            return false;
        try {
            localStorage.setItem(key, value);
            return true;
        }
        catch (e) {
            console.error('Error setting localStorage:', e);
            return false;
        }
    },
    removeItem: (key) => {
        if (!isBrowser)
            return false;
        try {
            localStorage.removeItem(key);
            return true;
        }
        catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },
};
/**
 * Safely accesses sessionStorage
 * @returns sessionStorage object or null if not available
 */
export function safeSessionStorage() {
    if (!isBrowser)
        return null;
    try {
        const testKey = "__storage_test__";
        sessionStorage.setItem(testKey, testKey);
        sessionStorage.removeItem(testKey);
        return sessionStorage;
    }
    catch (e) {
        return null;
    }
}
// Utility object for safe storage operations
export const safeStorage = {
    getItem: (key) => {
        if (isBrowser) {
            try {
                return localStorage.getItem(key);
            }
            catch (error) {
                console.error("Error accessing localStorage:", error);
            }
        }
        return null;
    },
    setItem: (key, value) => {
        if (isBrowser) {
            try {
                localStorage.setItem(key, value);
            }
            catch (error) {
                console.error("Error setting localStorage:", error);
            }
        }
    },
    removeItem: (key) => {
        if (isBrowser) {
            try {
                localStorage.removeItem(key);
            }
            catch (error) {
                console.error("Error removing from localStorage:", error);
            }
        }
    },
};
