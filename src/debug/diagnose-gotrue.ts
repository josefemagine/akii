/**
 * GoTrueClient Instance Diagnostics Tool
 * 
 * This module helps identify where multiple GoTrueClient instances are created
 * and provides tools to debug authentication issues.
 */

// Import type definitions we need
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from "../types/supabase.tsx";

// Extend window interface with our debug property
declare global {
  interface Window {
    require: any;
    __GOTRUE_DEBUG?: {
      listInstances: () => any;
      getDiagnostics: () => any;
      checkClient: (client: any) => any;
    };
    __SUPABASE_SINGLETON?: {
      auth?: any;
      client?: SupabaseClient<Database, "public", any>;
      initialized?: boolean;
    };
    __akii_redirects?: {
      href: (path: string) => void;
    };
  }
}

// Track GoTrueClient instances for diagnostic purposes
const clientInstances = new Map();
let instanceCounter = 0;

/**
 * Tracks instances of GoTrueClient to find duplicate instances
 */
export function trackGoTrueInstance(instance: any, source: string) {
  const instanceId = ++instanceCounter;
  
  clientInstances.set(instanceId, {
    instance,
    source,
    createdAt: new Date(),
    stack: new Error().stack
  });
  
  console.warn(`[GoTrueTracker] New GoTrueClient instance #${instanceId} created from source: ${source}`);
  console.warn(`[GoTrueTracker] Current instance count: ${clientInstances.size}`);
  
  return { instanceId };
}

/**
 * Lists all tracked GoTrueClient instances
 */
export function listGoTrueInstances() {
  console.log(`[GoTrueTracker] Found ${clientInstances.size} GoTrueClient instances:`);
  
  clientInstances.forEach((info, id) => {
    console.log(`------------------------------`);
    console.log(`Instance #${id}:`);
    console.log(`Source: ${info.source}`);
    console.log(`Created at: ${info.createdAt.toISOString()}`);
    console.log(`Stack trace:\n${info.stack}`);
  });
  
  return {
    count: clientInstances.size,
    instances: Array.from(clientInstances.entries()).map(([id, info]) => ({
      id,
      source: info.source,
      createdAt: info.createdAt
    }))
  };
}

/**
 * Patches the GoTrueClient constructor to track instance creation
 * Place this in your main entry file to track all instances
 */
export function patchGoTrueClientForDebugging() {
  if (typeof window === 'undefined') return; // Only run in browser
  
  try {
    // Get a reference to the original constructor
    const originalModule = window.require('@supabase/gotrue-js');
    if (!originalModule) return;
    
    const originalGoTrueClient = originalModule.GoTrueClient;
    
    if (!originalGoTrueClient) {
      console.warn('[GoTrueTracker] Could not find GoTrueClient constructor to patch');
      return;
    }
    
    // Create a proxy to intercept constructor calls
    const patchedConstructor = function(...args: any[]) {
      const instance = new originalGoTrueClient(...args);
      
      // Get the source of the creation - simplify stack trace to extract source
      const stack = new Error().stack || '';
      const stackLines = stack.split('\n');
      let source = 'unknown';
      
      // Skip first two lines (Error and this function) and try to find a file path
      for (let i = 2; i < Math.min(stackLines.length, 6); i++) {
        const line = stackLines[i];
        if (line && !line.includes('/node_modules/') && line.includes('/src/')) {
          source = line.trim();
          break;
        }
      }
      
      // Track the instance
      trackGoTrueInstance(instance, source);
      
      return instance;
    };
    
    // Copy prototype and properties
    patchedConstructor.prototype = originalGoTrueClient.prototype;
    Object.defineProperties(patchedConstructor, 
      Object.getOwnPropertyDescriptors(originalGoTrueClient));
    
    // Replace the constructor
    originalModule.GoTrueClient = patchedConstructor;
    
    console.log('[GoTrueTracker] Successfully patched GoTrueClient constructor for debugging');
  } catch (error) {
    console.error('[GoTrueTracker] Failed to patch GoTrueClient:', error);
  }
}

/**
 * Checks if a client is a singleton instance or a duplicate
 */
export function checkGoTrueClientStatus(client: any) {
  if (typeof window === 'undefined') return { isTracked: false };
  
  // Prepare counters
  let foundCount = 0;
  let foundInstance: any = null;
  
  // Check instances
  clientInstances.forEach((info, instance) => {
    if (client === instance) {
      foundCount++;
      foundInstance = { instance, source: info.source };
    }
  });
  
  // Check for global singleton
  const globalSingleton = typeof window !== 'undefined' && 
    window.__SUPABASE_SINGLETON && 
    window.__SUPABASE_SINGLETON.auth;
    
  // Check if it's the global singleton by direct comparison
  let isGlobalSingleton = false;
  if (globalSingleton && foundInstance) {
    isGlobalSingleton = globalSingleton === foundInstance.instance;
  }
  
  return {
    isTracked: foundInstance !== null,
    instanceInfo: foundInstance,
    isSingleton: isGlobalSingleton,
    duplicateCount: foundCount > 1 ? foundCount : 0
  };
}

/**
 * Returns a summary of authentication and client state
 */
export function getAuthDiagnostics() {
  if (typeof window === 'undefined') return { browser: false };
  
  try {
    // Check for supabase global objects
    const globalSingleton = window.__SUPABASE_SINGLETON;
    
    // Get Symbol based singleton
    const globalSymbolKey = Object.getOwnPropertySymbols(window)
      .find(sym => Symbol.keyFor(sym) === '__SUPABASE_GLOBAL_SINGLETON__');
    
    const globalSymbolSingleton = globalSymbolKey ? window[globalSymbolKey] : null;
    
    // Check for local storage tokens
    const hasAccessToken = !!localStorage.getItem('sb-access-token');
    const hasRefreshToken = !!localStorage.getItem('sb-refresh-token');
    const hasAkiiToken = !!localStorage.getItem('akii-auth-token');
    
    return {
      browser: true,
      trackedInstances: clientInstances.size,
      globalSingleton: {
        exists: !!globalSingleton,
        hasAuth: !!globalSingleton?.auth,
        hasClient: !!globalSingleton?.client,
        initialized: !!globalSingleton?.initialized
      },
      symbolSingleton: {
        exists: !!globalSymbolSingleton,
        hasAuth: !!globalSymbolSingleton?.auth,
        hasClient: !!globalSymbolSingleton?.client,
        initialized: !!globalSymbolSingleton?.initialized
      },
      tokens: {
        hasAccessToken,
        hasRefreshToken,
        hasAkiiToken
      }
    };
  } catch (error) {
    return {
      browser: true,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    };
  }
}

/**
 * Helper method to add to init scripts
 */
export function initGoTrueDebugging() {
  // Only activate debugging in development
  if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
    console.log('[GoTrueTracker] Initializing GoTrueClient tracking');
    
    // Patch the constructor
    window.setTimeout(() => {
      patchGoTrueClientForDebugging();
      
      // Print diagnostics after a short delay
      window.setTimeout(() => {
        const diagnostics = getAuthDiagnostics();
        console.log('[GoTrueTracker] Auth System Diagnostics:', diagnostics);
      }, 5000);
    }, 0);
    
    // Export diagnostics to window for console access
    window.__GOTRUE_DEBUG = {
      listInstances: listGoTrueInstances,
      getDiagnostics: getAuthDiagnostics,
      checkClient: checkGoTrueClientStatus
    };
  }
} 