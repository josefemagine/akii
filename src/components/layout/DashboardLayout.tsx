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
import { supabase } from "@/lib/supabase";
import "@/styles/dashboard.css";

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
}

const SidebarItem = ({
  icon = <Home className="h-5 w-5" />,
  label = "Menu Item",
  href = "/",
  active = false,
  onClick = () => {},
  subItems,
  collapsed = false,
  className,
}: SidebarItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = subItems && subItems.length > 0;
  const location = useLocation();
  const navigate = useNavigate();

  const isSubItemActive = (subHref: string) => location.pathname === subHref;
  const isAnySubItemActive = hasSubItems && subItems.some(item => isSubItemActive(item.href));

  return (
    <div>
      <a
        href={hasSubItems ? "#" : href}
        onClick={(e) => {
          e.preventDefault();
          if (hasSubItems) {
            setIsOpen(!isOpen);
          } else {
            onClick();
          }
        }}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          !className && "hover:bg-gray-100 dark:hover:bg-gray-800",
          !className && (active || isAnySubItemActive)
            ? "bg-gray-100 text-primary dark:bg-gray-800"
            : "text-gray-500 dark:text-gray-400",
          className
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
                  isOpen && "transform rotate-180"
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
                  : "text-gray-500 dark:text-gray-400"
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
      icon: <PlusCircle className="h-5 w-5" />,
      label: "Create AI Instance",
      href: "#",
      className: "create-instance-btn",
    },
    {
      icon: <Circle className="h-5 w-5" />,
      label: "AI Instances",
      href: "/dashboard/agents",
      subItems: [
        {
          label: "My Instances",
          href: "/admin/agents",
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
      ],
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
        },
      ],
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
      href: "/dashboard/users",
    },
    {
      icon: <UsersRound className="h-5 w-5" />,
      label: "User Sync",
      href: "/dashboard/user-sync",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: "Moderation",
      href: "/dashboard/moderation",
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: "Email Templates",
      href: "/dashboard/email-templates",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Billing",
      href: "/dashboard/billing",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Workflows",
      href: "/dashboard/workflows",
    },
    {
      icon: <Database className="h-5 w-5" />,
      label: "Database Schema",
      href: "/dashboard/database-schema",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Admin Settings",
      href: "/dashboard/admin-settings",
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
          <Link to="/dashboard" className="flex w-full justify-center">
            <Circle className="h-6 w-6 fill-green-500 text-green-500" />
          </Link>
        ) : (
          <Link to="/dashboard" className="flex items-center gap-2">
            <Circle className="h-6 w-6 fill-green-500 text-green-500" />
            <span className="text-xl font-bold">Akii</span>
            {isAdmin && (
              <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-md ml-2 border border-red-200 dark:border-red-800">
                <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Admin
                </span>
              </div>
            )}
          </Link>
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
              subItems={item.subItems}
              collapsed={collapsed}
              className={item.className}
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
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
}

const Header = ({
  onMenuClick = () => {},
  onSearchChange,
  isAdmin = false,
  theme,
  onThemeChange,
}: HeaderProps) => {
  const { user, signOut, userRole } = useAuth();
  const { searchValue, setSearchValue } = useSearch();
  const navigate = useNavigate();

  // Check for admin status in multiple ways
  const adminOverrideInSession =
    sessionStorage.getItem("admin_override") === "true" &&
    sessionStorage.getItem("admin_override_email") === user?.email;
  const isUserAdmin =
    user?.role === "admin" ||
    userRole === "admin" ||
    adminOverrideInSession ||
    isAdmin;

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    // Save to localStorage directly for immediate persistence
    localStorage.setItem("dashboard-theme", newTheme);
    onThemeChange(newTheme);
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out user:", user?.email);

      // Store current user email before logout
      const currentEmail = user?.email;
      const isJosef = currentEmail === "josef@holm.com";

      // If it's josef@holm.com, preserve some data
      if (isJosef) {
        localStorage.setItem("akii-auth-user-email", "josef@holm.com");
        localStorage.setItem("akii-auth-user-id", user?.id || "");
        localStorage.setItem("akii-auth-timestamp", Date.now().toString());
        localStorage.setItem("akii_admin_override", "true");
        localStorage.setItem("akii_admin_override_email", "josef@holm.com");
        localStorage.setItem(
          "akii_admin_override_expiry",
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        );
      } else {
        // First clear all localStorage and sessionStorage items that might contain auth data
        localStorage.removeItem("sb-api-auth-token");
        localStorage.removeItem("sb:session");
        localStorage.removeItem("sb-access-token");
        localStorage.removeItem("sb-refresh-token");
        localStorage.removeItem("supabase.auth.token");
        localStorage.removeItem("auth-return-path");
        localStorage.removeItem("auth-in-progress");
        localStorage.removeItem("auth-in-progress-time");
        localStorage.removeItem("force-auth-login");
        localStorage.removeItem("force-auth-email");
        localStorage.removeItem("force-auth-timestamp");

        // Clear session storage items too
        sessionStorage.removeItem("admin_override");
        sessionStorage.removeItem("admin_override_email");
      }

      // Direct Supabase logout first
      const { error: directError } = await supabase.auth.signOut({
        scope: "global",
      });
      if (directError) {
        console.error("Error during direct Supabase logout:", directError);
      }

      // Then try context signOut if available
      if (signOut) {
        try {
          await signOut();
        } catch (signOutError) {
          console.error("Error in context signOut:", signOutError);
        }
      }

      // If it's josef@holm.com, restore admin override after logout
      if (isJosef) {
        sessionStorage.setItem("admin_override", "true");
        sessionStorage.setItem("admin_override_email", "josef@holm.com");
      }

      // Force reload regardless of success/failure of above methods
      console.log("Forcing full page reload to /");
      window.location.href = "/";
      return; // Prevent further execution
    } catch (error) {
      console.error("Error during logout:", error);
      // Force redirect on error
      toast({
        title: "Logout Error",
        description:
          "There was an issue logging out. Redirecting to home page.",
        variant: "destructive",
      });
      // Force reload anyway
      window.location.href = "/";
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 bg-background px-4 sm:px-6">
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
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="hover:bg-muted"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5 text-foreground" />
          ) : (
            <Sun className="h-5 w-5 text-foreground" />
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
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "user"}`}
                />
                <AvatarFallback>
                  {user?.email?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex md:flex-col md:items-start md:leading-none">
                <span className={`font-medium ${isAdmin ? "text-green-500" : ""}`}>
                  {user?.email?.split("@")[0] || "User"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email || ""}
                </span>
              </div>
              <ChevronDown className="hidden h-4 w-4 md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help</span>
            </DropdownMenuItem>
            {isUserAdmin && (
              <DropdownMenuItem asChild>
                <Link to="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

interface DashboardLayoutProps {
  children?: React.ReactNode;
  isAdmin?: boolean;
  onSearchChange?: (value: string) => void;
}

const DashboardLayout = ({
  children = <div>Dashboard Content</div>,
  isAdmin = false,
  onSearchChange,
}: DashboardLayoutProps) => {
  const [hasError, setHasError] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, userRole } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("dashboard-theme") as "light" | "dark") || "dark";
  });

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("dashboard-theme", theme);
  }, [theme]);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error("DashboardLayout caught error:", event.error);
      setHasError(true);
      event.preventDefault();
    };

    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Check for admin status
  const adminOverride =
    sessionStorage.getItem("admin_override") === "true" &&
    sessionStorage.getItem("admin_override_email") === user?.email;
  const effectiveIsAdmin = isAdmin || adminOverride || userRole === "admin";

  return (
    <div className={cn("dashboard flex h-screen w-full", theme === "dark" && "dark")}>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={toggleMobileSidebar}
          ></div>
          <div className="fixed inset-y-0 left-0 w-[280px] bg-background">
            <Sidebar onToggle={toggleMobileSidebar} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        <Header
          onMenuClick={toggleMobileSidebar}
          onSearchChange={onSearchChange}
          isAdmin={effectiveIsAdmin}
          theme={theme}
          onThemeChange={setTheme}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
          <div className="mx-auto max-w-[1800px]">
            {hasError ? (
              <div className="p-8 text-center bg-destructive/20 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                <p>
                  There was an error loading this content. Please try refreshing
                  the page.
                </p>
              </div>
            ) : (
              children || (
                <div className="p-8 text-center">No content to display</div>
              )
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
