/**
 * REACT ROUTER SINGLETON
 * 
 * This module ensures we have a single instance of React Router across the application.
 * This helps prevent "Invalid hook call" errors caused by multiple React Router instances.
 */

// Import directly from the module to get the singleton instance
import * as ReactRouter from 'react-router';
import * as ReactRouterDOM from 'react-router-dom';

// Re-export all the named exports from react-router
export const {
  createRoutesFromChildren,
  generatePath,
  matchPath,
  matchRoutes,
  Navigate,
  Outlet,
  Route,
  Routes,
  useHref,
  useInRouterContext,
  useLocation,
  useMatch,
  useNavigate,
  useNavigationType,
  useOutlet,
  useParams,
  useResolvedPath,
  useRoutes,
} = ReactRouter;

// Re-export all the named exports from react-router-dom
export const {
  BrowserRouter,
  HashRouter,
  Link,
  NavLink,
  createSearchParams,
  useSearchParams,
} = ReactRouterDOM;

// Export the modules as a whole
export { ReactRouter, ReactRouterDOM };

// Export types
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

// Default export the singleton instance
export default ReactRouter; 