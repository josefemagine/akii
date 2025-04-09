/**
 * REACT DOM SINGLETON
 *
 * This module ensures we have a single instance of ReactDOM across the application.
 * This helps prevent "Invalid hook call" errors caused by multiple React instances.
 */
// Import ReactDOM from the original module
import * as ReactDOMOriginal from 'react-dom';
import * as ReactDOMClientOriginal from 'react-dom/client';
// Create a singleton object to export
const ReactDOMSingleton = Object.assign(Object.assign({}, ReactDOMOriginal), { 
    // Re-export client methods
    createRoot: ReactDOMClientOriginal.createRoot, hydrateRoot: ReactDOMClientOriginal.hydrateRoot });
// Export verification method
export function verifyReactDOMSingleton() {
    console.log('ReactDOM singleton verification:');
    console.log('- ReactDOM singleton:', ReactDOMSingleton);
    console.log('- createRoot implementation:', ReactDOMSingleton.createRoot);
}
// Export client methods
export const { createRoot, hydrateRoot } = ReactDOMClientOriginal;
// Export individual methods
export const { createPortal, findDOMNode, flushSync, hydrate, render, unmountComponentAtNode, unstable_batchedUpdates, version, } = ReactDOMOriginal;
// Default export the singleton instance
export default ReactDOMSingleton;
