import React, { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { safeLocalStorage } from "@/lib/browser-check";
import { Sidebar } from "./Sidebar";
import Header from "./Header";
import TrialBanner from "./TrialBanner";
import { useDirectAuth } from "@/contexts/direct-auth-context";
import { useAuth } from "@/contexts/auth-compatibility";
import { ensureProfileExists, isLoggedIn } from "@/lib/direct-db-access";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [networkBanner, setNetworkBanner] = useState(false);
  
  // Use both contexts for a smooth transition
  const { profile, isLoading, refreshAuthState, user } = useDirectAuth();
  const compatAuth = useAuth();
  
  const navigate = useNavigate();

  // Handle initial auth state
  useEffect(() => {
    // Check if we're in a potential loop already
    const redirectCount = parseInt(sessionStorage.getItem('redirect-count') || '0');
    if (redirectCount >= 3) {
      console.warn('DashboardLayout: Detected potential redirect loop, skipping auto-redirect');
      // Still mark as initialized so we show content instead of spinner
      setAuthInitialized(true);
      return;
    }
    
    // Only process auth check if not already initialized
    if (!authInitialized) {
      console.log('DashboardLayout: Initializing auth state', {
        hasUser: !!compatAuth.user,
        hasDirectUser: !!user,
        isLoading: compatAuth.isLoading,
        directLoading: isLoading
      });
      
      // Wait briefly to allow auth contexts to initialize
      setTimeout(() => {
        // Check both auth contexts - if either has a user, we're good
        const isAuthenticated = !!user || !!compatAuth.user || isLoggedIn();
        
        console.log('DashboardLayout: Auth check complete', {
          hasUser: !!compatAuth.user,
          hasDirectUser: !!user,
          isLoggedIn: isLoggedIn(),
          isAuthenticated
        });
        
        setAuthInitialized(true);
        
        // If no user is found AND we're not in a loading state, redirect to login
        if (!isAuthenticated && !isLoading && !compatAuth.isLoading) {
          console.log('DashboardLayout: No user found, redirecting to login');
          
          // Set a timestamp for this redirect to detect loops
          const currentTime = Date.now();
          const lastRedirectTime = parseInt(sessionStorage.getItem('dashboard-redirect-time') || '0');
          
          // If multiple redirects happen too quickly, don't redirect
          if (currentTime - lastRedirectTime < 2000) {
            console.warn('DashboardLayout: Redirects happening too quickly, breaking the redirect chain');
            return;
          }
          
          // Mark this redirect
          sessionStorage.setItem('dashboard-redirect-time', currentTime.toString());
          
          // Use replace to avoid growing history stack
          navigate('/login', { replace: true });
        } else if (isAuthenticated && !profile) {
          // We're authenticated but don't have a profile yet - force a refresh
          console.log('DashboardLayout: Authenticated but no profile, refreshing auth state');
          refreshAuthState();
        }
      }, 500);
    }
  }, [authInitialized, compatAuth.isLoading, compatAuth.user, navigate, refreshAuthState, user, isLoading, profile]);

  // Set up network monitoring for offline mode
  useEffect(() => {
    console.log("DashboardLayout: Component mounted");
    
    const handleOnline = () => {
      console.log("DashboardLayout: Network is back online, refreshing auth state");
      setIsOnline(true);
      setNetworkBanner(false);
      // Refresh auth state when back online
      refreshAuthState();
    };
    
    const handleOffline = () => {
      console.log("DashboardLayout: Network is offline");
      setIsOnline(false);
      setNetworkBanner(true);
    };
    
    // Check if we're online at startup
    setIsOnline(navigator.onLine);
    
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
    // Add debounce protection to prevent multiple calls
    const lastProfileCheckTime = parseInt(sessionStorage.getItem('profile-check-timestamp') || '0');
    const currentTime = Date.now();
    const MIN_PROFILE_CHECK_INTERVAL = 5000; // 5 seconds minimum between profile checks
    
    if (currentTime - lastProfileCheckTime < MIN_PROFILE_CHECK_INTERVAL) {
      console.log('DashboardLayout: Skipping profile check - too soon since last attempt', {
        timeSinceLastCheck: currentTime - lastProfileCheckTime,
        minInterval: MIN_PROFILE_CHECK_INTERVAL
      });
      return;
    }
    
    // Mark this profile check attempt
    sessionStorage.setItem('profile-check-timestamp', currentTime.toString());
    
    const verifyUserProfile = async () => {
      if (!profile) {
        console.log("DashboardLayout: No profile detected, ensuring profile exists");
        try {
          // Get the current user ID from auth context
          const currentUserId = user?.id;
          
          // Skip if no user ID is available - this prevents unnecessary API calls
          if (!currentUserId) {
            console.log("DashboardLayout: No user ID available, skipping profile check");
            return;
          }
          
          const { data: profileData, error } = await ensureProfileExists(currentUserId);
          
          if (profileData) {
            console.log("DashboardLayout: Profile created or found successfully:", profileData);
            // Refresh auth state to make sure it's reflected in the UI
            refreshAuthState();
          } else {
            console.error("DashboardLayout: Failed to ensure profile exists:", error);
            // If we couldn't create the profile, let's try one more time
            setTimeout(async () => {
              console.log("DashboardLayout: Retrying profile creation");
              const retryResult = await ensureProfileExists(currentUserId);
              if (retryResult.data) {
                console.log("DashboardLayout: Profile retry successful:", retryResult.data);
                refreshAuthState();
              } else {
                console.error("DashboardLayout: Profile retry failed:", retryResult.error);
              }
            }, 1000);
          }
        } catch (error) {
          console.error("DashboardLayout: Error ensuring profile exists:", error);
        }
      } else {
        console.log("DashboardLayout: User profile already exists:", profile.id);
      }
    };
    
    verifyUserProfile();
  }, [profile, refreshAuthState, user?.id]);
  
  // Verify auth state periodically
  useEffect(() => {
    const authCheck = setInterval(() => {
      const isLoggedInStatus = isLoggedIn();
      console.log("DashboardLayout: Periodic auth check:", { isLoggedInStatus });
      
      if (!isLoggedInStatus && !isLoading) {
        console.warn("DashboardLayout: User no longer logged in during periodic check");
        // Force refresh auth state
        refreshAuthState();
      }
    }, 60 * 1000); // Check every minute
    
    return () => clearInterval(authCheck);
  }, [isLoading, refreshAuthState]);

  // Read theme from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Monitor for theme changes and apply
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
  }, [theme]);

  // Toggle mobile menu
  const handleMenuClick = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Use isAdmin from props or direct auth context
  const effectiveIsAdmin = isAdmin || !!compatAuth.isAdmin;

  // Show a user-friendly loader with debug info when auth is being initialized
  if (!authInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-foreground text-lg font-medium mb-2">Initializing Dashboard...</p>
        <p className="text-muted-foreground text-sm mb-4">This should only take a moment</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header 
        onMenuClick={handleMenuClick}
        isAdmin={effectiveIsAdmin}
        theme={theme}
        onThemeChange={setTheme}
      />
      
      <main className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar 
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            isAdmin={effectiveIsAdmin}
          />
        </div>
        <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
          <TrialBanner />
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
export { DashboardPageContainer };
