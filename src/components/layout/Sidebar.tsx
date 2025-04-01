import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Bot,
  FileText,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  Users,
  MessageSquare,
  Layers,
  Server,
  Key,
  Shield,
  CreditCard,
  Database,
  Globe,
  MessageCircle,
  FileUp,
  UserCheck,
  ClipboardList,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isCollapsed?: boolean;
}

const SidebarLink = ({
  to,
  icon,
  label,
  isActive = false,
  isCollapsed = false,
}: SidebarLinkProps) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={to}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              isActive
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground",
              isCollapsed ? "justify-center" : "",
            )}
          >
            <div className={cn("h-5 w-5", isActive ? "text-primary" : "")}>
              {icon}
            </div>
            {!isCollapsed && <span>{label}</span>}
          </Link>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
};

interface SidebarProps {
  isCollapsed?: boolean;
}

const Sidebar = ({ isCollapsed = false }: SidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, userRole, signOut } = useAuth();

  // Set admin override for josef@holm.com on component mount
  useEffect(() => {
    if (user?.email === "josef@holm.com") {
      try {
        // Use a ref to track if we've already set the override to avoid infinite loops
        const adminOverrideSet = localStorage.getItem("admin_override_set");
        if (adminOverrideSet !== "true") {
          localStorage.setItem("akii_admin_override", "true");
          localStorage.setItem("akii_admin_override_email", "josef@holm.com");
          localStorage.setItem(
            "akii_admin_override_expiry",
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          );
          sessionStorage.setItem("admin_override", "true");
          sessionStorage.setItem("admin_override_email", "josef@holm.com");
          localStorage.setItem("admin_override_set", "true");
          console.log("Admin override set for josef@holm.com");
        }
      } catch (error) {
        console.error("Error setting admin override:", error);
      }
    }
  }, []); // Remove user?.email dependency to prevent re-renders

  // Force admin status for josef@holm.com and check multiple sources for admin role
  const adminOverrideInSession =
    sessionStorage.getItem("admin_override") === "true";
  const adminOverrideInLocalStorage =
    localStorage.getItem("akii_admin_override") === "true";

  // Always set isAdmin to true for josef@holm.com
  const isAdmin =
    user?.email === "josef@holm.com" ||
    userRole === "admin" ||
    adminOverrideInSession ||
    adminOverrideInLocalStorage ||
    user?.role === "admin";

  const mainLinks = [
    { to: "/dashboard", icon: <Home />, label: "Dashboard" },
    { to: "/dashboard/agents", icon: <Bot />, label: "AI Agents" },
    { to: "/dashboard/documents", icon: <FileText />, label: "Documents" },
    { to: "/dashboard/integrations", icon: <Layers />, label: "Integrations" },
    {
      to: "/dashboard/conversations",
      icon: <MessageSquare />,
      label: "Conversations",
    },
    { to: "/dashboard/analytics", icon: <BarChart2 />, label: "Analytics" },
    { to: "/dashboard/private-ai", icon: <Server />, label: "Private AI" },
    { to: "/dashboard/api-keys", icon: <Key />, label: "API Keys" },
    { to: "/dashboard/team", icon: <Users />, label: "Team" },
  ];

  // Admin links - updated to match all links in the image
  const adminLinks = [
    { to: "/admin/users", icon: <Users />, label: "Users" },
    { to: "/admin/user-sync", icon: <UserCheck />, label: "User Sync" },
    { to: "/admin/users-page", icon: <Users />, label: "Users Page" },
    { to: "/admin/moderation", icon: <Shield />, label: "Moderation" },
    {
      to: "/admin/email-templates",
      icon: <MessageSquare />,
      label: "Email Templates",
    },
    { to: "/admin/billing", icon: <CreditCard />, label: "Billing" },
    { to: "/admin/workflows", icon: <Layers />, label: "Workflows" },
    { to: "/admin/n8n-workflows", icon: <Layers />, label: "n8n Workflows" },
    {
      to: "/admin/database-schema",
      icon: <Database />,
      label: "Database Schema",
    },
    { to: "/admin/settings", icon: <Settings />, label: "Admin Settings" },
    { to: "/admin/check", icon: <Shield />, label: "Admin Check" },
    { to: "/admin/affiliates", icon: <ClipboardList />, label: "Affiliates" },
    { to: "/admin/blog", icon: <FileText />, label: "Blog" },
    { to: "/admin/compliance", icon: <Shield />, label: "Compliance" },
    { to: "/admin/dashboard", icon: <BarChart2 />, label: "Dashboard" },
    { to: "/admin/landing-pages", icon: <Globe />, label: "Landing Pages" },
    {
      to: "/admin/lead-magnets",
      icon: <MessageCircle />,
      label: "Lead Magnets",
    },
    { to: "/admin/packages", icon: <FileText />, label: "Packages" },
    { to: "/admin/run-migration", icon: <FileUp />, label: "Run Migration" },
    {
      to: "/admin/user-status-migration",
      icon: <UserCheck />,
      label: "User Status Migration",
    },
  ];

  const bottomLinks = [
    { to: "/dashboard/settings", icon: <Settings />, label: "Settings" },
    { to: "/help", icon: <HelpCircle />, label: "Help & Support" },
  ];

  // Add admin link if user has admin role
  if (isAdmin) {
    bottomLinks.unshift({
      to: "/admin",
      icon: <Shield />,
      label: "Admin Dashboard",
    });
  }

  const handleLogout = async () => {
    if (signOut) {
      await signOut();
    }
  };

  return (
    <aside
      className={cn(
        "flex h-screen flex-col justify-between border-r bg-background p-4 transition-all",
        isCollapsed ? "w-[80px]" : "w-[280px]",
      )}
    >
      <div className="flex flex-col gap-6">
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "px-2",
          )}
        >
          {isCollapsed ? (
            <div className="relative flex h-10 w-10 items-center justify-center rounded-md bg-primary text-xl font-bold text-primary-foreground">
              A
              {isAdmin && (
                <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-600 rounded-full">
                  <span className="text-[8px] font-bold text-white">A</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-10 items-center gap-2 rounded-md bg-primary px-3 text-xl font-bold text-primary-foreground">
              <span>Akii</span>
              <span className="text-sm font-normal opacity-70">
                AI Platform
              </span>
              {isAdmin && (
                <div className="flex items-center border border-red-600 dark:border-red-500 rounded-md px-2 py-0.5 ml-2">
                  <span className="text-xs font-medium text-red-600 dark:text-red-500">
                    Admin
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="space-y-1">
          {mainLinks.map((link) => (
            <SidebarLink
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              isActive={currentPath === link.to}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* Admin section - always show for josef@holm.com */}
        {(isAdmin || user?.email === "josef@holm.com") && (
          <>
            <div className={cn("mt-6", isCollapsed ? "text-center" : "px-3")}>
              <p className="text-xs font-semibold text-muted-foreground">
                ADMIN
              </p>
            </div>
            <nav className="space-y-1 max-h-[calc(100vh-400px)] overflow-y-auto">
              {adminLinks.map((link) => (
                <SidebarLink
                  key={link.to}
                  to={link.to}
                  icon={link.icon}
                  label={link.label}
                  isActive={currentPath.includes(link.to)}
                  isCollapsed={isCollapsed}
                />
              ))}
            </nav>
          </>
        )}
      </div>

      <div className="space-y-1">
        {bottomLinks.map((link) => (
          <SidebarLink
            key={link.to}
            to={link.to}
            icon={link.icon}
            label={link.label}
            isActive={currentPath === link.to}
            isCollapsed={isCollapsed}
          />
        ))}
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive",
            isCollapsed ? "justify-center" : "",
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
