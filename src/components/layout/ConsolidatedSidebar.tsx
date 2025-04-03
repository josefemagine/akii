import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { safeLocalStorage } from "@/lib/browser-check";
import {
  Home,
  FileText,
  Users,
  Settings,
  LogOut,
  MessageSquare,
  Bot,
  Layers,
  Shield,
  UserCheck,
  Database,
  CreditCard,
  BarChart2,
  Globe,
  MessageCircle,
  FileUp,
  ClipboardList,
  Key,
  Server,
  HelpCircle,
  Circle,
  ChevronRight,
  ChevronDown,
  Smartphone,
  Send,
  ShoppingBag,
  Monitor,
} from "lucide-react";

// This is the single source of truth for all sidebar links and navigation
// Any changes to navigation structure should be made here

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  badge?: string | number;
  onClick?: () => void;
  hasChildren?: boolean;
  isExpanded?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  to,
  icon,
  label,
  isActive,
  isCollapsed,
  badge,
  onClick,
  hasChildren,
  isExpanded,
}) => {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          isCollapsed ? "justify-center" : ""
        )}
      >
        <div className="w-5 h-5 flex items-center justify-center overflow-hidden shrink-0">
          {icon}
        </div>
        {!isCollapsed && <span className="flex-1 text-left">{label}</span>}
        {!isCollapsed && hasChildren && (
          <div className="ml-auto">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        )}
      </button>
    );
  }

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        isCollapsed ? "justify-center" : ""
      )}
    >
      <div className="w-5 h-5 flex items-center justify-center overflow-hidden shrink-0">
        {icon}
      </div>
      {!isCollapsed && <span>{label}</span>}
      {!isCollapsed && badge && (
        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {badge}
        </span>
      )}
    </Link>
  );
};

// Simple nested link component for sub-items
const NestedLink: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
}> = ({ to, icon, label, isActive, isCollapsed }) => {
  if (isCollapsed) return null;
  
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ml-5",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <div className="w-5 h-5 flex items-center justify-center overflow-hidden shrink-0">
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  );
};

interface ConsolidatedSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const ConsolidatedSidebar: React.FC<ConsolidatedSidebarProps> = ({
  isCollapsed = false,
  onToggle = () => {},
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, userRole, isAdmin } = useAuth();
  const currentPath = location.pathname;
  
  // State to track expanded sections
  const [expandedSections, setExpandedSections] = useState<{
    apps: boolean;
  }>({
    apps: true,
  });

  // Toggle expanded section
  const toggleSection = (section: keyof typeof expandedSections) => {
    if (!isCollapsed) {
      setExpandedSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    }
  };
  
  // Define main navigation links (visible to all users)
  const mainLinks = [
    { to: "/dashboard", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
    { to: "/dashboard/agents", icon: <Bot className="h-5 w-5" />, label: "AI Instances" },
    { to: "/dashboard/documents", icon: <FileText className="h-5 w-5" />, label: "Training Data" },
    {
      to: "/dashboard/conversations",
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Conversations",
    },
  ];

  // Define app sub-links
  const appLinks = [
    { to: "/dashboard/web-chat", icon: <Monitor className="h-5 w-5" />, label: "Web Chat" },
    { to: "/dashboard/mobile-chat", icon: <Smartphone className="h-5 w-5" />, label: "Mobile Chat" },
    { to: "/dashboard/whatsapp-chat", icon: <MessageCircle className="h-5 w-5" />, label: "WhatsApp Chat" },
    { to: "/dashboard/telegram-chat", icon: <Send className="h-5 w-5" />, label: "Telegram Chat" },
    { to: "/dashboard/shopify-chat", icon: <ShoppingBag className="h-5 w-5" />, label: "Shopify Chat" },
    { to: "/dashboard/wordpress-chat", icon: <Globe className="h-5 w-5" />, label: "WordPress Chat" },
    { to: "/dashboard/private-ai", icon: <Server className="h-5 w-5" />, label: "Private AI API" },
  ];

  // Additional main links that come after the Apps section
  const additionalMainLinks = [
    { to: "/dashboard/team", icon: <Users className="h-5 w-5" />, label: "Team" },
    { to: "/dashboard/settings", icon: <Settings className="h-5 w-5" />, label: "Settings" },
  ];

  // Define admin navigation links (now visible to all users)
  const adminLinks = [
    { to: "/admin/users", icon: <Users className="h-5 w-5" />, label: "Users" },
    { to: "/admin/user-sync", icon: <UserCheck className="h-5 w-5" />, label: "User Sync" },
    { to: "/admin/users-page", icon: <Users className="h-5 w-5" />, label: "Users Page" },
    { to: "/admin/moderation", icon: <Shield className="h-5 w-5" />, label: "Moderation" },
    {
      to: "/admin/email-templates",
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Email Templates",
    },
    { to: "/admin/billing", icon: <CreditCard className="h-5 w-5" />, label: "Billing" },
    { to: "/admin/workflows", icon: <Layers className="h-5 w-5" />, label: "Workflows" },
    { to: "/admin/n8n-workflows", icon: <Layers className="h-5 w-5" />, label: "n8n Workflows" },
    {
      to: "/admin/database-schema",
      icon: <Database className="h-5 w-5" />,
      label: "Database Schema",
    },
    { to: "/admin/settings", icon: <Settings className="h-5 w-5" />, label: "Admin Settings" },
    { to: "/admin/check", icon: <Shield className="h-5 w-5" />, label: "Admin Check" },
    { to: "/admin/supabase-check", icon: <Database className="h-5 w-5" />, label: "Supabase Check" },
    { to: "/admin/affiliates", icon: <ClipboardList className="h-5 w-5" />, label: "Affiliates" },
    { to: "/admin/blog", icon: <FileText className="h-5 w-5" />, label: "Blog" },
    { to: "/admin/compliance", icon: <Shield className="h-5 w-5" />, label: "Compliance" },
    { to: "/admin/dashboard", icon: <BarChart2 className="h-5 w-5" />, label: "Dashboard" },
    { to: "/admin/landing-pages", icon: <Globe className="h-5 w-5" />, label: "Landing Pages" },
    {
      to: "/admin/lead-magnets",
      icon: <MessageCircle className="h-5 w-5" />,
      label: "Lead Magnets",
    },
    { to: "/admin/packages", icon: <FileText className="h-5 w-5" />, label: "Packages" },
    { to: "/admin/run-migration", icon: <FileUp className="h-5 w-5" />, label: "Run Migration" },
    {
      to: "/admin/user-status-migration",
      icon: <UserCheck className="h-5 w-5" />,
      label: "User Status Migration",
    },
  ];

  // Define bottom links (settings, help, etc.)
  const bottomLinks = [
    { to: "/help", icon: <HelpCircle className="h-5 w-5" />, label: "Help & Support" },
  ];

  // Add admin dashboard link to bottom links if user is admin
  if (isAdmin) {
    bottomLinks.unshift({
      to: "/admin/dashboard",
      icon: <Shield className="h-5 w-5" />,
      label: "Admin Dashboard",
    });
  }

  const handleLogout = async () => {
    try {
      if (signOut) {
        await signOut();
        navigate("/");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Check if any app link is active
  const isAppSectionActive = appLinks.some(link => 
    currentPath === link.to || currentPath.startsWith(link.to + '/')
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-20 hidden h-full transition-all lg:flex",
        isCollapsed ? "w-16" : "w-[200px]"
      )}
    >
      <div className="flex h-full w-full flex-col overflow-y-auto bg-gray-950 p-0">
        {/* Logo/Brand */}
        <div className={cn(
          "flex items-center py-3 pl-3",
          isCollapsed ? "justify-center" : "justify-start",
        )}>
          {isCollapsed ? (
            <div className="relative flex h-10 w-10 items-center justify-center">
              <Circle className="h-8 w-8 fill-green-500 text-green-500" />
              {isAdmin && (
                <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-600 rounded-full">
                  <span className="text-[8px] font-bold text-white">A</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Circle className="h-6 w-6 fill-green-500 text-green-500" />
              <span className="text-xl font-bold">Akii</span>
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

        {/* Main navigation */}
        <nav className="space-y-1 mt-3 pl-3">
          {/* Main links */}
          {mainLinks.map((link) => (
            <SidebarLink
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              isActive={currentPath === link.to || currentPath.startsWith(link.to + '/')}
              isCollapsed={isCollapsed}
            />
          ))}

          {/* Apps section with nested links */}
          <SidebarLink
            to="#"
            icon={<Layers className="h-5 w-5" />}
            label="Apps"
            isActive={isAppSectionActive}
            isCollapsed={isCollapsed}
            onClick={() => toggleSection('apps')}
            hasChildren={true}
            isExpanded={expandedSections.apps}
          />
          
          {/* App sub-links */}
          {expandedSections.apps && !isCollapsed && (
            <div className="space-y-1 pl-0">
              {appLinks.map((link) => (
                <NestedLink
                  key={link.to}
                  to={link.to}
                  icon={link.icon}
                  label={link.label}
                  isActive={currentPath === link.to || currentPath.startsWith(link.to + '/')}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          )}

          {/* Additional main links that come after the Apps section */}
          {additionalMainLinks.map((link) => (
            <SidebarLink
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              isActive={currentPath === link.to || currentPath.startsWith(link.to + '/')}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* Admin Navigation - visible only to admin users */}
        {isAdmin && (
          <div className={cn(
            "mt-6 pt-6 border-t border-gray-200 dark:border-gray-800",
            isCollapsed ? "px-1" : ""
          )}>
            {!isCollapsed && (
              <div className="px-3 mb-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  ADMIN
                </p>
              </div>
            )}
            {isCollapsed && (
              <div className="flex justify-center mb-2">
                <div 
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600/20 border border-red-600/50"
                  title="Admin Navigation"
                >
                  <Shield className="w-3 h-3 text-red-600" />
                </div>
              </div>
            )}
            <nav className={cn("space-y-1", isCollapsed ? "px-1" : "pl-3")}>
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
          </div>
        )}

        {/* Bottom Section - Help, Logout */}
        <div className="mt-auto pt-6 space-y-1 pl-3">
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
            <div className="w-5 h-5 flex items-center justify-center overflow-hidden shrink-0">
              <LogOut className="w-[18px] h-[18px]" size={18} strokeWidth={2} />
            </div>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ConsolidatedSidebar; 