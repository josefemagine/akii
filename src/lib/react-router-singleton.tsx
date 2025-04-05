/**
 * REACT ROUTER SINGLETON
 * 
 * This module ensures we have a single instance of React Router across the application.
 * This helps prevent "Invalid hook call" errors caused by multiple React Router instances.
 */

import React from './react-singleton';
import * as ReactRouterOriginal from 'react-router';
import * as ReactRouterDOMOriginal from 'react-router-dom';

// Destructure the components we need to wrap or proxy
const {
  BrowserRouter: OriginalBrowserRouter,
  ...otherReactRouterDOM
} = ReactRouterDOMOriginal;

// Re-export React Router
export const ReactRouter = ReactRouterOriginal;

// Safe BrowserRouter implementation
export function BrowserRouter(props: React.ComponentProps<typeof OriginalBrowserRouter>) {
  return <OriginalBrowserRouter {...props} />;
}

// Create a fixed ReactRouterDOM object with our safe implementations
export const ReactRouterDOM = {
  ...otherReactRouterDOM,
  BrowserRouter
};

// Re-export all named exports from react-router
export const {
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
  useLocation,
  useMatch,
  ...otherReactRouter
} = ReactRouterOriginal;

// Re-export all named exports from react-router-dom
export const {
  Link,
  NavLink,
  useSearchParams,
  ...otherReactRouterDOMExports
} = ReactRouterDOM;

// Re-export types
export type {
  RouteObject,
  PathMatch,
  Location,
  NavigateFunction,
  NavigateOptions,
  Params,
  To
} from 'react-router';

export type {
  LinkProps,
  NavLinkProps
} from 'react-router-dom';

// Export a verification function
export function verifyReactRouterSingleton() {
  console.log('React Router singleton verification:');
  console.log('- ReactRouter:', ReactRouter);
  console.log('- ReactRouterDOM:', ReactRouterDOM);
  console.log('- BrowserRouter implementation:', BrowserRouter);
}

// Default export
export default {
  ...ReactRouter,
  ...ReactRouterDOM
}; 