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
  Loader2,
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
import { safeLocalStorage, safeSessionStorage } from "@/lib/browser-check";
import "@/styles/dashboard.css";
import { DashboardPageContainer } from "@/components/layout/DashboardPageContainer";

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
  const isAnySubItemActive =
    hasSubItems && subItems.some((item) => isSubItemActive(item.href));

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

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ collapsed = false, onToggle = () => {} }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Define a type for sidebar items
  interface SidebarItemData {
    icon: React.ReactNode;
    label: string;
    href: string;
    className?: string;
    subItems?: {
      label: string;
      href: string;
      icon?: React.ReactNode;
    }[];
  }

  // Then use this type for the array:
  const userSidebarItems: SidebarItemData[] = [
    {
      icon: <PlusCircle className="h-5 w-5" />,
      label: "Create AI Instance",
      href: "#",
      className: "create-instance-btn",
      subItems: []
    },
    {
      icon: <Circle className="h-5 w-5" />,
      label: "AI Instances",
      href: "/dashboard/agents",
      subItems: [
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
      subItems: []
    },
    {
      icon: <UsersRound className="h-5 w-5" />,
      label: "User Sync",
      href: "/dashboard/user-sync",
      subItems: []
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: "Moderation",
      href: "/dashboard/moderation",
      subItems: []
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: "Email Templates",
      href: "/dashboard/email-templates",
      subItems: []
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Billing",
      href: "/dashboard/billing",
      subItems: []
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Workflows",
      href: "/dashboard/workflows",
      subItems: []
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Analytics",
      href: "/dashboard/analytics",
      subItems: []
    },
    {
      icon: <Database className="h-5 w-5" />,
      label: "Database",
      href: "/dashboard/database",
      subItems: []
    },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-white transition-all dark:border-gray-800 dark:bg-gray-950",
        collapsed ? "w-16" : "w-64",
      )}
    >
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
              subItems={item.subItems || []}
              collapsed={collapsed}
              className={item.className}
            />
          ))}

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
                  />
                ))}
              </div>
            </>
          )}
        </nav>
      </div>
      <div className="mt-auto border-t p-2 dark:border-gray-800">
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
      </div>
    </aside>
  );
};

export interface DashboardLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

const DashboardLayout = ({ children, isAdmin = false }: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user, signOut } = useAuth();
  const { searchTerm, setSearchTerm } = useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for dark mode preference
    const savedDarkMode = safeLocalStorage.getItem("darkMode");
    if (savedDarkMode === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    safeLocalStorage.setItem("darkMode", newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      
      // Navigate to home page after sign out
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Logout Error",
        description: "There was an issue logging out.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for desktop */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform overflow-y-auto bg-white transition-transform duration-300 ease-in-out dark:bg-gray-950 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4 dark:border-gray-800">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-primary"
          >
            <Shield className="h-6 w-6" />
            <span className="text-xl">Akii</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="py-4">
          <nav className="grid gap-1 px-2">
            {/* Mobile navigation items */}
            {/* ... */}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64",
        )}
      >
        {/* Top navigation */}
        <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search */}
          <div className="relative ml-2 flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg border border-gray-200 bg-white pl-8 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-primary dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full border border-gray-200 dark:border-gray-800"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.user_metadata?.avatar_url || undefined}
                      alt={user?.email || "User"}
                    />
                    <AvatarFallback>
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.email && <p className="font-medium">{user.email}</p>}
                    {user?.user_metadata?.name && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.user_metadata.name}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/settings"
                    className="flex w-full cursor-pointer items-center"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/settings"
                    className="flex w-full cursor-pointer items-center"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/help"
                    className="flex w-full cursor-pointer items-center"
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex w-full cursor-pointer items-center text-red-500 focus:text-red-500"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          <DashboardPageContainer>
            {children}
          </DashboardPageContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
