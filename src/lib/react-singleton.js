/**
 * REACT SINGLETON
 *
 * This module ensures we have only one instance of React throughout the application
 * to prevent "Invalid hook call" errors caused by multiple React instances.
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as ReactRouter from 'react-router';
import * as ReactRouterDOM from 'react-router-dom';
// Symbol for the global React singleton
const REACT_INSTANCE = Symbol.for('app.react.instance');
const REACT_DOM_INSTANCE = Symbol.for('app.react-dom.instance');
const REACT_DOM_CLIENT_INSTANCE = Symbol.for('app.react-dom-client.instance');
const REACT_ROUTER_INSTANCE = Symbol.for('app.react-router.instance');
const REACT_ROUTER_DOM_INSTANCE = Symbol.for('app.react-router-dom.instance');
// Get the global object
const global = globalThis;
// Initialize or get the React singleton
if (!global[REACT_INSTANCE]) {
    global[REACT_INSTANCE] = React;
    console.log('React singleton initialized');
}
// Initialize or get the ReactDOM singleton
if (!global[REACT_DOM_INSTANCE]) {
    global[REACT_DOM_INSTANCE] = ReactDOM;
    console.log('ReactDOM singleton initialized');
}
// Initialize or get the ReactDOMClient singleton
if (!global[REACT_DOM_CLIENT_INSTANCE]) {
    global[REACT_DOM_CLIENT_INSTANCE] = ReactDOMClient;
    console.log('ReactDOMClient singleton initialized');
}
// Initialize or get the ReactRouter singleton
if (!global[REACT_ROUTER_INSTANCE]) {
    global[REACT_ROUTER_INSTANCE] = ReactRouter;
    console.log('ReactRouter singleton initialized');
}
// Initialize or get the ReactRouterDOM singleton
if (!global[REACT_ROUTER_DOM_INSTANCE]) {
    global[REACT_ROUTER_DOM_INSTANCE] = ReactRouterDOM;
    console.log('ReactRouterDOM singleton initialized');
}
// Export the singleton instances
export const SingletonReact = global[REACT_INSTANCE];
export const SingletonReactDOM = global[REACT_DOM_INSTANCE];
export const SingletonReactDOMClient = global[REACT_DOM_CLIENT_INSTANCE];
export const SingletonReactRouter = global[REACT_ROUTER_INSTANCE];
export const SingletonReactRouterDOM = global[REACT_ROUTER_DOM_INSTANCE];
// Function to verify React singleton is working correctly
export function verifyReactSingleton() {
    const singletonHooks = SingletonReact.useState !== undefined &&
        SingletonReact.useEffect !== undefined &&
        SingletonReact.useContext !== undefined &&
        SingletonReact.useRef !== undefined;
    if (!singletonHooks) {
        console.error('React singleton hooks are not available!');
        return false;
    }
    console.log('React singleton verified with hooks available');
    return true;
}
// Re-export all React items from the singleton
export default SingletonReact;
// Commonly used hooks and components
export const { useState, useEffect, useContext, useReducer, useCallback, useMemo, useRef, useImperativeHandle, useLayoutEffect, useDebugValue, createContext, createElement, Component, PureComponent, memo, forwardRef, Fragment, StrictMode, Suspense, lazy, createRef } = SingletonReact;
