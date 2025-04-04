import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-compatibility";
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
} from "lucide-react";

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
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggle = () => {},
  isAdmin: propIsAdmin,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, isAdmin: contextIsAdmin } = useAuth();
  const currentPath = location.pathname;
  
  const [directAdminStatus, setDirectAdminStatus] = useState<boolean | null>(null);
  
  // Perform a direct check to the database to verify admin status
  useEffect(() => {
    if (user?.id && !contextIsAdmin) {
      const checkAdminDirectly = async () => {
        try {
          // Import dynamically to avoid circular dependencies
          const { checkIsAdmin } = await import('@/lib/supabase-auth');
          const isUserAdmin = await checkIsAdmin(user.id);
          console.log(`Sidebar - Direct admin check for user ${user.id}: ${isUserAdmin}`);
          setDirectAdminStatus(isUserAdmin);
        } catch (e) {
          console.warn("Error checking admin status directly:", e);
          setDirectAdminStatus(false);
        }
      };
      
      checkAdminDirectly();
    }
  }, [user?.id, contextIsAdmin]);
  
  // Determine admin status: if prop is true OR context says user is admin OR direct check says admin
  const isAdmin = propIsAdmin === true || contextIsAdmin === true || directAdminStatus === true;
  
  // Only log status changes or non-null profiles to reduce console spam
  const shouldLog = profile !== null || directAdminStatus !== null;
  
  useEffect(() => {
    if (shouldLog) {
      console.log('Sidebar Component - Admin Status:', { 
        propIsAdmin, 
        contextIsAdmin, 
        directAdminStatus,
        isAdmin,
        currentPath,
        profile: profile ? `${profile.id} (${profile.role})` : null
      });
    }
  }, [propIsAdmin, contextIsAdmin, directAdminStatus, isAdmin, currentPath, profile, shouldLog]);

  // State to track expanded sections
  const [expandedSections, setExpandedSections] = useState<{
    apps: boolean;
    adminGeneral: boolean;
    adminContent: boolean;
    adminCompliance: boolean;
    adminPartners: boolean;
    adminMigrations: boolean;
    adminTechnical: boolean;
  }>({
    apps: true,
    adminGeneral: true,
    adminContent: false,
    adminCompliance: false,
    adminPartners: false,
    adminMigrations: false,
    adminTechnical: false,
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
    // Dashboard & General
    { to: "/admin/dashboard", icon: <Gauge className="h-5 w-5" />, label: "Admin Dashboard" },
    { to: "/admin/users", icon: <Users className="h-5 w-5" />, label: "Users" },
    { to: "/admin/billing", icon: <CreditCard className="h-5 w-5" />, label: "Billing" },
    { to: "/admin/settings", icon: <Settings className="h-5 w-5" />, label: "Settings" },
    
    // Content Management
    { to: "/admin/blog", icon: <BookOpen className="h-5 w-5" />, label: "Blog" },
    { to: "/admin/landing-pages", icon: <Layout className="h-5 w-5" />, label: "Landing Pages" },
    { to: "/admin/lead-magnets", icon: <FileIcon className="h-5 w-5" />, label: "Lead Magnets" },
    { to: "/admin/email-templates", icon: <MailIcon className="h-5 w-5" />, label: "Email Templates" },
    
    // Compliance & Security
    { to: "/admin/compliance", icon: <Shield className="h-5 w-5" />, label: "Compliance" },
    { to: "/admin/moderation", icon: <ListFilter className="h-5 w-5" />, label: "Moderation" },
    
    // Partners
    { to: "/admin/affiliates", icon: <Users className="h-5 w-5" />, label: "Affiliates" },
    { to: "/admin/packages", icon: <Package className="h-5 w-5" />, label: "Packages" },
    
    // Migrations & System
    { to: "/admin/user-sync", icon: <UserCheck className="h-5 w-5" />, label: "User Sync" },
    { to: "/admin/user-status-migration", icon: <RefreshCcw className="h-5 w-5" />, label: "Status Migration" },
    { to: "/admin/user-profile-migration", icon: <User className="h-5 w-5" />, label: "Profile Migration" },
    { to: "/admin/run-migration", icon: <RefreshCcw className="h-5 w-5" />, label: "Run Migration" },
    
    // Technical
    { to: "/admin/workflows", icon: <Workflow className="h-5 w-5" />, label: "Workflows" },
    { to: "/admin/n8n-workflows", icon: <Zap className="h-5 w-5" />, label: "n8n Workflows" },
    { to: "/admin/database-schema", icon: <Database className="h-5 w-5" />, label: "Database Schema" },
    { to: "/admin/manage-instances", icon: <Cloud className="h-5 w-5" />, label: "AI Instances" },
    { to: "/admin/bedrock", icon: <Box className="h-5 w-5" />, label: "Bedrock AI" },
    { to: "/admin/supabase-bedrock", icon: <Box className="h-5 w-5" />, label: "Supabase Bedrock" },
    { to: "/admin/supabase-check", icon: <CheckCircle className="h-5 w-5" />, label: "Supabase Check" },
    { to: "/admin/admin-check", icon: <AlertTriangle className="h-5 w-5" />, label: "Admin Check" },
  ];
  
  // Define bottom links (settings, help, etc.)
  const bottomLinks = [
    { to: "/help", icon: <HelpCircle className="h-5 w-5" />, label: "Help & Support" },
  ];
  
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
              {/* General Admin Links */}
              {!isCollapsed && (
                <SidebarLink
                  to="#"
                  icon={<div className="text-red-600 dark:text-red-400"><Gauge className="h-5 w-5" /></div>}
                  label="General"
                  isActive={currentPath.includes("/admin/dashboard") || 
                            currentPath.includes("/admin/users") || 
                            currentPath.includes("/admin/billing") ||
                            currentPath.includes("/admin/settings")}
                  isCollapsed={isCollapsed}
                  onClick={() => toggleSection('adminGeneral')}
                  hasChildren={true}
                  isExpanded={expandedSections.adminGeneral}
                />
              )}
              
              {(expandedSections.adminGeneral || isCollapsed) && (
                <>
                  {adminLinks.slice(0, 4).map((link) => (
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
                  onClick={() => toggleSection('adminContent')}
                  hasChildren={true}
                  isExpanded={expandedSections.adminContent}
                />
              )}
              
              {expandedSections.adminContent && !isCollapsed && (
                <>
                  {adminLinks.slice(4, 8).map((link) => (
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
                  isActive={currentPath.includes("/admin/compliance") || 
                            currentPath.includes("/admin/moderation")}
                  isCollapsed={isCollapsed}
                  onClick={() => toggleSection('adminCompliance')}
                  hasChildren={true}
                  isExpanded={expandedSections.adminCompliance}
                />
              )}
              
              {expandedSections.adminCompliance && !isCollapsed && (
                <>
                  {adminLinks.slice(8, 10).map((link) => (
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
                  isActive={currentPath.includes("/admin/affiliates") || 
                            currentPath.includes("/admin/packages")}
                  isCollapsed={isCollapsed}
                  onClick={() => toggleSection('adminPartners')}
                  hasChildren={true}
                  isExpanded={expandedSections.adminPartners}
                />
              )}
              
              {expandedSections.adminPartners && !isCollapsed && (
                <>
                  {adminLinks.slice(10, 12).map((link) => (
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
                  isActive={currentPath.includes("/admin/user-sync") || 
                            currentPath.includes("/admin/user-status-migration") || 
                            currentPath.includes("/admin/user-profile-migration") ||
                            currentPath.includes("/admin/run-migration")}
                  isCollapsed={isCollapsed}
                  onClick={() => toggleSection('adminMigrations')}
                  hasChildren={true}
                  isExpanded={expandedSections.adminMigrations}
                />
              )}
              
              {expandedSections.adminMigrations && !isCollapsed && (
                <>
                  {adminLinks.slice(12, 16).map((link) => (
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
                  isActive={currentPath.includes("/admin/workflows") || 
                            currentPath.includes("/admin/n8n-workflows") || 
                            currentPath.includes("/admin/database-schema") ||
                            currentPath.includes("/admin/manage-instances") || 
                            currentPath.includes("/admin/bedrock") ||
                            currentPath.includes("/admin/supabase-bedrock") ||
                            currentPath.includes("/admin/supabase-check") || 
                            currentPath.includes("/admin/admin-check")}
                  isCollapsed={isCollapsed}
                  onClick={() => toggleSection('adminTechnical')}
                  hasChildren={true}
                  isExpanded={expandedSections.adminTechnical}
                />
              )}
              
              {expandedSections.adminTechnical && !isCollapsed && (
                <>
                  {adminLinks.slice(16).map((link) => (
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