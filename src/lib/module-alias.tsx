/**
 * MODULE ALIASES
 *
 * This module sets up global module aliases to ensure consistent module usage
 * throughout the application, preventing duplicate React instances.
 */
import React from "./react-singleton.tsx";
import ReactDOM from './react-dom-singleton.tsx';
import RouterSingleton from "./react-router-singleton.tsx";

// Skip type checking for window extension
type CustomWindow = Window & {
  __MODULE_ALIASES__?: Record<string, any>;
};

// Set up module aliases
export function setupModuleAliases() {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Cast window to our custom type
  const win = window as CustomWindow;
  
  // Create the module aliases object if it doesn't exist
  if (!win.__MODULE_ALIASES__) {
    win.__MODULE_ALIASES__ = {};
  }
  
  // Set up aliases
  win.__MODULE_ALIASES__['react'] = React;
  win.__MODULE_ALIASES__['react-dom'] = ReactDOM;
  win.__MODULE_ALIASES__['react-router'] = RouterSingleton;
  win.__MODULE_ALIASES__['react-router-dom'] = RouterSingleton;
}

// Verify that the module aliases are set up correctly
export function verifyModuleAliases() {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Cast window to our custom type
  const win = window as CustomWindow;
  
  console.log('Module alias verification:');
  console.log('- React alias:', win.__MODULE_ALIASES__?.['react']);
  console.log('- ReactDOM alias:', win.__MODULE_ALIASES__?.['react-dom']);
  console.log('- ReactRouter alias:', win.__MODULE_ALIASES__?.['react-router']);
  console.log('- ReactRouterDOM alias:', win.__MODULE_ALIASES__?.['react-router-dom']);
}

// Apply aliases immediately
setupModuleAliases();

// Export default object for convenient importing
export default { setupModuleAliases, verifyModuleAliases };

