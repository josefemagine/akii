import { jsx as _jsx } from "react/jsx-runtime";
import * as ReactRouter from './react-router-singleton';
import { ReactRouterDOM } from './react-router-singleton';
/**
 * SafeBrowserRouter implementation
 *
 * This component acts as a proxy for BrowserRouter, ensuring we're using
 * our singleton instance of React Router DOM.
 */
export function SafeBrowserRouter(props) {
    return _jsx(ReactRouterDOM.BrowserRouter, Object.assign({}, props));
}
/**
 * This hook verifies that our router patch is working correctly
 */
export function verifyRouterPatch() {
    console.log('Router patch verification:');
    console.log('- ReactRouter singleton:', ReactRouter);
    console.log('- ReactRouterDOM singleton:', ReactRouterDOM);
    console.log('- BrowserRouter implementation:', ReactRouterDOM.BrowserRouter);
}
// Export safer versions of important React Router components
export { Routes, Route, Link, NavLink, Outlet } from './react-router-singleton';
// Export a default component that's safer to use
export default SafeBrowserRouter;
