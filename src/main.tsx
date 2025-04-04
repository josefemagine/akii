import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { TempoDevtools } from "tempo-devtools";
import { supabase } from '@/lib/supabase-singleton';
import { Analytics } from "@vercel/analytics/react";

// Initialize Tempo Devtools
TempoDevtools.init();

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
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <App />
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>
);
