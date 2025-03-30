import React, { useState } from "react";
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
      icon: <Home className="h-5 w-5" />,
      label: "Dashboard",
      href: "/admin",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Users",
      href: "/admin/users",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/admin/settings",
    },
    {
      icon: <Circle className="h-5 w-5" />,
      label: "Packages",
      href: "/admin/packages",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Moderation",
      href: "/admin/moderation",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Email Templates",
      href: "/admin/email-templates",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Lead Magnets",
      href: "/admin/lead-magnets",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      label: "Landing Pages",
      href: "/admin/landing-pages",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Blog",
      href: "/admin/blog",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Affiliates",
      href: "/admin/affiliates",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Compliance",
      href: "/admin/compliance",
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
}

const Header = ({ onMenuClick = () => {} }: HeaderProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    // In a real implementation, you would update the document class or a theme context
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white dark:bg-gray-950 dark:border-gray-800 px-4 sm:px-6">
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
            {user?.role === "admin" && (
              <DropdownMenuItem asChild>
                <Link to="/admin">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
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
}

const DashboardLayout = ({
  children = <div>Dashboard Content</div>,
  isAdmin = false,
}: DashboardLayoutProps) => {
  console.log("DashboardLayout rendered with isAdmin:", isAdmin);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={toggleMobileSidebar}
          ></div>
          <div className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-gray-950">
            <Sidebar onToggle={toggleMobileSidebar} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={toggleMobileSidebar} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
