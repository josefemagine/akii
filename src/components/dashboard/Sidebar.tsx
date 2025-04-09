import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { cn } from "@/lib/utils";
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
  PlusCircle,
  Gauge,
  RefreshCcw,
  Code,
  Lock,
  Layout,
  MailIcon,
  FileIcon,
  BadgeCheck,
  File,
  BookOpen,
  LifeBuoy,
  ListFilter,
  Workflow,
  Fingerprint,
  Zap,
  CheckCircle,
  User,
  AlertTriangle,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Cloud,
  Box,
  LayoutDashboard,
  DollarSign,
  PenTool,
  Magnet,
  Mail,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Profile } from "@/types/auth";

// Common sidebar link component
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

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggle = () => {},
  isAdmin: propIsAdmin,
  isSuperAdmin: propIsSuperAdmin,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, isAdmin: contextIsAdmin } = useAuth();
  const { isSuperAdmin, isLoading: superAdminLoading } = useSuperAdmin();
  const { toast } = useToast();
  const currentPath = location.pathname;
  
  // Determine admin status from either props or context
  const isAdmin = propIsAdmin || contextIsAdmin;
  
  // Use either the prop value (if provided) or the hook value
  const isSuperAdminUser = propIsSuperAdmin || isSuperAdmin;

  // Track expanded states for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    team: false,
    ai: false,
    admin: false,
    channels: false,
  });

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  // Handle sign out with proper error handling
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      navigate('/');
    } catch (error) {
      console.error("[Sidebar] Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Define main navigation links (visible to all users)
  const mainLinks = [
    { to: "/dashboard/ai-instances", icon: <Bot className="h-5 w-5" />, label: "AI Instances" },
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
  ];

  // Additional main links that come after the Apps section
  const additionalMainLinks = [
    { to: "/dashboard/analytics", icon: <BarChart2 className="h-5 w-5" />, label: "Analytics" },
    { to: "/dashboard/api-keys", icon: <Key className="h-5 w-5" />, label: "API Keys" },
    { to: "/dashboard/team", icon: <Users className="h-5 w-5" />, label: "Team" },
    { to: "/dashboard/settings", icon: <Settings className="h-5 w-5" />, label: "Settings" },
  ];

  // Define admin links (settings, users, etc.)
  const adminLinks = [
    { to: "/dashboard/admin", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
    { to: "/dashboard/admin/supabase-bedrock", icon: <Box className="h-5 w-5" />, label: "Bedrock Instances" },
    { to: "/dashboard/admin/users", icon: <Users className="h-5 w-5" />, label: "Users" },
    { to: "/dashboard/admin/manage-plans", icon: <DollarSign className="h-5 w-5" />, label: "Plans" },
    { to: "/dashboard/admin/settings", icon: <Settings className="h-5 w-5" />, label: "Settings" },
    
    // Content
    { to: "/dashboard/admin/blog", icon: <PenTool className="h-5 w-5" />, label: "Blog" },
    { to: "/dashboard/admin/landing-pages", icon: <Layout className="h-5 w-5" />, label: "Landing Pages" },
    { to: "/dashboard/admin/lead-magnets", icon: <Magnet className="h-5 w-5" />, label: "Lead Magnets" },
    { to: "/dashboard/admin/email-templates", icon: <Mail className="h-5 w-5" />, label: "Email Templates" },
    
    // Compliance & Security
    { to: "/dashboard/admin/compliance", icon: <Shield className="h-5 w-5" />, label: "Compliance" },
    
    // Partners
    { to: "/dashboard/admin/packages", icon: <Package className="h-5 w-5" />, label: "Packages" },
    { to: "/dashboard/admin/affiliates", icon: <Users className="h-5 w-5" />, label: "Affiliates" },
    { to: "/dashboard/admin/billing", icon: <CreditCard className="h-5 w-5" />, label: "Billing" },
    
    // Migrations
    { to: "/dashboard/admin/user-status-migration", icon: <User className="h-5 w-5" />, label: "Status Migration" },
    { to: "/dashboard/admin/user-profile-migration", icon: <User className="h-5 w-5" />, label: "Profile Migration" },
    { to: "/dashboard/admin/run-migration", icon: <RefreshCcw className="h-5 w-5" />, label: "Run Migration" },
    
    // Technical
    { to: "/dashboard/admin/workflows", icon: <Workflow className="h-5 w-5" />, label: "Workflows" },
    { to: "/dashboard/admin/n8n-workflows", icon: <Zap className="h-5 w-5" />, label: "n8n Workflows" },
    { to: "/dashboard/admin/database-schema", icon: <Database className="h-5 w-5" />, label: "Database Schema" },
    { to: "/dashboard/admin/manage-instances", icon: <Cloud className="h-5 w-5" />, label: "AI Instances" },
    { to: "/dashboard/admin/supabase-check", icon: <CheckCircle className="h-5 w-5" />, label: "Supabase Check" },
    { to: "/dashboard/admin/admin-check", icon: <AlertTriangle className="h-5 w-5" />, label: "Admin Check" },
  ];
  
  // Define bottom links (settings, help, etc.)
  const bottomLinks = [
    { to: "/help", icon: <HelpCircle className="h-5 w-5" />, label: "Help & Support" },
  ];
  
  // Check if any app link is active
  const isAppSectionActive = appLinks.some(link => 
    currentPath === link.to || currentPath.startsWith(link.to + '/')
  );

  // Admin section rendering
  const renderAdminSection = () => {
    // Only show admin section for regular admins or super admins
    if (!isAdmin && !isSuperAdminUser) return null;
    
    return (
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground">
          {!isCollapsed && "Admin Menu"}
          {isCollapsed && <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />}
        </h2>
        <div className="space-y-1">
          {/* Admin Links - Available to both admin and super admin */}
          <div className="px-3 py-2">
            <div className="space-y-1">
              {/* Core Admin Pages */}
              <SidebarLink
                to="/dashboard/admin/dashboard"
                icon={<LayoutDashboard className="h-5 w-5" />}
                label="Admin Dashboard"
                isActive={currentPath.includes("/dashboard/admin/dashboard")}
                isCollapsed={isCollapsed}
              />
              <SidebarLink
                to="/dashboard/admin/users"
                icon={<Users className="h-5 w-5" />}
                label="Users Management"
                isActive={currentPath.includes("/dashboard/admin/users") && !currentPath.includes("usersync") && !currentPath.includes("userstatus")}
                isCollapsed={isCollapsed}
              />
              <SidebarLink
                to="/dashboard/admin/database-schema"
                icon={<Database className="h-5 w-5" />}
                label="Database Schema"
                isActive={currentPath.includes("/dashboard/admin/database-schema")}
                isCollapsed={isCollapsed}
              />
              <SidebarLink
                to="/dashboard/admin/settings"
                icon={<Settings className="h-5 w-5" />}
                label="Settings"
                isActive={currentPath.includes("/dashboard/admin/settings")}
                isCollapsed={isCollapsed}
              />
              <SidebarLink
                to="/dashboard/admin/billing"
                icon={<CreditCard className="h-5 w-5" />}
                label="Billing"
                isActive={currentPath.includes("/dashboard/admin/billing")}
                isCollapsed={isCollapsed}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-20 hidden h-full transition-all lg:flex",
        isCollapsed ? "w-16" : "w-[240px]"
      )}
    >
      <div className="flex h-full w-full flex-col overflow-y-auto bg-gray-950 p-0">
        {/* Empty space where logo was */}
        <div className="pt-[80px]"></div>

        {/* Main navigation */}
        <nav className="space-y-1 pl-3">
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
            onClick={() => toggleSection('ai')}
            hasChildren={true}
            isExpanded={expandedSections.ai}
          />
          
          {/* App sub-links */}
          {expandedSections.ai && !isCollapsed && (
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
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
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
              {/* Top-level Admin Links (Dashboard, Supabase Bedrock, Users, Plans) */}
              <SidebarLink
                key={adminLinks[0].to}
                to={adminLinks[0].to}
                icon={
                  <div className="text-red-600 dark:text-red-400">
                    {adminLinks[0].icon}
                  </div>
                }
                label={adminLinks[0].label}
                isActive={currentPath.includes(adminLinks[0].to)}
                isCollapsed={isCollapsed}
              />
              
              <SidebarLink
                key={adminLinks[1].to}
                to={adminLinks[1].to}
                icon={
                  <div className="text-red-600 dark:text-red-400">
                    {adminLinks[1].icon}
                  </div>
                }
                label={adminLinks[1].label}
                isActive={currentPath.includes(adminLinks[1].to)}
                isCollapsed={isCollapsed}
              />
              
              <SidebarLink
                key={adminLinks[2].to}
                to={adminLinks[2].to}
                icon={
                  <div className="text-red-600 dark:text-red-400">
                    {adminLinks[2].icon}
                  </div>
                }
                label={adminLinks[2].label}
                isActive={currentPath.includes(adminLinks[2].to)}
                isCollapsed={isCollapsed}
              />
              
              <SidebarLink
                key={adminLinks[3].to}
                to={adminLinks[3].to}
                icon={
                  <div className="text-red-600 dark:text-red-400">
                    {adminLinks[3].icon}
                  </div>
                }
                label={adminLinks[3].label}
                isActive={currentPath.includes(adminLinks[3].to)}
                isCollapsed={isCollapsed}
              />

              {/* General Admin Links */}
              {!isCollapsed && (
                <SidebarLink
                  to="#"
                  icon={<div className="text-red-600 dark:text-red-400"><Gauge className="h-5 w-5" /></div>}
                  label="General"
                  isActive={currentPath.includes("/admin/settings")}
                  isCollapsed={isCollapsed}
                  onClick={() => toggleSection('admin')}
                  hasChildren={true}
                  isExpanded={expandedSections.admin}
                />
              )}
              
              {(expandedSections.admin || isCollapsed) && (
                <>
                  {adminLinks.slice(4, 5).map((link) => (
                    <SidebarLink
                      key={link.to}
                      to={link.to}
                      icon={
                        <div className="text-red-600 dark:text-red-400">
                          {link.icon}
                        </div>
                      }
                      label={link.label}
                      isActive={currentPath.includes(link.to)}
                      isCollapsed={isCollapsed}
                    />
                  ))}
                </>
              )}

              {/* Content Management */}
              {!isCollapsed && (
                <SidebarLink
                  to="#"
                  icon={<div className="text-red-600 dark:text-red-400"><Layout className="h-5 w-5" /></div>}
                  label="Content"
                  isActive={currentPath.includes("/admin/blog") || 
                            currentPath.includes("/admin/landing-pages") || 
                            currentPath.includes("/admin/lead-magnets") ||
                            currentPath.includes("/admin/email-templates")}
                  isCollapsed={isCollapsed}
                  onClick={() => toggleSection('channels')}
                  hasChildren={true}
                  isExpanded={expandedSections.channels}
                />
              )}
              
              {expandedSections.channels && !isCollapsed && (
                <>
                  {adminLinks.slice(5, 8).map((link) => (
                    <NestedLink
                      key={link.to}
                      to={link.to}
                      icon={
                        <div className="text-red-600 dark:text-red-400">
                          {link.icon}
                        </div>
                      }
                      label={link.label}
                      isActive={currentPath.includes(link.to)}
                      isCollapsed={isCollapsed}
                    />
                  ))}
                </>
              )}
              
              {/* Compliance & Security */}
              {!isCollapsed && (
                <SidebarLink
                  to="#"
                  icon={<div className="text-red-600 dark:text-red-400"><Shield className="h-5 w-5" /></div>}
                  label="Compliance"
                  isActive={currentPath.includes("/dashboard/admin/compliance") || 
                            currentPath.includes("/dashboard/admin/moderation")}
                  isCollapsed={isCollapsed}
                  onClick={() => toggleSection('admin')}
                  hasChildren={true}
                  isExpanded={expandedSections.admin}
                />
              )}
              
              {expandedSections.admin && !isCollapsed && (
                <>
                  {adminLinks.slice(8, 9).map((link) => (
                    <NestedLink
                      key={link.to}
                      to={link.to}
                      icon={
                        <div className="text-red-600 dark:text-red-400">
                          {link.icon}
                        </div>
                      }
                      label={link.label}
                      isActive={currentPath.includes(link.to)}
                      isCollapsed={isCollapsed}
                    />
                  ))}
                </>
              )}
              
              {/* Partners */}
              {!isCollapsed && (
                <SidebarLink
                  to="#"
                  icon={<div className="text-red-600 dark:text-red-400"><Users className="h-5 w-5" /></div>}
                  label="Partners"
                  isActive={currentPath.includes("/dashboard/admin/affiliates") || 
                            currentPath.includes("/dashboard/admin/packages") ||
                            currentPath.includes("/dashboard/admin/billing")}
                  isCollapsed={isCollapsed}
                  onClick={() => toggleSection('admin')}
                  hasChildren={true}
                  isExpanded={expandedSections.admin}
                />
              )}
              
              {expandedSections.admin && !isCollapsed && (
                <>
                  {[adminLinks[10], adminLinks[11], adminLinks[12]].map((link) => (
                    <NestedLink
                      key={link.to}
                      to={link.to}
                      icon={
                        <div className="text-red-600 dark:text-red-400">
                          {link.icon}
                        </div>
                      }
                      label={link.label}
                      isActive={currentPath.includes(link.to)}
                      isCollapsed={isCollapsed}
                    />
                  ))}
                </>
              )}
              
              {/* Migrations */}
              {!isCollapsed && (
                <SidebarLink
                  to="#"
                  icon={<div className="text-red-600 dark:text-red-400"><RefreshCcw className="h-5 w-5" /></div>}
                  label="Migrations"
                  isActive={currentPath.includes("/dashboard/admin/user-sync") || 
                            currentPath.includes("/dashboard/admin/user-status-migration") || 
                            currentPath.includes("/dashboard/admin/user-profile-migration") ||
                            currentPath.includes("/dashboard/admin/run-migration")}
                  isCollapsed={isCollapsed}
                  onClick={() => toggleSection('admin')}
                  hasChildren={true}
                  isExpanded={expandedSections.admin}
                />
              )}
              
              {expandedSections.admin && !isCollapsed && (
                <>
                  {adminLinks.slice(13, 17).map((link) => (
                    <NestedLink
                      key={link.to}
                      to={link.to}
                      icon={
                        <div className="text-red-600 dark:text-red-400">
                          {link.icon}
                        </div>
                      }
                      label={link.label}
                      isActive={currentPath.includes(link.to)}
                      isCollapsed={isCollapsed}
                    />
                  ))}
                </>
              )}
              
              {/* Technical */}
              {!isCollapsed && (
                <SidebarLink
                  to="#"
                  icon={<div className="text-red-600 dark:text-red-400"><Database className="h-5 w-5" /></div>}
                  label="Technical"
                  isActive={currentPath.includes("/dashboard/admin/workflows") || 
                            currentPath.includes("/dashboard/admin/n8n-workflows") || 
                            currentPath.includes("/dashboard/admin/database-schema") ||
                            currentPath.includes("/dashboard/admin/manage-instances") || 
                            currentPath.includes("/dashboard/admin/supabase-check") || 
                            currentPath.includes("/dashboard/admin/admin-check")}
                  isCollapsed={isCollapsed}
                  onClick={() => toggleSection('admin')}
                  hasChildren={true}
                  isExpanded={expandedSections.admin}
                />
              )}
              
              {expandedSections.admin && !isCollapsed && (
                <>
                  {adminLinks.slice(17).map((link) => (
                    <NestedLink
                      key={link.to}
                      to={link.to}
                      icon={
                        <div className="text-red-600 dark:text-red-400">
                          {link.icon}
                        </div>
                      }
                      label={link.label}
                      isActive={currentPath.includes(link.to)}
                      isCollapsed={isCollapsed}
                    />
                  ))}
                </>
              )}
              
              {/* Show all links in collapsed mode without categories */}
              {isCollapsed && (
                <>
                  {adminLinks.slice(4).map((link) => (
                    <SidebarLink
                      key={link.to}
                      to={link.to}
                      icon={
                        <div className="text-red-600 dark:text-red-400">
                          {link.icon}
                        </div>
                      }
                      label={link.label}
                      isActive={currentPath.includes(link.to)}
                      isCollapsed={isCollapsed}
                    />
                  ))}
                </>
              )}
            </nav>
          </div>
        )}

        {/* Admin Section */}
        {renderAdminSection()}

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
          
          {/* Collapse toggle button */}
          <button
            onClick={onToggle}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground mt-4 border-t dark:border-gray-800 pt-4",
              isCollapsed ? "justify-center" : "",
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <div className="w-5 h-5 flex items-center justify-center overflow-hidden shrink-0">
              {isCollapsed ? (
                <PanelLeftOpen className="w-[18px] h-[18px]" size={18} strokeWidth={2} />
              ) : (
                <PanelLeftClose className="w-[18px] h-[18px]" size={18} strokeWidth={2} />
              )}
            </div>
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 