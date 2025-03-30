import React from "react";
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
  // Check for admin role or specific email
  const isAdmin = userRole === "admin" || user?.email === "josef@holm.com";

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
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-xl font-bold text-primary-foreground">
              A
            </div>
          ) : (
            <div className="flex h-10 items-center gap-2 rounded-md bg-primary px-3 text-xl font-bold text-primary-foreground">
              <span>Akii</span>
              <span className="text-sm font-normal opacity-70">
                AI Platform
              </span>
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
