import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Menu,
  Settings,
  User as UserIcon,
  Moon,
  Sun,
  LogOut,
  Circle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-compatibility";
import { toast } from "@/components/ui/use-toast";
import { safeLocalStorage } from "@/lib/browser-check";
import { Sidebar } from "./Sidebar";
import TrialBanner from "./TrialBanner";

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

// Enhanced shared header component
interface HeaderProps {
  onMenuClick?: () => void;
  isAdmin?: boolean;
  theme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick = () => {},
  isAdmin = false,
  theme = "dark",
  onThemeChange,
}) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // Handle sign out
  const handleSignOut = async () => {
    try {
      if (signOut) {
        await signOut();
        navigate("/");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Sign out error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem("dashboard-theme", newTheme);
    
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <div className="md:hidden mr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="mr-4 md:flex">
          <Link to="/dashboard" className="flex items-center">
            <Circle className="h-6 w-6 fill-primary text-primary" />
            <span className="ml-2 text-xl font-bold">Akii</span>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle Theme"
            className="rounded-full"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="rounded-full"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-full overflow-hidden"
              >
                <Avatar className="h-8 w-8">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt="User's profile picture" />
                  ) : (
                    <AvatarFallback>
                      {profile?.first_name?.charAt(0) || 
                       user?.email?.charAt(0)?.toUpperCase() || 
                       <UserIcon className="h-5 w-5" />}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium ml-1 hidden md:inline-block">
                  {profile?.first_name || user?.email?.split('@')[0] || 'User'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

interface DashboardLayoutProps {
  children?: React.ReactNode;
  isAdmin?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children,
  isAdmin = false
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Check if the user has previously collapsed the sidebar
    return safeLocalStorage.getItem("sidebar-collapsed") === "true";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return (
      safeLocalStorage.getItem("darkMode") === "true" ||
      safeLocalStorage.getItem("dashboard-theme") === "dark" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });
  
  // Set initial theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);
  
  const toggleTheme = (newTheme: "light" | "dark") => {
    setIsDarkMode(newTheme === "dark");
  };

  const toggleSidebar = () => {
    const newCollapsedState = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsedState);
    // Save the user's preference
    safeLocalStorage.setItem("sidebar-collapsed", String(newCollapsedState));
  };

  return (
    <div className={`flex min-h-screen flex-col bg-background ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <Header 
        onMenuClick={() => setMobileMenuOpen(true)}
        isAdmin={isAdmin}
        theme={isDarkMode ? "dark" : "light"}
        onThemeChange={toggleTheme}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col sm:flex-row">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar 
            isCollapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
            isAdmin={isAdmin}
          />
        </div>

        {/* Mobile Sidebar (overlay) */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative bg-background w-full max-w-xs p-4">
              <Sidebar isCollapsed={false} isAdmin={isAdmin} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div 
          className={cn(
            "flex-1 transition-all",
            sidebarCollapsed ? "md:ml-16" : "md:ml-[240px]"
          )}
        >
          <DashboardPageContainer>
            <TrialBanner />
            {children || <Outlet />}
          </DashboardPageContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
