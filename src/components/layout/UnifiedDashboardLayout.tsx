import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Menu,
  Search,
  Settings,
  User as UserIcon,
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
  Layout,
  Monitor,
  Smartphone,
  MessageCircle,
  Send,
  ShoppingBag,
  Globe,
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
  Bot,
  Loader2,
  Workflow,
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
import { useAuth } from "@/contexts/auth-compatibility";
import { useSearch } from "@/contexts/SearchContext";
import { toast } from "@/components/ui/use-toast";
import { safeLocalStorage } from "@/lib/browser-check";
import "@/styles/dashboard.css";
import { DashboardPageContainer } from "@/components/layout/DashboardPageContainer";
import { supabase } from '@/lib/supabase';
import SimpleSidebar from './Sidebar';
import ConsolidatedSidebar from './ConsolidatedSidebar';

// Type definitions for unified dashboard
type DashboardVariant = "standard" | "simple";

interface UnifiedDashboardLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
  variant?: DashboardVariant;
}

// Sidebar Item component that handles both variants
interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
  subItems?: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
  }>;
  collapsed?: boolean;
  className?: string;
  variant?: DashboardVariant;
}

const SidebarItem = ({
  icon,
  label,
  href,
  active = false,
  onClick = () => {},
  subItems,
  collapsed = false,
  className,
  variant = "standard",
}: SidebarItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = subItems && subItems.length > 0;
  const location = useLocation();
  const navigate = useNavigate();

  const isSubItemActive = (subHref: string) => location.pathname === subHref;
  const isAnySubItemActive =
    hasSubItems && subItems.some((item) => isSubItemActive(item.href));

  // For simple variant, just return a simple link
  if (variant === "simple") {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          navigate(href);
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
        {!collapsed && <span>{label}</span>}
      </a>
    );
  }

  // For standard variant, return full implementation with subitems
  return (
    <div>
      <a
        href={hasSubItems ? "#" : href}
        onClick={(e) => {
          e.preventDefault();
          if (hasSubItems) {
            setIsOpen(!isOpen);
          } else {
            navigate(href);
            onClick();
          }
        }}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          !className && "hover:bg-gray-100 dark:hover:bg-gray-800",
          !className && (active || isAnySubItemActive)
            ? "bg-gray-100 text-primary dark:bg-gray-800"
            : "text-gray-500 dark:text-gray-400",
          className,
        )}
      >
        {icon}
        {!collapsed && (
          <>
            <span className="flex-1">{label}</span>
            {hasSubItems && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "transform rotate-180",
                )}
              />
            )}
          </>
        )}
      </a>
      {!collapsed && hasSubItems && isOpen && (
        <div className="ml-8 mt-1 space-y-1">
          {subItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.href);
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800",
                isSubItemActive(item.href)
                  ? "bg-gray-100 text-primary dark:bg-gray-800"
                  : "text-gray-500 dark:text-gray-400",
              )}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

// Unified Sidebar component that handles both variants
interface UnifiedSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  variant?: DashboardVariant;
  isAdmin?: boolean;
}

const UnifiedSidebar = ({ 
  collapsed = false, 
  onToggle = () => {},
  variant = "standard",
  isAdmin = false,
}: UnifiedSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Standardized sidebar items - with conditional rendering based on variant
  const userSidebarItems = [
    ...(variant === "simple" ? [{
      icon: <Home className="h-5 w-5" />,
      label: "Dashboard",
      href: "/dashboard",
    }] : []),
    {
      icon: <PlusCircle className="h-5 w-5" />,
      label: "Create AI Instance",
      href: "#",
      className: variant === "standard" ? "create-instance-btn" : undefined,
      subItems: variant === "standard" ? [] : undefined
    },
    {
      icon: <Circle className="h-5 w-5" />,
      label: "AI Instances",
      href: "/dashboard/agents",
      subItems: variant === "standard" ? [
        {
          label: "My Instances",
          href: "/dashboard/agents",
          icon: <Bot className="h-4 w-4" />,
        },
        {
          label: "API Keys",
          href: "/dashboard/api-keys",
        },
        {
          label: "Zapier",
          href: "/dashboard/zapier",
        },
        {
          label: "n8n",
          href: "/dashboard/n8n",
        },
      ] : undefined,
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Training Data",
      href: "/dashboard/documents",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Conversations",
      href: "/dashboard/conversations",
    },
    ...(variant === "simple" ? [
      {
        icon: <Globe className="h-5 w-5" />,
        label: "Web Chat",
        href: "/dashboard/web-chat"
      },
      {
        icon: <ShoppingBag className="h-5 w-5" />,
        label: "Shopify",
        href: "/dashboard/shopify-chat"
      },
    ] : []),
    ...(variant === "standard" ? [
      {
        icon: <Layout className="h-5 w-5" />,
        label: "Apps",
        href: "/dashboard/apps",
        subItems: [
          {
            label: "Web Chat",
            href: "/dashboard/web-chat",
            icon: <Monitor className="h-4 w-4" />,
          },
          {
            label: "Mobile Chat",
            href: "/dashboard/mobile-chat",
            icon: <Smartphone className="h-4 w-4" />,
          },
          {
            label: "WhatsApp Chat",
            href: "/dashboard/whatsapp-chat",
            icon: <MessageCircle className="h-4 w-4" />,
          },
          {
            label: "Telegram Chat",
            href: "/dashboard/telegram-chat",
            icon: <Send className="h-4 w-4" />,
          },
          {
            label: "Shopify Chat",
            href: "/dashboard/shopify-chat",
            icon: <ShoppingBag className="h-4 w-4" />,
          },
          {
            label: "WordPress Chat",
            href: "/dashboard/wordpress-chat",
            icon: <Globe className="h-4 w-4" />,
          }
        ]
      }
    ] : []),
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Analytics",
      href: "/dashboard/analytics",
    },
    ...(variant === "simple" ? [
      {
        icon: <Globe className="h-5 w-5" />,
        label: "API Keys",
        href: "/dashboard/api-keys"
      },
      {
        icon: <Workflow className="h-5 w-5" />,
        label: "Workflows",
        href: "/dashboard/workflows"
      }
    ] : []),
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

  // Admin sidebar items
  const adminSidebarItems: Array<{
    icon: React.ReactNode;
    label: string;
    href: string;
    subItems?: Array<{
      label: string;
      href: string;
      icon?: React.ReactNode;
    }>;
  }> = [
    {
      icon: <Users className="h-5 w-5" />,
      label: "Users",
      href: variant === "simple" ? "/dashboard/admin/users" : "/dashboard/users",
    },
    {
      icon: <UsersRound className="h-5 w-5" />,
      label: "User Sync",
      href: variant === "simple" ? "/dashboard/admin/user-sync" : "/dashboard/user-sync",
    },
    ...(variant === "simple" ? [
      {
        icon: <UserCircle className="h-5 w-5" />,
        label: "Profile Migration",
        href: "/dashboard/admin/user-profile-migration"
      }
    ] : []),
    {
      icon: <Shield className="h-5 w-5" />,
      label: "Moderation",
      href: variant === "simple" ? "/dashboard/admin/moderation" : "/dashboard/moderation",
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: "Email Templates",
      href: variant === "simple" ? "/dashboard/admin/email-templates" : "/dashboard/email-templates",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Billing",
      href: variant === "simple" ? "/dashboard/admin/billing" : "/dashboard/billing",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Workflows",
      href: variant === "simple" ? "/dashboard/admin/workflows" : "/dashboard/workflows",
    },
    {
      icon: <Database className="h-5 w-5" />,
      label: "Database",
      href: variant === "simple" ? "/dashboard/admin/database-schema" : "/dashboard/database",
    },
    ...(variant === "simple" ? [
      {
        icon: <Settings className="h-5 w-5" />,
        label: "Admin Settings",
        href: "/dashboard/admin/settings"
      }
    ] : [])
  ];

  // Choose sidebar styling based on variant
  const sidebarClass = cn(
    "fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-white transition-all dark:border-gray-800 dark:bg-gray-950",
    collapsed ? (variant === "simple" ? "w-[70px]" : "w-16") : (variant === "simple" ? "w-[280px]" : "w-64"),
  );

  return (
    <aside className={sidebarClass}>
      <div className="flex h-14 items-center border-b px-3 py-4 dark:border-gray-800">
        {!collapsed ? (
          <Link
            to="/"
            className="flex items-center gap-2 w-full justify-center"
          >
            <Circle className="h-6 w-6 fill-green-500 text-green-500" />
            <span className="text-xl font-semibold text-black dark:text-white">Akii</span>
          </Link>
        ) : (
          <Link
            to="/"
            className="w-full flex justify-center"
          >
            <Circle className="h-6 w-6 fill-green-500 text-green-500" />
          </Link>
        )}
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {userSidebarItems.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={isActive(item.href)}
              subItems={item.subItems}
              collapsed={collapsed}
              className={item.className}
              variant={variant}
            />
          ))}

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="my-2 border-t dark:border-gray-800"></div>
              <div className="px-3 py-2">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {!collapsed && "Admin"}
                </h2>
                {adminSidebarItems.map((item, index) => (
                  <SidebarItem
                    key={index}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={isActive(item.href)}
                    subItems={item.subItems || []}
                    collapsed={collapsed}
                    variant={variant}
                  />
                ))}
              </div>
            </>
          )}
        </nav>
      </div>
      
      {/* Footer section with plan info or toggle button */}
      <div className="mt-auto border-t p-2 dark:border-gray-800">
        {variant === "simple" && !collapsed ? (
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
        ) : (
          <div className="grid gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={onToggle}
            >
              {collapsed ? (
                <ChevronDown className="h-5 w-5 rotate-90 transform" />
              ) : (
                <ChevronDown className="h-5 w-5 -rotate-90 transform" />
              )}
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};

// Enhanced shared header component
interface HeaderProps {
  onMenuClick?: () => void;
  onSearchChange?: (value: string) => void;
  isAdmin?: boolean;
  variant?: DashboardVariant;
  theme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
}

const Header = ({
  onMenuClick = () => {},
  onSearchChange,
  isAdmin = false,
  variant = "standard",
  theme = "dark",
  onThemeChange,
}: HeaderProps) => {
  const { user, profile, signOut } = useAuth();
  const { searchValue, setSearchValue } = useSearch();
  const navigate = useNavigate();

  // Handle sign out with scope parameter
  const handleSignOut = async (scope: 'global' | 'local' | 'others' = 'global') => {
    try {
      console.log(`Signing out with scope: ${scope}`);
      
      // First, import the signOut function directly to ensure consistency
      const { signOut: authSignOut, clearAuthTokens } = await import('@/lib/supabase-auth');
      
      // Call the enhanced signOut function with scope
      const { error } = await authSignOut(scope);
      
      if (error) {
        console.error("Error signing out:", error);
        
        // Show error toast
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
      }
      
      // Perform additional token cleanup as fallback
      try {
        clearAuthTokens();
      } catch (e) {
        console.error("Error during token cleanup:", e);
      }
      
      // Force reload the page to ensure a clean state
      window.location.href = "/?force_logout=true";
    } catch (error) {
      console.error("Exception during logout:", error);
      
      // Show error toast
      toast({
        title: "Sign out error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
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

        <div className="mr-4 hidden md:flex">
          <Link to="/" className="flex items-center">
            <Circle className="h-6 w-6 fill-primary text-primary" />
            <span className="ml-2 text-xl font-bold">Akii</span>
          </Link>
        </div>

        <div className="w-full flex-1 md:max-w-sm ml-auto md:ml-0">
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
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSignOut('local')}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out (This Device)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSignOut('others')}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out (Other Devices)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSignOut('global')}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out (All Devices)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

// Main unified dashboard layout component
const UnifiedDashboardLayout = ({ 
  children, 
  isAdmin = false,
  variant = "standard" 
}: UnifiedDashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`flex min-h-screen flex-col bg-background ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <Header 
        onMenuClick={() => setMobileMenuOpen(true)}
        isAdmin={isAdmin}
        variant={variant}
        theme={isDarkMode ? "dark" : "light"}
        onThemeChange={toggleTheme}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col sm:flex-row">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <ConsolidatedSidebar 
            isCollapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
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
              <ConsolidatedSidebar isCollapsed={false} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div 
          className={cn(
            "flex-1 transition-all",
            variant === "simple" ? 
              (sidebarCollapsed ? "md:ml-[70px]" : "md:ml-[280px]") :
              (sidebarCollapsed ? "md:ml-16" : "md:ml-64")
          )}
        >
          <DashboardPageContainer>
            {children}
          </DashboardPageContainer>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboardLayout; 