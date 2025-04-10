/**
 * MODULE ALIASES
 * 
 * This module sets up global module aliases to ensure consistent module usage
 * throughout the application, preventing duplicate React instances.
 */

import React from "./react-singleton.ts";
import ReactDOM from './react-dom-singleton.ts';
import * as ReactRouter from "./react-router-singleton.ts";
import * as ReactRouterDOM from "./react-router-singleton.ts";

declare global {
  interface Window {
    __MODULE_ALIASES__: Record<string, any>;
  }
}

// Set up module aliases
export function setupModuleAliases() {
  if (typeof window === 'undefined') return;
  
  // Create the module aliases object if it doesn't exist
  if (!window.__MODULE_ALIASES__) {
    window.__MODULE_ALIASES__ = {};
  }
  
  // Set up aliases
  window.__MODULE_ALIASES__['react'] = React;
  window.__MODULE_ALIASES__['react-dom'] = ReactDOM;
  window.__MODULE_ALIASES__['react-router'] = ReactRouter;
  window.__MODULE_ALIASES__['react-router-dom'] = ReactRouterDOM;
}

// Verify that the module aliases are set up correctly
export function verifyModuleAliases() {
  if (typeof window === 'undefined') return;
  
  console.log('Module alias verification:');
  console.log('- React alias:', window.__MODULE_ALIASES__?.['react']);
  console.log('- ReactDOM alias:', window.__MODULE_ALIASES__?.['react-dom']);
  console.log('- ReactRouter alias:', window.__MODULE_ALIASES__?.['react-router']);
  console.log('- ReactRouterDOM alias:', window.__MODULE_ALIASES__?.['react-router-dom']);
}

// Apply aliases immediately
setupModuleAliases();

// Export default object for convenient importing
export default { setupModuleAliases, verifyModuleAliases }; 