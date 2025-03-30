import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { supabase } from "./lib/supabase";
import "./index.css";

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize environment
function initializeEnvironment() {
  console.log("Environment:", import.meta.env.MODE);
  console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
  // Only log that the key exists, not the actual key for security
  console.log(
    "VITE_SUPABASE_ANON_KEY exists:",
    !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  );

  // Clear any stuck auth states on startup
  try {
    // Check for stuck auth-in-progress state
    if (localStorage.getItem("auth-in-progress") === "true") {
      const timeElapsed =
        Date.now() -
        parseInt(localStorage.getItem("auth-in-progress-time") || "0");
      if (timeElapsed > 60000) {
        // 1 minute
        console.log("Clearing stuck auth-in-progress state on startup");
        localStorage.removeItem("auth-in-progress");
        localStorage.removeItem("auth-in-progress-time");
      }
    }

    // Check for stuck login-attempt state
    if (localStorage.getItem("login-attempt") === "true") {
      const timeElapsed =
        Date.now() -
        parseInt(localStorage.getItem("login-attempt-time") || "0");
      if (timeElapsed > 60000) {
        // 1 minute
        console.log("Clearing stuck login-attempt state on startup");
        localStorage.removeItem("login-attempt");
        localStorage.removeItem("login-attempt-time");
        localStorage.removeItem("login-attempt-email");
      }
    }
  } catch (e) {
    console.error("Error checking auth state:", e);
  }

  // Process hash tokens
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (accessToken && refreshToken) {
    console.log("Found tokens in URL hash, setting session");
    supabase.auth
      .setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error setting session from URL hash:", error);
        } else if (data.session) {
          console.log("Successfully set session from URL hash");
          // Store backup
          try {
            localStorage.setItem(
              "akii-auth-backup",
              JSON.stringify({
                access_token: accessToken,
                refresh_token: refreshToken,
                timestamp: new Date().toISOString(),
              }),
            );
          } catch (e) {
            console.error("Failed to store backup session:", e);
          }

          // Clear hash from URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname + window.location.search,
          );
        }
      });
  }
}

// Initialize React app
// Using a named function declaration for better Fast Refresh compatibility
async function initializeReact() {
  try {
    // Initialize environment first
    initializeEnvironment();

    // Add global error handler for runtime.lastError connection issues
    // This is a common Chrome extension related error that can be safely ignored
    window.addEventListener(
      "error",
      function (event) {
        if (
          event.message &&
          (event.message.includes("runtime.lastError") ||
            event.message.includes("Receiving end does not exist"))
        ) {
          // Prevent the error from appearing in console
          event.preventDefault();
          // Don't stop propagation as other handlers might need it
          return true;
        }
      },
      true,
    );

    // Import development tools only in development
    if (import.meta.env.DEV) {
      // Use a synchronous import for better Fast Refresh compatibility
      try {
        const { TempoDevtools } = require("tempo-devtools");
        TempoDevtools.init();
      } catch (e) {
        console.error("Failed to load tempo-devtools:", e);
      }
    }

    // Get root element
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    // Create root
    const root = ReactDOM.createRoot(rootElement);

    // [ROOT CAUSE FIX] Pre-check Supabase auth state before rendering app to prevent race conditions
    console.log(
      "[EXTENDED FIX] Initializing auth state with connection error handling...",
    );

    // Set a flag to indicate we're handling auth initialization
    window.__AKII_AUTH_INITIALIZING = true;

    try {
      // Check for active session
      const { data } = await supabase.auth.getSession();
      console.log("[EXTENDED FIX] Initial auth check complete:", {
        isAuthenticated: !!data.session,
        email: data.session?.user?.email || "none",
      });

      // If the user is authenticated, store a flag that can be used as fallback
      if (data.session && data.session.user) {
        try {
          localStorage.setItem(
            "akii-auth-fallback-user",
            JSON.stringify({
              id: data.session.user.id,
              email: data.session.user.email,
              timestamp: Date.now(),
            }),
          );
        } catch (e) {
          console.error("[EXTENDED FIX] Failed to store auth fallback:", e);
        }
      }

      // Now render app with strict mode and error boundary
      root.render(
        React.createElement(
          React.StrictMode,
          null,
          React.createElement(
            ErrorBoundary,
            null,
            React.createElement(
              BrowserRouter,
              null,
              React.createElement(App, null),
            ),
          ),
        ),
      );

      // Clear the initializing flag
      setTimeout(() => {
        window.__AKII_AUTH_INITIALIZING = false;
      }, 1000);
    } catch (error) {
      console.error("[EXTENDED FIX] Error in pre-auth check:", error);
      // Still render the app even if pre-auth check fails
      root.render(
        React.createElement(
          React.StrictMode,
          null,
          React.createElement(
            ErrorBoundary,
            null,
            React.createElement(
              BrowserRouter,
              null,
              React.createElement(App, null),
            ),
          ),
        ),
      );
    }
  } catch (error) {
    console.error("Failed to initialize React:", error);
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h1>Failed to load application</h1>
          <p>Please try refreshing the page</p>
          <button onclick="window.location.reload()">Refresh Page</button>
        </div>
      `;
    }
  }
}

// Start the application immediately
(async () => {
  await initializeReact();
})();
