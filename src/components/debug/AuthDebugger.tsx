import React, { useState, useEffect } from "react";

/**
 * Auth Debugger Component
 *
 * This component provides a diagnostic panel for debugging authentication-related issues
 * It's only rendered in development mode and can be shown/hidden with a keyboard shortcut
 */

interface AuthState {
  auth: any;
  storage: {
    localStorage: Record<string, string>;
    sessionStorage: Record<string, string>;
  };
  redirectState?: {
    redirectCount: number;
    lastRedirectTime: string;
    navigationHistory: string[];
  };
  location?: string;
  timestamp?: string;
}

export const AuthDebugger = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    auth: null,
    storage: {
      localStorage: {},
      sessionStorage: {},
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "d") {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isVisible) {
      updateAuthState();
    }
  }, [isVisible]);

  const updateAuthState = () => {
    try {
      // Get localStorage items
      const localStorageItems: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          localStorageItems[key] = localStorage.getItem(key) || "";
        }
      }

      // Get sessionStorage items
      const sessionStorageItems: Record<string, string> = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          sessionStorageItems[key] = sessionStorage.getItem(key) || "";
        }
      }

      // Get auth data from localStorage
      let authData = null;
      try {
        const supabaseAuthStr = localStorage.getItem("supabase.auth.token");
        if (supabaseAuthStr) {
          authData = JSON.parse(supabaseAuthStr);
        }
      } catch (error) {
        console.error("Error parsing auth data:", error);
      }

      setAuthState({
        auth: authData,
        storage: {
          localStorage: localStorageItems,
          sessionStorage: sessionStorageItems,
        },
        location: window.location.href,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating auth state:", error);
    }
  };

  const clearAuthData = () => {
    try {
      localStorage.removeItem("supabase.auth.token");
      localStorage.removeItem("supabase-auth-token");
      localStorage.removeItem("sb-refresh-token");
      localStorage.removeItem("sb-access-token");
      updateAuthState();
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  const forceAuthRefresh = () => {
    try {
      // Implement auth refresh logic here
      updateAuthState();
    } catch (error) {
      console.error("Error refreshing auth:", error);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Authentication Debugger</h2>
          <div className="flex gap-2">
            <button
              onClick={clearAuthData}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Auth Data
            </button>
            <button
              onClick={forceAuthRefresh}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Auth
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
        
        <div className="p-4 grid grid-cols-2 gap-4 overflow-auto">
          <div className="space-y-4">
            <div className="border rounded p-3">
              <h3 className="font-bold mb-2">Auth State</h3>
              <pre className="text-xs overflow-auto bg-gray-100 dark:bg-gray-700 p-2 rounded">
                {JSON.stringify(authState.auth, null, 2)}
              </pre>
            </div>
            
            <div className="border rounded p-3">
              <h3 className="font-bold mb-2">Navigation & Redirect State</h3>
              <div className="text-xs font-mono">
                <p>Current URL: {authState.location}</p>
                <p>
                  Redirect Count:{" "}
                  {authState.redirectState?.redirectCount}
                </p>
                <p>
                  Last Redirect:{" "}
                  {authState.redirectState?.lastRedirectTime}
                </p>
              </div>
              <h4 className="font-medium mt-2 mb-1">Navigation History</h4>
              <pre className="text-xs overflow-auto bg-gray-100 dark:bg-gray-700 p-2 rounded">
                {authState.redirectState?.navigationHistory?.join("\n")}
              </pre>
            </div>
          </div>
          
          <div>
            <div className="border rounded p-3">
              <h3 className="font-bold mb-2">localStorage</h3>
              <div className="h-[300px] overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="text-left p-1">Key</th>
                      <th className="text-left p-1">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(authState.storage.localStorage).map(
                      ([key, value], i) => (
                        <tr key={i} className="border-t">
                          <td className="p-1 font-mono">{key}</td>
                          <td className="p-1 font-mono break-all">{value}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="border rounded p-3 mt-4">
              <h3 className="font-bold mb-2">sessionStorage</h3>
              <div className="h-[300px] overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="text-left p-1">Key</th>
                      <th className="text-left p-1">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(authState.storage.sessionStorage).map(
                      ([key, value], i) => (
                        <tr key={i} className="border-t">
                          <td className="p-1 font-mono">{key}</td>
                          <td className="p-1 font-mono break-all">{value}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t text-xs text-gray-500">
          Press Alt+D to toggle this debugger. Updated: {authState.timestamp}
        </div>
      </div>
    </div>
  );
};

export default AuthDebugger;
