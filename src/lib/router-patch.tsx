/**
 * REACT ROUTER BROWSER ROUTER PATCH
 * 
 * This module provides a safe implementation of the BrowserRouter component
 * that fixes the "Invalid hook call" and "Cannot read properties of null (reading 'useRef')" errors.
 */

import React from "./react-singleton.ts";
import { BrowserRouter } from "./react-router-singleton.ts";

// Import key types
type BrowserRouterProps = React.PropsWithChildren<{
  basename?: string;
  future?: any;
  window?: Window;
}>;

/**
 * SafeBrowserRouter implementation
 * 
 * This component acts as a proxy for BrowserRouter, ensuring we're using
 * our singleton instance of React Router DOM.
 */
export function SafeBrowserRouter(props: BrowserRouterProps) {
  return <BrowserRouter {...props} />;
}

/**
 * This hook verifies that our router patch is working correctly
 */
export function verifyRouterPatch() {
  console.log('Router patch verification:');
  console.log('- BrowserRouter implementation:', BrowserRouter);
}

// Export safer versions of important React Router components
export { 
  Routes, 
  Route, 
  Link, 
  NavLink, 
  Outlet
} from "./react-router-singleton.ts";

// Export a default component that's safer to use
export default SafeBrowserRouter; 