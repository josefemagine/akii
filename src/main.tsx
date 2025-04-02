import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { TempoDevtools } from "tempo-devtools";
import { supabase } from '@/lib/supabase-singleton';

// Initialize Tempo Devtools
TempoDevtools.init();

// Debug supabase in dev mode
if (import.meta.env.DEV) {
  console.log("[Main] Enabling Supabase debugging in development mode");
  (window as any).supabase = supabase;
}

// Mount the application
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
