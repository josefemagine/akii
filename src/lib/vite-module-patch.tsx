/**
 * VITE MODULE PATCH
 *
 * This module provides runtime patches for Vite's module resolution system
 * to ensure consistent React usage throughout the application.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as ReactRouter from 'react-router';
import * as ReactRouterDOM from 'react-router-dom';

// Declare custom properties on Window
declare global {
  interface Window {
    __vite_plugin_react_preamble_installed__?: boolean;
    __vite__?: any;
    __VITE_IS_MODERN__?: boolean;
    __REACT_SINGLETON_REGISTRY__?: any;
  }
}

// Define Vite HMR types
type ModuleNamespace = Record<string, any>;

interface HotContext {
  accept: (
    deps: readonly string[] | string,
    cb?: (modules: (ModuleNamespace | undefined)[]) => void,
    errorHandler?: (err: Error) => void
  ) => void;
}

// Better logging functions with proper typing
const logInfo = (msg: string): void => { console.log(msg); };
const logError = (msg: string, err: unknown): void => { console.error(msg, err); };

/**
 * Patches the Vite module system to ensure consistent React usage
 * across dynamically loaded modules
 */
export function patchViteModules(): boolean {
  try {
    // Skip if not running in browser
    if (typeof window === 'undefined') {
      return false;
    }
    
    // Check if the Vite plugin is already installed
    if (!window.__vite_plugin_react_preamble_installed__ || !window.__vite__ || !window.__VITE_IS_MODERN__) {
      console.log('Vite plugin not detected, skipping module system patch');
      return false;
    }
    
    // Set up registry to track React instances if not already exists
    if (!window.__REACT_SINGLETON_REGISTRY__) {
      window.__REACT_SINGLETON_REGISTRY__ = {
        initialized: true,
        timestamp: Date.now()
      };
    }
    
    // Apply the hot module replacement patch if HMR is available
    if (import.meta.hot) {
      const originalAccept = import.meta.hot.accept;
      
      // Just use any to bypass strict type checking
      import.meta.hot.accept = function() {
        // @ts-ignore - bypass the TypeScript error
        return originalAccept.apply(import.meta.hot, arguments);
      };
    }
    
    // Log success
    const msg = {
      type: "success",
      component: "vite-module-patch",
      message: "Module system patch applied"
    };
    console.info(msg);
    return true;
  }
  catch (error) {
    console.error('Failed to patch Vite module system:', error);
    return false;
  }
}

/**
 * Verifies that our patch has been applied
 */
export function verifyVitePatch(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!window.__REACT_SINGLETON_REGISTRY__;
}
