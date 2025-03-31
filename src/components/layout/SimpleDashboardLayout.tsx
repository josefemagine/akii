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
import { supabase } from "@/lib/auth-simple";

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
  isAdmin?: boolean;
}

const Sidebar = ({
  collapsed = false,
  onToggle = () => {},
  isAdmin = false,
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

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
            <Circle className="h-6 w-6 fill-green-500 text-green-500" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Circle className="h-6 w-6 fill-green-500 text-green-500" />
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
}

const Header = ({
  onMenuClick = () => {},
  onSearchChange,
  isAdmin = false,
}: HeaderProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { user, signOut } = useAuth();
  const { searchValue, setSearchValue } = useSearch();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    // In a real implementation, you would update the document class or a theme context
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out user:", user?.email);
      await signOut();
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Logout Error",
        description: "There was an issue logging out.",
        variant: "destructive",
      });
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
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "user"}`}
                />
                <AvatarFallback>
                  {user?.email?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex md:flex-col md:items-start md:leading-none">
                <span className="font-medium">
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
  onSearchChange?: (value: string) => void;
}

const DashboardLayout = ({
  children = <div>Dashboard Content</div>,
  onSearchChange,
}: DashboardLayoutProps) => {
  const [hasError, setHasError] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error("DashboardLayout caught error:", event.error);
      setHasError(true);
      event.preventDefault();
    };

    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
    console.log("DashboardLayout - Forcing dark mode");

    // Force dark colors as inline styles if needed
    const style = document.createElement("style");
    style.textContent = `
      .bg-gray-50 { background-color: #0f172a !important; }
      .bg-gray-900 { background-color: #0f172a !important; }
      .bg-gray-950 { background-color: #0a0f1a !important; }
      .text-foreground { color: #ffffff !important; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          isAdmin={isAdmin}
        />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={toggleMobileSidebar}
          ></div>
          <div className="fixed inset-y-0 left-0 w-[280px] bg-gray-950">
            <Sidebar onToggle={toggleMobileSidebar} isAdmin={isAdmin} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={toggleMobileSidebar}
          onSearchChange={onSearchChange}
          isAdmin={isAdmin}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-900 text-white">
          <div className="mx-auto max-w-7xl">
            {hasError ? (
              <div className="p-8 text-center bg-red-900/20 rounded-lg border border-red-500/30">
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
