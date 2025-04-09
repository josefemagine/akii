import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { safeLocalStorage } from "@/lib/browser-check";
import { Sidebar } from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/contexts/UnifiedAuthContext";
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

// Global session refresh throttling - moved outside component to be truly stable
const lastSessionRefreshTime = {
  value: 0
};

// Circuit breaker to prevent excessive refreshes on the dashboard
const isDashboardRefreshAllowed = () => {
  const now = Date.now();
  // Limit to once every 60 seconds
  return now - lastSessionRefreshTime.value > 60000;
};

// Mark dashboard refresh as performed
const markDashboardRefreshed = () => {
  lastSessionRefreshTime.value = Date.now();
};

// Create a class component wrapper that provides stability through lifecycles
interface StableRenderWrapperProps {
  children: React.ReactNode;
}

class StableRenderWrapper extends React.Component<StableRenderWrapperProps> {
  shouldComponentUpdate() {
    // Never update after initial render
    return false;
  }

  render() {
    return this.props.children;
  }
}

// Create a memoized container component outside the main component
const StableDashboardContainer = React.memo(function StableDashboardContainer({ 
  children, 
  fullWidth 
}: { 
  children: React.ReactNode, 
  fullWidth: boolean 
}) {
  return (
    <DashboardPageContainer fullWidth={fullWidth}>
      <StableRenderWrapper>
        {children}
      </StableRenderWrapper>
    </DashboardPageContainer>
  );
});

// Create a memoized outlet component to prevent re-rendering of route contents
const StableOutlet = memo(() => <Outlet />);

// Component instance ID to help with debugging remounts
const DASHBOARD_LAYOUT_ID = Math.random().toString(36).substr(2, 9);

const DashboardLayout: React.FC<DashboardLayoutProps> = memo(({ 
  children,
  isAdmin = false,
  fullWidth = false
}) => {
  // Log component id in dev mode
  const instanceId = useRef(DASHBOARD_LAYOUT_ID);
  if (DEBUG_LAYOUT) {
    console.log(`[DashboardLayout:${instanceId.current}] Component initializing with props:`, {
      isAdmin,
      fullWidth,
      hasChildren: !!children
    });
  }

  // Use useState with initializer functions to avoid unnecessary re-renders
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = safeLocalStorage.getItem('dashboard-theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme as "light" | "dark" : 'dark';
  });
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return safeLocalStorage.getItem('sidebar-collapsed') === 'true';
  });
  
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [networkBanner, setNetworkBanner] = useState(false);
  
  // Stable references for child components - never changes after first render
  const childrenRef = useRef(children);
  if (children && !childrenRef.current) {
    childrenRef.current = children;
  }
  
  // State tracking references
  const checkInProgress = useRef(false);
  const isMounted = useRef(true);
  const lastProfileCheckTime = useRef<number>(0);
  
  // Block frequent re-renders from auth state changes
  const stableAuthRef = useRef({
    profile: null,
    isLoading: true,
    user: null,
    lastCheckTime: 0
  });
  
  // Use unified auth context with stable reference
  const auth = useAuth();
  
  // Update stable auth ref without causing re-renders
  useEffect(() => {
    // Only update if significant changes or enough time has passed
    const now = Date.now();
    const hasImportantChanges = 
      (!stableAuthRef.current.user && auth.user) || 
      (!stableAuthRef.current.profile && auth.profile) ||
      (stableAuthRef.current.user?.id !== auth.user?.id) ||
      (stableAuthRef.current.profile?.id !== auth.profile?.id);
      
    // Throttle updates to prevent render storms
    if (hasImportantChanges || now - stableAuthRef.current.lastCheckTime > 30000) {
      stableAuthRef.current = {
        profile: auth.profile,
        isLoading: auth.isLoading,
        user: auth.user,
        lastCheckTime: now
      };
      
      // Initialize auth state if needed, but only once when we have valid data
      if (!authInitialized && auth.user && auth.profile && !auth.isLoading) {
        if (isMounted.current) {
          setAuthInitialized(true);
          logDebug('Auth initialized with profile from context');
        }
      }
    }
  }, [auth.user, auth.profile, auth.isLoading, authInitialized]);
  
  // Access refreshAuthState from auth but don't make it a dependency
  const refreshAuthStateRef = useRef(auth.refreshAuthState);
  useEffect(() => {
    refreshAuthStateRef.current = auth.refreshAuthState;
  }, [auth.refreshAuthState]);
  
  const navigate = useNavigate();

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Safe state setter that checks if component is mounted
  const safeSetState = useCallback(<T extends any>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
    if (isMounted.current) {
      setter(value);
    }
  }, []);

  // Handle theme initialization - only run once
  useEffect(() => {
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
  }, [safeSetState]); // Safe to include safeSetState as it's now memoized

  // Initialize auth state immediately if possible
  useEffect(() => {
    // Safety timeout to ensure we never get stuck in loading state
    const safetyTimeout = setTimeout(() => {
      if (!authInitialized && auth.user) {
        console.log('[DashboardLayout] Safety timeout triggered - forcing dashboard to initialize');
        safeSetState(setAuthInitialized, true);
      }
    }, 10000); // 10 second timeout
    
    if (!authInitialized && auth.user && auth.profile && !auth.isLoading) {
      safeSetState(setAuthInitialized, true);
    }
    
    // Hard-coded admin check for specific user ID
    const ADMIN_USER_ID = 'b574f273-e0e1-4cb8-8c98-f5a7569234c8';
    
    // If user matches our specific admin user, initialize dashboard even without profile
    if (!authInitialized && auth.user?.id === ADMIN_USER_ID) {
      console.log('[DashboardLayout] Known admin user detected by ID, initializing dashboard');
      safeSetState(setAuthInitialized, true);
      
      // Force admin status in localStorage
      safeLocalStorage.setItem('akii-is-admin', 'true');
      safeLocalStorage.setItem('admin_user_id', ADMIN_USER_ID);
    }
    
    // If user is admin by email, initialize dashboard even without profile
    if (!authInitialized && auth.user?.email === 'josef@holm.com') {
      console.log('[DashboardLayout] Admin user detected by email, initializing dashboard');
      safeSetState(setAuthInitialized, true);
      
      // Force admin status in localStorage
      safeLocalStorage.setItem('akii-is-admin', 'true');
    }
    
    return () => clearTimeout(safetyTimeout);
  }, [auth.user, auth.profile, auth.isLoading, authInitialized, safeSetState]);

  const handleThemeChange = useCallback((newTheme: "light" | "dark") => {
    safeSetState(setTheme, newTheme);
    safeLocalStorage.setItem('dashboard-theme', newTheme);
  }, [safeSetState]);

  const handleSidebarToggle = useCallback(() => {
    const newState = !sidebarCollapsed;
    safeSetState(setSidebarCollapsed, newState);
    safeLocalStorage.setItem('sidebar-collapsed', String(newState));
  }, [sidebarCollapsed, safeSetState]);

  // Override isAdmin prop with our specific user ID check
  const userIsAdmin = useMemo(() => {
    const ADMIN_USER_ID = 'b574f273-e0e1-4cb8-8c98-f5a7569234c8';
    
    // First check if the prop explicitly says user is admin
    if (isAdmin) return true;
    
    // Then check if auth context says user is admin
    if (auth.isAdmin) return true;
    
    // Check if user has our specific admin ID
    if (auth.user?.id === ADMIN_USER_ID) {
      console.log('[DashboardLayout] Overriding admin status for specific user ID');
      return true;
    }
    
    // Check if user has admin email
    if (auth.user?.email === 'josef@holm.com') {
      console.log('[DashboardLayout] Overriding admin status for specific email');
      return true;
    }
    
    // Check localStorage fallback
    if (safeLocalStorage.getItem('akii-is-admin') === 'true') {
      console.log('[DashboardLayout] Using localStorage admin override');
      return true;
    }
    
    return false;
  }, [isAdmin, auth.isAdmin, auth.user?.id, auth.user?.email]);

  // Memoize the entire layout structure to prevent unnecessary re-renders
  const layoutContent = useMemo(() => {
    if (DEBUG_LAYOUT) {
      console.log(`[DashboardLayout:${instanceId.current}] Setting up layout with auth state:`, {
        hasUser: !!auth.user,
        hasProfile: !!auth.profile,
        isAdmin: !!auth.isAdmin,
        userIsAdmin: userIsAdmin,
        authInitialized,
        userEmail: auth.user?.email || 'unknown',
        userId: auth.user?.id || 'unknown'
      });
    }
    
    return (
      <div className={`${theme === "dark" ? "dark" : ""}`}>
        <div className="flex h-screen bg-background">
          <Sidebar 
            isCollapsed={sidebarCollapsed} 
            onToggle={handleSidebarToggle}
            isAdmin={userIsAdmin}
          />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header 
              isAdmin={userIsAdmin}
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
                <div className="flex flex-col items-center justify-center h-screen">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                  <p className="text-sm text-muted-foreground">Initializing dashboard...</p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    {/* Debug info */}
                    <p>Auth state: {auth.isLoading ? 'Loading' : 'Ready'}</p>
                    <p>User: {auth.user ? auth.user.email : 'None'}</p>
                    <p>Admin (context): {auth.isAdmin ? 'Yes' : 'No'}</p>
                    <p>Admin (effective): {userIsAdmin ? 'Yes' : 'No'}</p>
                    <p>Profile: {auth.profile ? 'Loaded' : 'None'}</p>
                  </div>
                </div>
              )}
              {authInitialized && (
                <StableDashboardContainer fullWidth={fullWidth}>
                  <ErrorBoundary>
                    {childrenRef.current || <StableOutlet />}
                  </ErrorBoundary>
                </StableDashboardContainer>
              )}
            </main>
          </div>
        </div>
      </div>
    );
  }, [
    theme, 
    sidebarCollapsed, 
    handleSidebarToggle, 
    userIsAdmin, 
    handleThemeChange, 
    networkBanner, 
    authInitialized, 
    fullWidth,
    auth.isAdmin,
    auth.user
  ]);

  // For admin pages, ensure proper initialization
  useEffect(() => {
    if (userIsAdmin) {
      // Set this for sidebar to show admin navigation
      logDebug('Admin user detected, initializing dashboard');
      safeLocalStorage.setItem('akii-is-admin', 'true');
      
      // If the specific user ID, ensure we remember it
      if (auth.user?.id === 'b574f273-e0e1-4cb8-8c98-f5a7569234c8') {
        safeLocalStorage.setItem('admin_user_id', auth.user.id);
      }
    }
  }, [userIsAdmin, auth.user?.id]);

  return layoutContent;
});

// Add this ErrorBoundary component at the beginning of the file
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
    console.error("[DashboardLayout] Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">
            Dashboard Error
          </h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            Something went wrong loading the dashboard content.
          </p>
          <pre className="mt-4 p-2 bg-red-100 dark:bg-red-900/40 rounded overflow-auto text-xs">
            {this.state.error?.toString() || "Unknown error"}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 rounded-md text-sm text-red-800 dark:text-red-200"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DashboardLayout;
export { DashboardPageContainer };
