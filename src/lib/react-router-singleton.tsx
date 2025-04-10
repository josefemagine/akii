/**
 * REACT ROUTER SINGLETON
 * 
 * This module ensures we have a single instance of React Router across the application.
 * This helps prevent "Invalid hook call" errors caused by multiple React Router instances.
 */

import React from "./react-singleton.ts";
import * as ReactRouterOriginal from 'react-router';
import * as ReactRouterDOMOriginal from 'react-router-dom';

// Simply re-export all exports from react-router and react-router-dom
// This ensures that we're using a single instance throughout the application

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
} = ReactRouterOriginal;

// Re-export all named exports from react-router-dom
export const {
  BrowserRouter,
  Link,
  NavLink,
  useSearchParams,
} = ReactRouterDOMOriginal;

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

// Default export combining both libraries
export default {
  ...ReactRouterOriginal,
  ...ReactRouterDOMOriginal
}; 