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
import { supabase } from "@/lib/supabase";

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
  const { userRole } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const isAdmin = userRole === "admin";

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
      title: "Dashboard",
      path: "/admin",
      icon: <Home className="h-4 w-4" />,
    },
    {
      title: "Users",
      path: "/admin/users",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "User Sync",
      path: "/admin/user-sync",
      icon: <UsersRound className="h-4 w-4" />,
    },
    {
      title: "Moderation",
      path: "/admin/moderation",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      title: "Email Templates",
      path: "/admin/email-templates",
      icon: <Mail className="h-4 w-4" />,
    },
    {
      title: "Billing",
      path: "/admin/billing",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      title: "Workflows",
      path: "/admin/workflows",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      title: "Database Schema",
      path: "/admin/database-schema",
      icon: <Database className="h-4 w-4" />,
    },
    {
      title: "Settings",
      path: "/admin/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  const sidebarItems = isAdmin ? adminSidebarItems : userSidebarItems;

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
          {sidebarItems.map((item, index) => (
            <SidebarItem
              key={index}
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
  const { user, signOut, userRole } = useAuth();
  const { searchValue, setSearchValue } = useSearch();
  const navigate = useNavigate();
  
  // Check for admin status in multiple ways
  const adminOverrideInSession = sessionStorage.getItem('admin_override') === 'true' && 
                                sessionStorage.getItem('admin_override_email') === user?.email;
  const isUserAdmin = user?.role === "admin" || userRole === "admin" || adminOverrideInSession || isAdmin;

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    // In a real implementation, you would update the document class or a theme context
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out user:", user?.email);
      
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
      localStorage.removeItem("admin_override");
      localStorage.removeItem("akii-auth-fallback-user");
      localStorage.removeItem("akii-auth-success-time");
      
      // Clear session storage items too
      sessionStorage.removeItem("admin_override");
      sessionStorage.removeItem("admin_override_email");
      
      if (signOut) {
        // Call the auth context signOut function which handles Supabase signout
        await signOut();
      } else {
        // Fallback direct logout if signOut function is unavailable
        const { error } = await supabase.auth.signOut({ scope: "global" });
        if (error) {
          console.error("Error during direct Supabase logout:", error);
        }
      }
      
      // Use window.location.href for a complete page reload
      console.log("Forcing full page reload to /");
      window.location.href = "/";
      
    } catch (error) {
      console.error("Error during logout:", error);
      // Force redirect on error
      toast({
        title: "Logout Error",
        description: "There was an issue logging out. Redirecting to home page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
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
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleLogout}
          title="Log out"
          className="hidden sm:flex"
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Log out</span>
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
                  {user?.email || "user@example.com"}
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
            <DropdownMenuItem asChild>
              <button 
                className="flex w-full cursor-pointer items-center px-2 py-1.5 text-sm outline-none"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </button>
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
  console.log("DashboardLayout rendered with isAdmin:", isAdmin);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, userRole } = useAuth();
  
  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
    console.log("DashboardLayout - Forcing dark mode");
    
    // Debug theme variables
    console.log("CSS Variables:", {
      background: getComputedStyle(document.documentElement).getPropertyValue('--background'),
      foreground: getComputedStyle(document.documentElement).getPropertyValue('--foreground'),
    });
    
    // Force dark colors as inline styles if needed
    const style = document.createElement('style');
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
  
  // Add check for admin override in session storage
  const adminOverride = sessionStorage.getItem('admin_override') === 'true' && 
                       sessionStorage.getItem('admin_override_email') === user?.email;
  
  // Use either props isAdmin or the admin override
  const effectiveIsAdmin = isAdmin || adminOverride || userRole === 'admin';
  
  console.log("Admin status check:", { 
    propsIsAdmin: isAdmin, 
    userRole, 
    adminOverride, 
    effectiveIsAdmin 
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Debug any rendering issues
  console.log("DashboardLayout - About to render with children:", children ? "Children exist" : "No children");
  
  try {
    return (
      <div className="flex h-screen w-full bg-gray-900 text-white">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          {effectiveIsAdmin ? (
            <AdminSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
          ) : (
            <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
          )}
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={toggleMobileSidebar}
            ></div>
            <div className="fixed inset-y-0 left-0 w-[280px] bg-gray-950">
              {effectiveIsAdmin ? (
                <AdminSidebar onToggle={toggleMobileSidebar} />
              ) : (
                <Sidebar onToggle={toggleMobileSidebar} />
              )}
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            onMenuClick={toggleMobileSidebar}
            onSearchChange={onSearchChange}
            isAdmin={effectiveIsAdmin}
          />
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-900 text-white">
            <div className="mx-auto max-w-7xl">
              {children || <div className="p-8 text-center">No content to display</div>}
            </div>
          </main>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering DashboardLayout:", error);
    return (
      <div className="p-8 bg-gray-900 text-white min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Dashboard Error</h1>
        <p className="mb-4">There was an error rendering the dashboard:</p>
        <pre className="p-4 bg-gray-800 rounded overflow-auto">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
};

// Define AdminSidebar component
const AdminSidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const adminSidebarItems = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: <Home className="h-4 w-4" />,
    },
    {
      title: "Users",
      path: "/admin/users",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "User Sync",
      path: "/admin/user-sync",
      icon: <UsersRound className="h-4 w-4" />,
    },
    {
      title: "Moderation",
      path: "/admin/moderation",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      title: "Email Templates",
      path: "/admin/email-templates",
      icon: <Mail className="h-4 w-4" />,
    },
    {
      title: "Billing",
      path: "/admin/billing",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      title: "Workflows",
      path: "/admin/workflows",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      title: "Database Schema",
      path: "/admin/database-schema",
      icon: <Database className="h-4 w-4" />,
    },
    {
      title: "Settings",
      path: "/admin/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <div
      className={`${
        collapsed ? "w-14" : "w-64"
      } bg-background border-r flex flex-col h-screen fixed top-0 left-0 transition-width duration-300 ease-in-out z-10`}
    >
      <div className="flex items-center gap-2 p-3">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Akii" className="h-8 w-8" />
            <span className="font-bold text-xl">Akii Admin</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="mx-auto">
            <img src="/logo.svg" alt="Akii" className="h-8 w-8" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={onToggle}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {adminSidebarItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.title}
            href={item.path}
            active={isActive(item.path)}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>
    </div>
  );
};

export default DashboardLayout;
