/**
 * Auth Debugger Component
 * 
 * This component provides a diagnostic panel for debugging authentication-related issues
 * It's only rendered in development mode and can be shown/hidden with a keyboard shortcut
 */

import React, { useState, useEffect } from 'react';
import { useDirectAuth } from '@/contexts/direct-auth-context';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export const AuthDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [authState, setAuthState] = useState<Record<string, any>>({});

  // Get auth contexts
  const directAuth = useDirectAuth();
  const supabaseAuth = useSupabaseAuth();

  // Collect debug data
  useEffect(() => {
    function collectDebugData() {
      // Get all authentication-related data from localStorage
      const localStorageData: Record<string, string> = {};
      Object.keys(localStorage).forEach((key) => {
        if (
          key.includes('auth') ||
          key.includes('supabase') ||
          key.includes('session') ||
          key.includes('user') ||
          key.includes('akii') ||
          key.includes('redirect') ||
          key.includes('login')
        ) {
          try {
            localStorageData[key] = localStorage.getItem(key) || '';
          } catch (e) {
            localStorageData[key] = `[Error reading value: ${e}]`;
          }
        }
      });

      // Get all authentication-related data from sessionStorage
      const sessionStorageData: Record<string, string> = {};
      Object.keys(sessionStorage).forEach((key) => {
        if (
          key.includes('auth') ||
          key.includes('supabase') ||
          key.includes('session') ||
          key.includes('user') ||
          key.includes('akii') ||
          key.includes('redirect') ||
          key.includes('login')
        ) {
          try {
            sessionStorageData[key] = sessionStorage.getItem(key) || '';
          } catch (e) {
            sessionStorageData[key] = `[Error reading value: ${e}]`;
          }
        }
      });

      // Collect all auth-related data
      const debugData = {
        timestamp: new Date().toISOString(),
        location: window.location.href,
        directAuth: {
          user: directAuth.user ? {
            id: directAuth.user.id,
            email: directAuth.user.email,
            role: directAuth.user.role
          } : null,
          profile: directAuth.profile ? {
            id: directAuth.profile.id,
            email: directAuth.profile.email,
            role: directAuth.profile.role
          } : null,
          isAdmin: directAuth.isAdmin,
          isLoading: directAuth.isLoading
        },
        supabaseAuth: {
          user: supabaseAuth.user ? {
            id: supabaseAuth.user.id,
            email: supabaseAuth.user.email,
            role: supabaseAuth.user.role
          } : null,
          session: supabaseAuth.session ? {
            accessToken: supabaseAuth.session.access_token ? '[PRESENT]' : '[MISSING]',
            refreshToken: supabaseAuth.session.refresh_token ? '[PRESENT]' : '[MISSING]',
            expiresAt: supabaseAuth.session.expires_at
          } : null,
          isAdmin: supabaseAuth.isAdmin,
          isLoading: supabaseAuth.isLoading
        },
        storage: {
          localStorage: localStorageData,
          sessionStorage: sessionStorageData
        },
        redirectState: {
          redirectCount: sessionStorage.getItem('redirect-count') || '0',
          lastRedirectTime: sessionStorage.getItem('last-redirect-time') || 'none',
          navigationHistory: sessionStorage.getItem('navigation-history') || '[]'
        }
      };

      setAuthState(debugData);
    }

    // Update debug data when the component is opened
    if (isVisible) {
      collectDebugData();
      
      // Set up periodic refresh
      const intervalId = setInterval(collectDebugData, 2000);
      return () => clearInterval(intervalId);
    }
  }, [isVisible, directAuth, supabaseAuth]);

  // Set up keyboard shortcut to toggle the debug panel
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Alt+D to toggle debug panel
      if (event.altKey && event.key === 'd') {
        setIsVisible(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Only render in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  // Clear all authentication data
  const clearAuthData = () => {
    // Clear both localStorage and sessionStorage
    Object.keys(localStorage).forEach((key) => {
      if (
        key.includes('auth') ||
        key.includes('supabase') ||
        key.includes('session') ||
        key.includes('user') ||
        key.includes('akii') ||
        key.includes('redirect') ||
        key.includes('login')
      ) {
        localStorage.removeItem(key);
      }
    });

    Object.keys(sessionStorage).forEach((key) => {
      if (
        key.includes('auth') ||
        key.includes('supabase') ||
        key.includes('session') ||
        key.includes('user') ||
        key.includes('akii') ||
        key.includes('redirect') ||
        key.includes('login')
      ) {
        sessionStorage.removeItem(key);
      }
    });

    // Update the debug data after clearing
    setAuthState((prev) => ({
      ...prev,
      timestamp: new Date().toISOString(),
      storage: {
        localStorage: {},
        sessionStorage: {}
      }
    }));
  };

  // Force a fresh authentication check
  const forceAuthRefresh = () => {
    directAuth.refreshAuthState();
  };

  // Render the debug panel
  if (!isVisible) {
    return (
      <div className="fixed right-4 bottom-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-gray-800 text-white p-2 rounded-full shadow-lg opacity-70 hover:opacity-100"
          title="Open Auth Debugger (Alt+D)"
        >
          🔍
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto">
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

        <div className="p-4 grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="border rounded p-3">
              <h3 className="font-bold mb-2">DirectAuth State</h3>
              <pre className="text-xs overflow-auto bg-gray-100 dark:bg-gray-900 p-2 rounded max-h-40">
                {JSON.stringify(authState.directAuth, null, 2)}
              </pre>
            </div>
            
            <div className="border rounded p-3">
              <h3 className="font-bold mb-2">SupabaseAuth State</h3>
              <pre className="text-xs overflow-auto bg-gray-100 dark:bg-gray-900 p-2 rounded max-h-40">
                {JSON.stringify(authState.supabaseAuth, null, 2)}
              </pre>
            </div>

            <div className="border rounded p-3">
              <h3 className="font-bold mb-2">Navigation & Redirect State</h3>
              <div className="text-xs font-mono">
                <p>Current URL: {authState.location}</p>
                <p>Redirect Count: {authState.redirectState?.redirectCount}</p>
                <p>Last Redirect: {authState.redirectState?.lastRedirectTime}</p>
              </div>
              <h4 className="font-medium mt-2 mb-1">Navigation History</h4>
              <pre className="text-xs overflow-auto bg-gray-100 dark:bg-gray-900 p-2 rounded max-h-40">
                {authState.redirectState?.navigationHistory}
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
                    {authState.storage?.localStorage && Object.entries(authState.storage.localStorage).map(([key, value], i) => (
                      <tr key={i} className="border-t">
                        <td className="p-1 font-mono">{key}</td>
                        <td className="p-1 font-mono break-all">{value as string}</td>
                      </tr>
                    ))}
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
                    {authState.storage?.sessionStorage && Object.entries(authState.storage.sessionStorage).map(([key, value], i) => (
                      <tr key={i} className="border-t">
                        <td className="p-1 font-mono">{key}</td>
                        <td className="p-1 font-mono break-all">{value as string}</td>
                      </tr>
                    ))}
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