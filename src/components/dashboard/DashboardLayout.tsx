import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils.ts";
import { safeLocalStorage } from "@/lib/browser-check.ts";
import { Sidebar } from "./Sidebar.tsx";
import Header from "./Header.tsx";
import { useAuth } from "@/contexts/UnifiedAuthContext.tsx";
import { Profile } from "@/types/auth.ts";

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

export interface DashboardLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  isAdmin?: boolean;
}

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

export const DashboardLayout = memo(({
  children,
  fullWidth = false,
  isAdmin
}: DashboardLayoutProps) => {
  // Log component id in dev mode
  const instanceId = useRef(DASHBOARD_LAYOUT_ID);
  if (DEBUG_LAYOUT) {
    console.log(`[DashboardLayout:${instanceId.current}] Component initializing with props:`, {
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkBanner, setNetworkBanner] = useState(false);
  
  // Stable references for child components - never changes after first render
  const childrenRef = useRef(children);
  if (children && !childrenRef.current) {
    childrenRef.current = children;
  }
  
  const isMounted = useRef(true);
  
  // Use auth context
  const { user, profile, isAdmin: authAdmin, isLoading, hasUser, hasProfile } = useAuth();
  
  const navigate = useNavigate();

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle theme initialization - only run once
  useEffect(() => {
    // Listen for system theme changes - only apply if explicitly enabled in user settings
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply system theme if user has opted in to system theme syncing
      const syncWithSystem = safeLocalStorage.getItem('sync-system-theme') === 'true';
      
      if (syncWithSystem && isMounted.current) {
        const newTheme = e.matches ? 'dark' : 'light';
        safeLocalStorage.setItem('dashboard-theme', newTheme);
        setTheme(newTheme as "light" | "dark");
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Initialize auth state
  useEffect(() => {
    if (!authInitialized && hasUser && !isLoading && isMounted.current) {
      setAuthInitialized(true);
      logDebug("Auth initialized with user", { 
        userId: user?.id,
        email: user?.email,
        hasProfile,
        isAdmin: authAdmin
      });
    }
    
    // Safety timeout to ensure we never get stuck in loading state
    const safetyTimeout = setTimeout(() => {
      if (!authInitialized && hasUser && isMounted.current) {
        logDebug("Safety timeout triggered - forcing dashboard to initialize", {
          hasUser,
          hasProfile,
          isAdmin: authAdmin,
          isLoading,
          authInitialized,
          userEmail: user?.email || 'unknown',
          userId: user?.id || 'unknown'
        });
        setAuthInitialized(true);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(safetyTimeout);
  }, [user, profile, isLoading, authInitialized, authAdmin, hasUser, hasProfile]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      if (isMounted.current) {
        setIsOnline(true);
        // Show a temporary banner when coming back online
        setNetworkBanner(true);
        setTimeout(() => {
          if (isMounted.current) {
            setNetworkBanner(false);
          }
        }, 3000);
      }
    };
    
    const handleOffline = () => {
      if (isMounted.current) {
        setIsOnline(false);
        setNetworkBanner(true);
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleThemeChange = useCallback((newTheme: "light" | "dark") => {
    if (isMounted.current) {
      setTheme(newTheme);
    }
    safeLocalStorage.setItem('dashboard-theme', newTheme);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    const newState = !sidebarCollapsed;
    if (isMounted.current) {
      setSidebarCollapsed(newState);
    }
    safeLocalStorage.setItem('sidebar-collapsed', String(newState));
  }, [sidebarCollapsed]);

  // Memoize the entire layout structure to prevent unnecessary re-renders
  const layoutContent = useMemo(() => {
    if (DEBUG_LAYOUT) {
      logDebug(`Setting up layout with auth state:`, {
        hasUser,
        hasProfile,
        isAdmin: authAdmin,
        isLoading,
        authInitialized,
        userEmail: user?.email || 'unknown',
        userId: user?.id || 'unknown'
      });
    }
    
    return (
      <div className={`${theme === "dark" ? "dark" : ""}`}>
        <div className="flex h-screen bg-background">
          <Sidebar 
            isCollapsed={sidebarCollapsed} 
            onToggle={handleSidebarToggle}
            isAdmin={authAdmin}
          />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header 
              theme={theme}
              onThemeChange={handleThemeChange}
              onMenuClick={handleSidebarToggle}
            />
            <main className="flex-1 overflow-y-auto">
              {networkBanner && (
                <div className="bg-yellow-500 dark:bg-yellow-600 text-white text-center py-1 px-4">
                  {isOnline 
                    ? "You're back online!" 
                    : "You're currently offline. Some features may be unavailable."}
                </div>
              )}
              {!authInitialized && (
                <div className="flex flex-col items-center justify-center h-screen">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                  <p className="text-sm text-muted-foreground">Initializing dashboard...</p>
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
    authAdmin, 
    handleThemeChange, 
    networkBanner,
    isOnline, 
    authInitialized, 
    fullWidth,
    hasUser,
    hasProfile
  ]);

  return layoutContent;
});

// ErrorBoundary component to catch rendering errors
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
