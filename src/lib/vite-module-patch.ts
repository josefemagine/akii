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

// Types for HMR handling
type ModuleNamespace = Record<string, any>;
type HotAcceptCallback = (mod: ModuleNamespace | ModuleNamespace[]) => void;
type HotAcceptFunction = {
  (): void;
  (cb: HotAcceptCallback): void;
  (dep: string, cb: HotAcceptCallback): void;
  (deps: readonly string[], cb: HotAcceptCallback): void;
};

/**
 * Patches Vite's module system to use our React singleton
 */
export function patchViteModules() {
  if (typeof window === 'undefined') return false;
  
  const win = window as any;
  
  // Check if we're running in a Vite environment
  const isVite = win.__vite_plugin_react_preamble_installed__ ||
                win.__vite__ || 
                win.__VITE_IS_MODERN__ ||
                import.meta.env?.MODE;
  
  if (!isVite) {
    console.log('Not running in Vite environment, skipping Vite module patch');
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
      const wrappedAccept = function(...args: any[]) {
        // Log accepted modules for debugging
        if (args[0]) {
          console.log('HMR accepting modules:', args[0]);
        }
        
        // Call the original accept with all arguments
        return originalAccept.apply(import.meta.hot, args);
      } as HotAcceptFunction;
      
      // Replace the original function
      import.meta.hot.accept = wrappedAccept;
    }
    
    console.log('Vite module system patched successfully');
    return true;
  } catch (error) {
    console.error('Failed to patch Vite module system:', error);
    return false;
  }
}

// Export a function to check if our patch has been applied
export function verifyVitePatch() {
  if (typeof window === 'undefined') return false;
  
  const win = window as any;
  return !!win.__REACT_SINGLETON_REGISTRY__;
} 