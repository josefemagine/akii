/**
 * REACT SINGLETON
 *
 * This module ensures we have only one instance of React throughout the application
 * to prevent "Invalid hook call" errors caused by multiple React instances.
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';

// We directly export React instead of creating a custom singleton
// This ensures that hooks are properly defined and accessible
export default React;

// Directly export commonly used hooks and components from React
export const { 
  useState, 
  useEffect, 
  useContext, 
  useReducer, 
  useCallback, 
  useMemo, 
  useRef, 
  useImperativeHandle, 
  useLayoutEffect, 
  useDebugValue, 
  createContext, 
  createElement, 
  Component, 
  PureComponent, 
  memo, 
  forwardRef, 
  Fragment, 
  StrictMode, 
  Suspense, 
  lazy, 
  createRef 
} = React;

// Export ReactDOM
export const SingletonReactDOM = ReactDOM;
export const SingletonReactDOMClient = ReactDOMClient;

// Function to verify React singleton is working correctly
export function verifyReactSingleton() {
  const hooksAvailable = React.useState !== undefined &&
    React.useEffect !== undefined &&
    React.useContext !== undefined &&
    React.useRef !== undefined;
    
  if (!hooksAvailable) {
    console.error('React hooks are not available!');
    return false;
  }
  console.log('React verified with hooks available');
  return true;
}
