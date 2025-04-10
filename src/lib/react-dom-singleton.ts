/**
 * REACT DOM SINGLETON
 * 
 * This module ensures we have a single instance of ReactDOM across the application.
 * This helps prevent "Invalid hook call" errors caused by multiple React instances.
 */

// Import ReactDOM from the original module
import * as ReactDOMOriginal from 'react-dom';
import * as ReactDOMClientOriginal from 'react-dom/client';

// Simply re-export ReactDOM directly
export default ReactDOMOriginal;

// Export client methods directly
export const { createRoot, hydrateRoot } = ReactDOMClientOriginal;

// Export individual methods
export const {
  createPortal,
  findDOMNode,
  flushSync,
  hydrate,
  render,
  unmountComponentAtNode,
  unstable_batchedUpdates,
  version,
} = ReactDOMOriginal;

// Export verification method
export function verifyReactDOMSingleton() {
  console.log('ReactDOM singleton verification:');
  console.log('- ReactDOM methods available:', {
    render: typeof ReactDOMOriginal.render === 'function',
    createPortal: typeof ReactDOMOriginal.createPortal === 'function',
    createRoot: typeof ReactDOMClientOriginal.createRoot === 'function'
  });
} 