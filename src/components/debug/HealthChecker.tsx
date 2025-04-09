import React, { useState, useEffect } from 'react';
import { runDashboardHealthCheck, fixCommonDashboardIssues } from '@/lib/dashboard-health';
import { useAuth } from '@/contexts/UnifiedAuthContext';

interface HealthCheckerProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  collapsed?: boolean;
}

const HealthChecker: React.FC<HealthCheckerProps> = ({ 
  position = 'bottom-right',
  collapsed = true
}) => {
  const [isOpen, setIsOpen] = useState(!collapsed);
  const [healthResults, setHealthResults] = useState<Record<string, any> | null>(null);
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const { refreshAuthState, user, isAdmin, isLoading } = useAuth();

  const positionClasses = {
    'top-right': 'top-0 right-0',
    'bottom-right': 'bottom-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-left': 'bottom-0 left-0',
  };

  const runHealthCheck = async () => {
    setIsRunningCheck(true);
    try {
      const results = await runDashboardHealthCheck();
      setHealthResults(results);
      console.log('[HealthChecker] Health check results:', results);
    } catch (error) {
      console.error('[HealthChecker] Health check error:', error);
      setHealthResults({ error: String(error) });
    } finally {
      setIsRunningCheck(false);
    }
  };

  const applyFixes = () => {
    try {
      fixCommonDashboardIssues();
      console.log('[HealthChecker] Applied common fixes');
      
      setTimeout(() => {
        runHealthCheck();
        if (refreshAuthState) {
          refreshAuthState();
          console.log('[HealthChecker] Auth state refreshed');
        }
      }, 500);
    } catch (error) {
      console.error('[HealthChecker] Fix application error:', error);
    }
  };

  const forceRefresh = () => {
    try {
      localStorage.setItem('akii-auth-last-refresh', Date.now().toString());
      
      if (refreshAuthState) {
        refreshAuthState();
        console.log('[HealthChecker] Auth state forcefully refreshed');
      }
      
      setTimeout(() => {
        runHealthCheck();
      }, 500);
    } catch (error) {
      console.error('[HealthChecker] Force refresh error:', error);
    }
  };

  // Initial health check on mount
  useEffect(() => {
    if (!collapsed) {
      runHealthCheck();
    }
  }, [collapsed]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClasses[position]} m-4 p-2 bg-blue-500 text-white rounded-full shadow-lg z-50 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300`}
        aria-label="Open Health Checker"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} m-4 bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-80 overflow-hidden`}>
      <div className="bg-blue-500 text-white p-2 flex justify-between items-center">
        <h3 className="text-sm font-medium">Akii Health Checker</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-200 focus:outline-none"
          aria-label="Close Health Checker"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="p-3 max-h-96 overflow-y-auto">
        <div className="mb-3">
          <div className="text-xs mb-1 font-semibold text-gray-600">Authentication Status</div>
          <div className="text-xs grid grid-cols-2 gap-1">
            <div className="flex items-center">
              <span className={isLoading ? "text-yellow-500" : "text-green-500"}>
                {isLoading ? "⏳" : "✓"}
              </span>
              <span className="ml-1">Loading: {isLoading ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center">
              <span className={user ? "text-green-500" : "text-red-500"}>
                {user ? "✓" : "✗"}
              </span>
              <span className="ml-1">User: {user ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center">
              <span className={isAdmin ? "text-green-500" : "text-yellow-500"}>
                {isAdmin ? "✓" : "✗"}
              </span>
              <span className="ml-1">Admin: {isAdmin ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mb-3">
          <button
            onClick={runHealthCheck}
            disabled={isRunningCheck}
            className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:bg-blue-300 font-medium"
          >
            {isRunningCheck ? 'Running...' : 'Run Health Check'}
          </button>
          <button
            onClick={applyFixes}
            className="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 font-medium"
          >
            Fix Common Issues
          </button>
        </div>

        {healthResults && (
          <div className="bg-gray-50 border rounded p-2 text-xs mb-3">
            {Object.entries(healthResults).map(([key, result]: [string, any]) => (
              <div key={key} className="mb-2">
                <div className="font-medium flex items-center">
                  <span className={result.status === 'healthy' ? "text-green-500" : "text-red-500"}>
                    {result.status === 'healthy' ? "✓" : "✗"}
                  </span>
                  <span className="ml-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
                <div className="text-gray-600 ml-5">{result.message}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={forceRefresh}
            className="flex-1 px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 font-medium"
          >
            Force Refresh
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
      
      <div className="bg-gray-100 p-2 text-xs text-gray-500 text-center">
        v1.0.0 • {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default HealthChecker; 