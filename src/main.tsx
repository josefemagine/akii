import React, { StrictMode } from "./lib/react-singleton";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "./lib/react-router-singleton";
import App from "./App";
import "./index.css";
import { TempoDevtools } from "tempo-devtools";
import { supabase } from '@/lib/supabase-singleton';
import { Analytics } from "@vercel/analytics/react";
import { verifyReactSingleton } from "./lib/react-singleton";
import { patchTempoDevtools, verifyTempoPatch } from './lib/patches/tempo-devtools-react-patch';
import { setupModuleAliases, verifyModuleAliases } from './lib/module-alias';
import { patchViteModules, verifyVitePatch } from './lib/vite-module-patch';
import { verifyRouterPatch } from "./lib/router-patch";

// Apply Vite module patch
patchViteModules();
verifyVitePatch();

// Set up module aliases to ensure consistent React usage
setupModuleAliases();
verifyModuleAliases();

// Verify React singleton is working
verifyReactSingleton();

// Verify React Router singleton is working
// NOTE: Removed verifyReactRouterSingleton as it doesn't exist
verifyRouterPatch();

// Initialize Tempo Devtools
TempoDevtools.init();

// Patch Tempo Devtools to use our React singleton
setTimeout(() => {
  patchTempoDevtools();
  verifyTempoPatch();
}, 100);

// Debug supabase in dev mode
if (import.meta.env.DEV) {
  console.log("[Main] Enabling Supabase debugging in development mode");
  (window as any).supabase = supabase;
}

// Handle redirects from the fallback page
const processRedirect = () => {
  const params = new URLSearchParams(window.location.search);
  const redirectPath = params.get('redirect');
  
  if (redirectPath) {
    // Remove the redirect parameter
    params.delete('redirect');
    
    // Get the remaining query string
    const newSearch = params.toString();
    const searchStr = newSearch ? `?${newSearch}` : '';
    
    // Create the new URL
    const newUrl = `${window.location.origin}${redirectPath}${searchStr}${window.location.hash}`;
    
    // Replace the current URL without reloading
    window.history.replaceState(null, '', newUrl);
    
    console.log(`[Router] Redirected to: ${newUrl}`);
  }
};

// Process redirects on initial load
processRedirect();

// Mount the application
createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <App />
      <Analytics />
    </BrowserRouter>
  </StrictMode>
);
