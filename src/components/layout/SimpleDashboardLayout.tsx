import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Menu,
  Search,
  Settings,
  User,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  Home,
  MessageSquare,
  FileText,
  BarChart3,
  Users,
  Circle,
  HelpCircle,
  X,
  Globe,
  Workflow,
  ShoppingBag,
  Shield,
  BarChart,
  Upload,
  UserCircle,
  PlusCircle,
  Sidebar as SidebarIcon,
  Mail,
  CreditCard,
  Database,
  UsersRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSearch } from "@/contexts/SearchContext";
import { toast } from "@/components/ui/use-toast";
// Import removed - file doesn't exist
// import { supabase } from "@/lib/auth-simple";
import ConsolidatedSidebar from './ConsolidatedSidebar';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({
  icon = <Home className="h-5 w-5" />,
  label = "Menu Item",
  href = "/",
  active = false,
  onClick = () => {},
}: SidebarItemProps) => {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800",
        active
          ? "bg-gray-100 text-primary dark:bg-gray-800"
          : "text-gray-500 dark:text-gray-400",
      )}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
};

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ collapsed = false, onToggle = () => {} }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const userSidebarItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <Circle className="h-5 w-5" />,
      label: "AI Instances",
      href: "/dashboard/agents",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Training Data",
      href: "/dashboard/documents",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Web Chat",
      href: "/dashboard/web-chat",
    },
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      label: "Shopify",
      href: "/dashboard/shopify-chat",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Conversations",
      href: "/dashboard/conversations",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Analytics",
      href: "/dashboard/analytics",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      label: "API Keys",
      href: "/dashboard/api-keys",
    },
    {
      icon: <Workflow className="h-5 w-5" />,
      label: "Workflows",
      href: "/dashboard/workflows",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Team",
      href: "/dashboard/team",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/dashboard/settings",
    },
  ];

  const adminSidebarItems = [
    {
      icon: <Users className="h-5 w-5" />,
      label: "Users",
      href: "/dashboard/admin/users",
    },
    {
      icon: <UsersRound className="h-5 w-5" />,
      label: "User Sync",
      href: "/dashboard/admin/user-sync",
    },
    {
      icon: <UserCircle className="h-5 w-5" />,
      label: "Profile Migration",
      href: "/dashboard/admin/user-profile-migration",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: "Moderation",
      href: "/dashboard/admin/moderation",
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: "Email Templates",
      href: "/dashboard/admin/email-templates",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Billing",
      href: "/dashboard/admin/billing",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Workflows",
      href: "/dashboard/admin/workflows",
    },
    {
      icon: <Database className="h-5 w-5" />,
      label: "Database Schema",
      href: "/dashboard/admin/database-schema",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Admin Settings",
      href: "/dashboard/admin/settings",
    },
  ];

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-white dark:bg-gray-950 dark:border-gray-800 transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[280px]",
      )}
    >
      <div className="flex h-14 items-center border-b px-3 dark:border-gray-800">
        {collapsed ? (
          <div className="flex w-full justify-center">
            <Circle className="h-6 w-6 fill-primary text-primary" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Circle className="h-6 w-6 fill-primary text-primary" />
            <span className="text-xl font-bold">Akii</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-8 w-8 lg:hidden"
          onClick={onToggle}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {/* User sidebar items */}
          {userSidebarItems.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              label={collapsed ? "" : item.label}
              href={item.href}
              active={isActive(item.href)}
              onClick={() => navigate(item.href)}
            />
          ))}

          {/* Admin section if user is admin */}
          {isAdmin && !collapsed && (
            <div className="mt-6 mb-2 px-3">
              <div className="text-xs font-semibold text-gray-400 uppercase">
                Admin
              </div>
            </div>
          )}

          {/* Admin sidebar items if user is admin */}
          {isAdmin &&
            adminSidebarItems.map((item, index) => (
              <SidebarItem
                key={`admin-${index}`}
                icon={item.icon}
                label={collapsed ? "" : item.label}
                href={item.href}
                active={isActive(item.href)}
                onClick={() => navigate(item.href)}
              />
            ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t dark:border-gray-800">
        {!collapsed && (
          <div className="flex flex-col space-y-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <div>Free Plan</div>
              <div className="mt-1 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: "35%" }}
                ></div>
              </div>
              <div className="mt-1">350 / 1,000 messages</div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Circle className="mr-2 h-4 w-4 fill-green-500 text-green-500" />
              Upgrade Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

interface HeaderProps {
  onMenuClick?: () => void;
  onSearchChange?: (value: string) => void;
  isAdmin?: boolean;
  theme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
}

const Header = ({
  onMenuClick = () => {},
  onSearchChange,
  isAdmin = false,
  theme = "dark",
  onThemeChange,
}: HeaderProps) => {
  const { user, signOut, updateProfile, profile } = useAuth();
  const { searchValue, setSearchValue } = useSearch();
  const navigate = useNavigate();

  // Cache avatar URL in memory
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Save Dicebear avatar to profile if not already set
  useEffect(() => {
    console.log("Avatar debug:", { 
      hasUser: !!user, 
      userEmail: user?.email, 
      hasProfile: !!profile,
      profileAvatar: profile?.avatar_url,
      hasUpdateProfile: !!updateProfile
    });
    
    // If there's a profile avatar, use that
    if (profile?.avatar_url) {
      console.log("Using existing profile avatar:", profile.avatar_url);
      setAvatarUrl(profile.avatar_url);
      return;
    }
    
    // Otherwise generate the avatar URL using the same format as admin page
    if (user?.email) {
      const generatedAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`;
      setAvatarUrl(generatedAvatarUrl);
      
      // Save to profile if needed
      if (updateProfile && profile && !profile.avatar_url) {
        console.log("Saving avatar URL to profile:", generatedAvatarUrl);
        
        // Update user profile with avatar URL
        updateProfile({ avatar_url: generatedAvatarUrl })
          .then(() => console.log("Successfully saved avatar URL to profile"))
          .catch(err => {
            console.error("Failed to save avatar URL to profile:", err);
          });
      }
    }
  }, [user, updateProfile, profile]);

  // Log avatar source URL for debugging
  useEffect(() => {
    if (profile?.avatar_url) {
      // Debug the exact URL structure
      console.log("🔍 AVATAR URL:", profile.avatar_url);
      
      // Check if URL starts with http or https
      if (!profile.avatar_url.startsWith('http')) {
        console.warn("Avatar URL doesn't have protocol, may need domain");
      }
      
      try {
        // Test if image can be loaded
        const img = new Image();
        img.onload = () => console.log("✅ Avatar image pre-loaded successfully");
        img.onerror = () => console.error("❌ Avatar image failed to pre-load");
        img.src = profile.avatar_url;
      } catch (e) {
        console.error("Error testing image:", e);
      }
      
      // Always set the URL, even if it might not work
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile?.avatar_url]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem("dashboard-theme", newTheme);
    
    // Save theme preference to user profile if user is logged in
    if (user && updateProfile) {
      // Use a dynamic approach with Record<string, any> to avoid type errors
      const updates: Record<string, any> = { 
        id: user.id
      };
      // Set theme_preference dynamically
      updates['theme_preference'] = newTheme;
      
      updateProfile(updates).catch(err => {
        console.error("Failed to save theme preference to profile:", err);
      });
    }
    
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  const handleLogout = async (scope: 'global' | 'local' | 'others' = 'global') => {
    try {
      console.log(`Logging out user: ${user?.email} with scope: ${scope}`);
      
      // Import signOut function to ensure we use the enhanced version
      const { signOut: authSignOut, clearAuthTokens } = await import('@/lib/supabase-auth');
      
      // Call the enhanced signOut function with scope
      const response = await authSignOut(scope);
      
      if (response.error) {
        console.error("Error during logout:", response.error);
        toast({
          title: "Logout Error",
          description: "There was an issue logging out.",
          variant: "destructive",
        });
      }
      
      // Additional cleanup as fallback
      try {
        clearAuthTokens();
      } catch (e) {
        console.error("Error during token cleanup:", e);
      }
      
      // Force reload the page to ensure a clean state
      window.location.href = "/?force_logout=true";
    } catch (error) {
      console.error("Exception during logout:", error);
      toast({
        title: "Logout Error",
        description: "There was an issue logging out.",
        variant: "destructive",
      });
      
      // Fallback - redirect anyway
      window.location.href = "/?force_logout=true";
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white dark:bg-gray-950 dark:border-gray-800 px-4 sm:px-6">
      {isAdmin && (
        <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-md">
          <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-sm font-medium text-red-600 dark:text-red-400">
            Admin Mode
          </span>
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="w-full flex-1 md:max-w-sm">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full bg-gray-50 dark:bg-gray-800 pl-8 rounded-lg border-gray-200 dark:border-gray-700"
            value={searchValue}
            onChange={handleSearchInputChange}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          <span className="sr-only">
            {theme === "light" ? "Dark mode" : "Light mode"}
          </span>
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-full"
            >
              <div 
                className="h-8 w-8 rounded-full border-2 border-white overflow-hidden flex items-center justify-center"
                style={{
                  background: "#4338ca"
                }}
              >
                {/* Force img with direct avatar URL */}
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="User avatar"
                    className="w-full h-full"
                    style={{ 
                      objectFit: "cover",
                      display: "block" 
                    }}
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.log("✅ Avatar loaded successfully in header:", target.src);
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.error("❌ Avatar failed to load in header:", target.src);
                      // Add a key to force re-render
                      target.setAttribute('key', Date.now().toString());
                      // Try adding crossorigin attribute
                      target.setAttribute('crossorigin', 'anonymous');
                    }}
                  />
                ) : (
                  <span className="text-white text-xs font-bold">
                    {user?.email?.substring(0, 2).toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <span className="font-medium hidden md:inline-block">
                {user?.email?.split("@")[0] || "User"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleLogout('local')}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out (This Device)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLogout('others')}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out (Other Devices) 
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLogout('global')}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out (All Devices)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

const SimpleDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Initialize theme state, defaulting to 'dark' instead of 'light'
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("dashboard-theme") as "light" | "dark") || "dark";
  });

  // Add or update class on body element when theme changes
  useEffect(() => {
    const dashboardElement = document.getElementById("dashboard");
    if (dashboardElement) {
      dashboardElement.classList.toggle("dark", theme === "dark");
      // Also update the class on the body to ensure proper theme application
      document.body.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div id="dashboard" className={`dashboard ${theme} flex h-screen`}>
      <div className="hidden md:block">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative bg-background w-full max-w-xs p-4">
            <Sidebar />
          </div>
        </div>
      )}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all",
          sidebarCollapsed ? "md:ml-[70px]" : "md:ml-[280px]"
        )}
      >
        <Header
          onMenuClick={() => setMobileMenuOpen(true)}
          isAdmin={isAdmin}
          theme={theme}
          onThemeChange={handleThemeChange}
        />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
};

export default SimpleDashboardLayout;
