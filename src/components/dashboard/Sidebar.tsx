import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/UnifiedAuthContext.tsx";
import { cn } from "@/lib/utils.ts";
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
  Workflow as WorkflowIcon,
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
  Menu,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast.ts";
import { Profile } from "@/types/auth.ts";
import { UserRepository } from "@/lib/database/user-repository";

// Custom SVG icon for workflows
const Workflow = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="8" y1="12" x2="16" y2="12"></line>
    <line x1="12" y1="16" x2="12" y2="16"></line>
    <line x1="12" y1="8" x2="12" y2="8"></line>
  </svg>
);

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
  const navigate = useNavigate();

  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    if (to && !onClick) {
      e.preventDefault();
      navigate(to);
    } else if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={cn(
        "flex items-center rounded-lg px-3 py-2 transition-all hover:text-primary",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-gray-400 hover:bg-gray-900",
        isCollapsed ? "justify-center" : "justify-start"
      )}
    >
      <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-start")}>
        <span className={cn("mr-2", isCollapsed && "mr-0")}>{icon}</span>
        {!isCollapsed && <span>{label}</span>}
      </div>

      {/* Display children toggle indicator if this is a parent link */}
      {hasChildren && !isCollapsed && (
        <div className="ml-auto">
          <div className="h-4 w-4">
            {isExpanded ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Display badge if provided */}
      {badge && !isCollapsed && (
        <div className="ml-auto bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5">
          {badge}
        </div>
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
  const navigate = useNavigate();

  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={cn(
        "flex items-center rounded-lg px-3 py-1.5 transition-all hover:text-primary pl-8",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-gray-400 hover:bg-gray-900",
        isCollapsed ? "justify-center" : "justify-start"
      )}
    >
      <span className={cn("mr-2", isCollapsed && "mr-0")}>{icon}</span>
      {!isCollapsed && <span className="text-sm">{label}</span>}
    </Link>
  );
};

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isAdmin?: boolean;
}

export const Sidebar = ({
  isCollapsed = false,
  onToggle = () => {},
  isAdmin: propIsAdmin,
}: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, isAdmin: contextIsAdmin } = useAuth();
  const { toast } = useToast();
  const currentPath = location.pathname;
  
  // State for REST API admin status
  const [restApiAdminStatus, setRestApiAdminStatus] = useState<boolean | null>(null);
  const [adminStatusLoading, setAdminStatusLoading] = useState(false);
  
  // Allow admin status to be passed as prop or from context or determined by REST API
  const isAdmin = propIsAdmin || contextIsAdmin || restApiAdminStatus === true;

  // Track expanded sections for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    team: false,
    ai: false,
    admin: false,
    channels: false,
  });
  
  // Use REST API to check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) return;
      
      setAdminStatusLoading(true);
      try {
        console.log("[Sidebar] Checking admin status via REST API for:", user.id);
        const isAdminViaRest = await UserRepository.checkAdminStatusREST(user.id);
        console.log("[Sidebar] REST API admin check result:", isAdminViaRest);
        setRestApiAdminStatus(isAdminViaRest);
        
        // Update localStorage for persistence
        if (isAdminViaRest) {
          localStorage.setItem('user_is_admin', 'true');
          localStorage.setItem('admin_user_id', user.id);
        } else {
          // Only remove if we're certain the user is not an admin
          if (localStorage.getItem('admin_user_id') === user.id) {
            localStorage.removeItem('user_is_admin');
            localStorage.removeItem('admin_user_id');
          }
        }
      } catch (error) {
        console.error("[Sidebar] Error checking admin status via REST:", error);
      } finally {
        setAdminStatusLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [user?.id]);

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
    { to: "/dashboard/admin/workflows", icon: <WorkflowIcon className="h-5 w-5" />, label: "Workflows" },
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
    // Only show admin section for regular admins
    if (!isAdmin) return null;
    
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

          {/* Apps Section */}
          <div className="py-2">
            <SidebarLink
              to="#"
              icon={<Menu className="h-5 w-5" />}
              label="Apps"
              isActive={isAppSectionActive}
              isCollapsed={isCollapsed}
              hasChildren={true}
              isExpanded={expandedSections.channels}
              onClick={() => toggleSection('channels')}
            />

            {expandedSections.channels && !isCollapsed && (
              <div className="mt-1 pl-6">
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
          </div>

          {/* Additional main links */}
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

        {/* Admin section - Conditional rendering based on role */}
        {renderAdminSection()}

        {/* Bottom links */}
        <div className="mt-auto mb-6 pl-3 pt-6">
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

          {/* Sign out button */}
          <SidebarLink
            to="#"
            icon={<LogOut className="h-5 w-5" />}
            label="Sign Out"
            isActive={false}
            isCollapsed={isCollapsed}
            onClick={handleLogout}
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 