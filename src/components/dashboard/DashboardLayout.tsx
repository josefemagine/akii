import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { safeLocalStorage } from "@/lib/browser-check";
import { Sidebar } from "./Sidebar";
import Header from "./Header";
import { useDirectAuth } from "@/contexts/direct-auth-context";
import { useAuth } from "@/contexts/auth-compatibility";
import { isProduction, ensureDashboardAccess } from "@/lib/production-recovery";

// Debug flag for controlling logs
const DEBUG_LAYOUT = false;

// Helper to control debug logs
const logDebug = (message: string, data?: any) => {
  if (DEBUG_LAYOUT) {
    if (data) {
      console.log(`[DashboardLayout] ${message}`, data);
    } else {
      console.log(`[DashboardLayout] ${message}`);
    }
  }
};

// Define consistent dashboard styling variables
export const dashboardStyles = {
  containerPadding: "p-8",
  containerWidth: "max-w-7xl",
  containerMargin: "mx-auto",
  pageMinHeight: "min-h-[calc(100vh-4rem)]",
  pageBg: "bg-gray-50 dark:bg-gray-900",
  contentSpacing: "space-y-8",
  sectionSpacing: "mb-8",
};

interface DashboardPageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

function DashboardPageContainer({
  children,
  className,
  fullWidth = false,
}: DashboardPageContainerProps) {
  return (
    <div className={cn(
      dashboardStyles.pageBg,
      dashboardStyles.pageMinHeight,
      dashboardStyles.containerPadding,
      className
    )}>
      <div className={cn(
        "w-full",
        !fullWidth && dashboardStyles.containerWidth,
        !fullWidth && dashboardStyles.containerMargin,
        dashboardStyles.contentSpacing
      )}>
        {children}
      </div>
    </div>
  );
}

interface DashboardLayoutProps {
  children?: React.ReactNode;
  isAdmin?: boolean;
  fullWidth?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children,
  isAdmin = false,
  fullWidth = false
}) => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [networkBanner, setNetworkBanner] = useState(false);
  
  // State tracking references
  const checkInProgress = useRef(false);
  const isMounted = useRef(true);
  const lastProfileCheckTime = useRef<number>(0);
  
  // Use both contexts for a smooth transition
  const { profile, isLoading, refreshAuthState, user } = useDirectAuth();
  const compatAuth = useAuth();
  
  const navigate = useNavigate();

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Safe state setter that checks if component is mounted
  const safeSetState = <T extends any>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
    if (isMounted.current) {
      setter(value);
    }
  };

  // Handle initial auth state (run only once)
  useEffect(() => {
    // Skip if already initialized
    if (authInitialized || checkInProgress.current) return;
    
    const checkAuthStatus = async () => {
      // Set flag to prevent multiple simultaneous checks
      checkInProgress.current = true;
      logDebug('Checking initial auth status');
      
      // Check if we're in a potential loop already
      const redirectCount = parseInt(sessionStorage.getItem('redirect-count') || '0');
      if (redirectCount >= 3) {
        console.warn('DashboardLayout: Detected potential redirect loop, skipping auto-redirect');
        // Still mark as initialized so we show content instead of spinner
        safeSetState(setAuthInitialized, true);
        checkInProgress.current = false;
        return;
      }
      
      try {
        // Dynamically import isLoggedIn
        const { isLoggedIn } = await import('@/lib/direct-db-access');
        
        // Check both auth contexts - if either has a user, we're good
        const loginStatus = isLoggedIn();
        const isAuthenticated = !!user || !!compatAuth.user || loginStatus;
        
        safeSetState(setAuthInitialized, true);
        
        // If we're on production, try to recover auth state rather than redirecting immediately
        if (isProduction && !isAuthenticated) {
          // Check for emergency auth first
          const hasEmergencyAuth = localStorage.getItem('akii-auth-emergency') === 'true';
          if (hasEmergencyAuth) {
            logDebug('Found emergency auth, enabling dashboard access');
            checkInProgress.current = false;
            return;
          }
          
          // Force emergency auth for production as last resort
          logDebug('Attempting to ensure dashboard access in production');
          ensureDashboardAccess();
          checkInProgress.current = false;
          return;
        }
        
        // If no user is found AND we're not in a loading state, redirect to login
        if (!isAuthenticated && !isLoading && !compatAuth.isLoading) {
          logDebug('Not authenticated, preparing redirect to login');
          
          // Set a timestamp for this redirect to detect loops
          const currentTime = Date.now();
          const lastRedirectTime = parseInt(sessionStorage.getItem('dashboard-redirect-time') || '0');
          
          // If multiple redirects happen too quickly, don't redirect
          if (currentTime - lastRedirectTime < 2000) {
            console.warn('DashboardLayout: Redirects happening too quickly, breaking the redirect chain');
            checkInProgress.current = false;
            return;
          }
          
          // Mark this redirect
          sessionStorage.setItem('dashboard-redirect-time', currentTime.toString());
          
          // Use replace to avoid growing history stack
          navigate('/login', { replace: true });
        } else if (isAuthenticated && !profile) {
          // We're authenticated but don't have a profile yet - force a refresh
          logDebug('Authenticated but missing profile, refreshing auth state');
          refreshAuthState();
        }
      } finally {
        checkInProgress.current = false;
      }
    };
    
    checkAuthStatus();
  }, [authInitialized, compatAuth.isLoading, compatAuth.user, navigate, refreshAuthState, user, isLoading, profile]);

  // Set up network monitoring for offline mode
  useEffect(() => {
    const handleOnline = () => {
      logDebug('Network online');
      safeSetState(setIsOnline, true);
      safeSetState(setNetworkBanner, false);
      // Refresh auth state when back online
      refreshAuthState();
    };
    
    const handleOffline = () => {
      logDebug('Network offline');
      safeSetState(setIsOnline, false);
      safeSetState(setNetworkBanner, true);
    };
    
    // Check if we're online at startup
    safeSetState(setIsOnline, navigator.onLine);
    
    // Add network status listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshAuthState]);

  // Ensure the user profile exists on mount
  useEffect(() => {
    // Use a ref to track the last profile check time to prevent redundant checks
    const currentTime = Date.now();
    const MIN_PROFILE_CHECK_INTERVAL = 60000; // 1 minute minimum between profile checks (increased from 5s)
    
    if (currentTime - lastProfileCheckTime.current < MIN_PROFILE_CHECK_INTERVAL) {
      logDebug('Skipping profile check - too soon since last attempt', {
        timeSinceLastCheck: currentTime - lastProfileCheckTime.current,
        minInterval: MIN_PROFILE_CHECK_INTERVAL
      });
      return;
    }
    
    // Update the timestamp
    lastProfileCheckTime.current = currentTime;
    
    const verifyUserProfile = async () => {
      try {
        // Skip if we don't have auth yet
        if (!user && !compatAuth.user) {
          return;
        }
        
        // Skip if we already have a profile
        if (profile) {
          return;
        }
        
        const userId = user?.id || compatAuth.user?.id;
        if (!userId) {
          return;
        }
        
        logDebug('Verifying user profile for userId', userId);
        
        // Dynamically import needed functions
        const { ensureProfileExists } = await import('@/lib/direct-db-access');
        
        // Try to create a profile if missing
        try {
          await ensureProfileExists(userId);
          refreshAuthState(); // Refresh auth state to load the new profile
        } catch (error) {
          console.error('DashboardLayout: Error ensuring user profile exists:', error);
        }
      } catch (error) {
        console.error('DashboardLayout: Error in profile verification:', error);
      }
    };
    
    verifyUserProfile();
  }, [user, compatAuth.user, profile, refreshAuthState]);

  // Handle theme changes
  useEffect(() => {
    // Get or set default theme preference
    const savedTheme = safeLocalStorage.getItem('dashboard-theme');
    
    // Always default to dark theme if no preference is set
    if (!savedTheme) {
      safeLocalStorage.setItem('dashboard-theme', 'dark');
      safeSetState(setTheme, 'dark');
    } else if (savedTheme === 'light' || savedTheme === 'dark') {
      safeSetState(setTheme, savedTheme as "light" | "dark");
    }
    
    // Listen for system theme changes - only apply if explicitly enabled in user settings
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply system theme if user has opted in to system theme syncing
      const syncWithSystem = safeLocalStorage.getItem('sync-system-theme') === 'true';
      
      if (syncWithSystem) {
        const newTheme = e.matches ? 'dark' : 'light';
        safeLocalStorage.setItem('dashboard-theme', newTheme);
        safeSetState(setTheme, newTheme as "light" | "dark");
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    safeSetState(setTheme, newTheme);
    safeLocalStorage.setItem('dashboard-theme', newTheme);
  };

  const handleSidebarToggle = () => {
    const newState = !sidebarCollapsed;
    safeSetState(setSidebarCollapsed, newState);
    safeLocalStorage.setItem('sidebar-collapsed', String(newState));
  };

  return (
    <div className={`${theme === "dark" ? "dark" : ""}`}>
      <div className="flex h-screen bg-background">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={handleSidebarToggle}
          isAdmin={isAdmin || compatAuth.isAdmin}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header 
            isAdmin={isAdmin || compatAuth.isAdmin}
            theme={theme}
            onThemeChange={handleThemeChange}
          />
          <main className="flex-1 overflow-y-auto">
            {networkBanner && (
              <div className="bg-yellow-500 dark:bg-yellow-600 text-white text-center py-1 px-4">
                You're currently offline. Some features may be unavailable.
              </div>
            )}
            {!authInitialized && (
              <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
            {authInitialized && (
              <DashboardPageContainer fullWidth={fullWidth}>
                {children || <Outlet />}
              </DashboardPageContainer>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
export { DashboardPageContainer };
