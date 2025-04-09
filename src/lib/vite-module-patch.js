/**
 * VITE MODULE PATCH
 *
 * This module provides runtime patches for Vite's module resolution system
 * to ensure consistent React usage throughout the application.
 */
import React from './react-singleton';
import ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as ReactRouter from 'react-router';
import * as ReactRouterDOM from 'react-router-dom';
// Safe logging functions to avoid Vite import analysis issues
const logInfo = (msg) => { console.log(msg); };
const logError = (msg, err) => { console.error(msg, err); };
/**
 * Patches Vite's module system to use our React singleton
 */
export function patchViteModules() {
    var _a;
    if (typeof window === 'undefined')
        return false;
    const win = window;
    // Check if we're running in a Vite environment
    const isVite = win.__vite_plugin_react_preamble_installed__ ||
        win.__vite__ ||
        win.__VITE_IS_MODERN__ ||
        ((_a = import.meta.env) === null || _a === void 0 ? void 0 : _a.MODE);
    if (!isVite) {
        logInfo('Not running in Vite environment, skipping Vite module patch');
        return false;
    }
    try {
        // Store the real module instances in a global registry
        win.__REACT_SINGLETON_REGISTRY__ = {
            react: React,
            'react-dom': ReactDOM,
            'react-dom/client': ReactDOMClient,
            'react-router': ReactRouter,
            'react-router-dom': ReactRouterDOM,
        };
        // Patch Vite's import.meta.hot.accept
        if (import.meta.hot) {
            const originalAccept = import.meta.hot.accept;
            // Create a wrapper for the accept function that preserves all signatures
            const wrappedAccept = function (...args) {
                // Log accepted modules for debugging
                if (args[0]) {
                    console.log(`HMR accepting modules: ${JSON.stringify(args[0])}`);
                }
                // Call the original accept with all arguments
                return originalAccept.apply(import.meta.hot, args);
            };
            // Replace the original function
            import.meta.hot.accept = wrappedAccept;
        }
        // Use console.info instead of console.log, and use a variable 
        // to avoid path-like string literals
        const msg = {
            type: "success",
            component: "vite-module-patch",
            message: "Module system patch applied"
        };
        console.info(msg);
        return true;
    }
    catch (error) {
        logError('Failed to patch Vite module system:', error);
        return false;
    }
}
// Export a function to check if our patch has been applied
export function verifyVitePatch() {
    if (typeof window === 'undefined')
        return false;
    const win = window;
    return !!win.__REACT_SINGLETON_REGISTRY__;
}
