var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { cn } from "@/lib/utils";
import { FileText, Users, Settings, LogOut, MessageSquare, Bot, Layers, Shield, Database, CreditCard, BarChart2, Globe, MessageCircle, Key, HelpCircle, ChevronRight, ChevronDown, Smartphone, Send, ShoppingBag, Monitor, Gauge, RefreshCcw, Layout, Workflow, Zap, CheckCircle, User, AlertTriangle, Package, PanelLeftClose, PanelLeftOpen, Cloud, Box, LayoutDashboard, DollarSign, PenTool, Magnet, Mail, } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
const SidebarLink = ({ to, icon, label, isActive, isCollapsed, badge, onClick, hasChildren, isExpanded, }) => {
    if (onClick) {
        return (_jsxs("button", { onClick: onClick, className: cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all", isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground", isCollapsed ? "justify-center" : ""), children: [_jsx("div", { className: "w-5 h-5 flex items-center justify-center overflow-hidden shrink-0", children: icon }), !isCollapsed && _jsx("span", { className: "flex-1 text-left", children: label }), !isCollapsed && hasChildren && (_jsx("div", { className: "ml-auto", children: isExpanded ? _jsx(ChevronDown, { className: "h-4 w-4" }) : _jsx(ChevronRight, { className: "h-4 w-4" }) }))] }));
    }
    return (_jsxs(Link, { to: to, className: cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all", isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground", isCollapsed ? "justify-center" : ""), children: [_jsx("div", { className: "w-5 h-5 flex items-center justify-center overflow-hidden shrink-0", children: icon }), !isCollapsed && _jsx("span", { children: label }), !isCollapsed && badge && (_jsx("span", { className: "ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground", children: badge }))] }));
};
// Simple nested link component for sub-items
const NestedLink = ({ to, icon, label, isActive, isCollapsed }) => {
    if (isCollapsed)
        return null;
    return (_jsxs(Link, { to: to, className: cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ml-5", isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"), children: [_jsx("div", { className: "w-5 h-5 flex items-center justify-center overflow-hidden shrink-0", children: icon }), _jsx("span", { children: label })] }));
};
export const Sidebar = ({ isCollapsed = false, onToggle = () => { }, isAdmin: propIsAdmin, isSuperAdmin: propIsSuperAdmin, }) => {
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
    const toggleSection = (section) => {
        setExpandedSections(Object.assign(Object.assign({}, expandedSections), { [section]: !expandedSections[section] }));
    };
    // Handle sign out with proper error handling
    const handleLogout = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield signOut();
            toast({
                title: "Signed out",
                description: "You have been signed out successfully.",
            });
            navigate('/');
        }
        catch (error) {
            console.error("[Sidebar] Sign out error:", error);
            toast({
                title: "Sign out failed",
                description: "There was a problem signing you out. Please try again.",
                variant: "destructive",
            });
        }
    });
    // Define main navigation links (visible to all users)
    const mainLinks = [
        { to: "/dashboard/ai-instances", icon: _jsx(Bot, { className: "h-5 w-5" }), label: "AI Instances" },
        { to: "/dashboard/documents", icon: _jsx(FileText, { className: "h-5 w-5" }), label: "Training Data" },
        {
            to: "/dashboard/conversations",
            icon: _jsx(MessageSquare, { className: "h-5 w-5" }),
            label: "Conversations",
        },
    ];
    // Define app sub-links
    const appLinks = [
        { to: "/dashboard/web-chat", icon: _jsx(Monitor, { className: "h-5 w-5" }), label: "Web Chat" },
        { to: "/dashboard/mobile-chat", icon: _jsx(Smartphone, { className: "h-5 w-5" }), label: "Mobile Chat" },
        { to: "/dashboard/whatsapp-chat", icon: _jsx(MessageCircle, { className: "h-5 w-5" }), label: "WhatsApp Chat" },
        { to: "/dashboard/telegram-chat", icon: _jsx(Send, { className: "h-5 w-5" }), label: "Telegram Chat" },
        { to: "/dashboard/shopify-chat", icon: _jsx(ShoppingBag, { className: "h-5 w-5" }), label: "Shopify Chat" },
        { to: "/dashboard/wordpress-chat", icon: _jsx(Globe, { className: "h-5 w-5" }), label: "WordPress Chat" },
    ];
    // Additional main links that come after the Apps section
    const additionalMainLinks = [
        { to: "/dashboard/analytics", icon: _jsx(BarChart2, { className: "h-5 w-5" }), label: "Analytics" },
        { to: "/dashboard/api-keys", icon: _jsx(Key, { className: "h-5 w-5" }), label: "API Keys" },
        { to: "/dashboard/team", icon: _jsx(Users, { className: "h-5 w-5" }), label: "Team" },
        { to: "/dashboard/settings", icon: _jsx(Settings, { className: "h-5 w-5" }), label: "Settings" },
    ];
    // Define admin links (settings, users, etc.)
    const adminLinks = [
        { to: "/dashboard/admin", icon: _jsx(LayoutDashboard, { className: "h-5 w-5" }), label: "Dashboard" },
        { to: "/dashboard/admin/supabase-bedrock", icon: _jsx(Box, { className: "h-5 w-5" }), label: "Bedrock Instances" },
        { to: "/dashboard/admin/users", icon: _jsx(Users, { className: "h-5 w-5" }), label: "Users" },
        { to: "/dashboard/admin/manage-plans", icon: _jsx(DollarSign, { className: "h-5 w-5" }), label: "Plans" },
        { to: "/dashboard/admin/settings", icon: _jsx(Settings, { className: "h-5 w-5" }), label: "Settings" },
        // Content
        { to: "/dashboard/admin/blog", icon: _jsx(PenTool, { className: "h-5 w-5" }), label: "Blog" },
        { to: "/dashboard/admin/landing-pages", icon: _jsx(Layout, { className: "h-5 w-5" }), label: "Landing Pages" },
        { to: "/dashboard/admin/lead-magnets", icon: _jsx(Magnet, { className: "h-5 w-5" }), label: "Lead Magnets" },
        { to: "/dashboard/admin/email-templates", icon: _jsx(Mail, { className: "h-5 w-5" }), label: "Email Templates" },
        // Compliance & Security
        { to: "/dashboard/admin/compliance", icon: _jsx(Shield, { className: "h-5 w-5" }), label: "Compliance" },
        // Partners
        { to: "/dashboard/admin/packages", icon: _jsx(Package, { className: "h-5 w-5" }), label: "Packages" },
        { to: "/dashboard/admin/affiliates", icon: _jsx(Users, { className: "h-5 w-5" }), label: "Affiliates" },
        { to: "/dashboard/admin/billing", icon: _jsx(CreditCard, { className: "h-5 w-5" }), label: "Billing" },
        // Migrations
        { to: "/dashboard/admin/user-status-migration", icon: _jsx(User, { className: "h-5 w-5" }), label: "Status Migration" },
        { to: "/dashboard/admin/user-profile-migration", icon: _jsx(User, { className: "h-5 w-5" }), label: "Profile Migration" },
        { to: "/dashboard/admin/run-migration", icon: _jsx(RefreshCcw, { className: "h-5 w-5" }), label: "Run Migration" },
        // Technical
        { to: "/dashboard/admin/workflows", icon: _jsx(Workflow, { className: "h-5 w-5" }), label: "Workflows" },
        { to: "/dashboard/admin/n8n-workflows", icon: _jsx(Zap, { className: "h-5 w-5" }), label: "n8n Workflows" },
        { to: "/dashboard/admin/database-schema", icon: _jsx(Database, { className: "h-5 w-5" }), label: "Database Schema" },
        { to: "/dashboard/admin/manage-instances", icon: _jsx(Cloud, { className: "h-5 w-5" }), label: "AI Instances" },
        { to: "/dashboard/admin/supabase-check", icon: _jsx(CheckCircle, { className: "h-5 w-5" }), label: "Supabase Check" },
        { to: "/dashboard/admin/admin-check", icon: _jsx(AlertTriangle, { className: "h-5 w-5" }), label: "Admin Check" },
    ];
    // Define bottom links (settings, help, etc.)
    const bottomLinks = [
        { to: "/help", icon: _jsx(HelpCircle, { className: "h-5 w-5" }), label: "Help & Support" },
    ];
    // Check if any app link is active
    const isAppSectionActive = appLinks.some(link => currentPath === link.to || currentPath.startsWith(link.to + '/'));
    // Admin section rendering
    const renderAdminSection = () => {
        // Only show admin section for regular admins or super admins
        if (!isAdmin && !isSuperAdminUser)
            return null;
        return (_jsxs("div", { className: "px-3 py-2", children: [_jsxs("h2", { className: "mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground", children: [!isCollapsed && "Admin Menu", isCollapsed && _jsx(Shield, { className: "h-5 w-5 text-red-600 dark:text-red-400" })] }), _jsx("div", { className: "space-y-1", children: _jsx("div", { className: "px-3 py-2", children: _jsxs("div", { className: "space-y-1", children: [_jsx(SidebarLink, { to: "/dashboard/admin/dashboard", icon: _jsx(LayoutDashboard, { className: "h-5 w-5" }), label: "Admin Dashboard", isActive: currentPath.includes("/dashboard/admin/dashboard"), isCollapsed: isCollapsed }), _jsx(SidebarLink, { to: "/dashboard/admin/users", icon: _jsx(Users, { className: "h-5 w-5" }), label: "Users Management", isActive: currentPath.includes("/dashboard/admin/users") && !currentPath.includes("usersync") && !currentPath.includes("userstatus"), isCollapsed: isCollapsed }), _jsx(SidebarLink, { to: "/dashboard/admin/database-schema", icon: _jsx(Database, { className: "h-5 w-5" }), label: "Database Schema", isActive: currentPath.includes("/dashboard/admin/database-schema"), isCollapsed: isCollapsed }), _jsx(SidebarLink, { to: "/dashboard/admin/settings", icon: _jsx(Settings, { className: "h-5 w-5" }), label: "Settings", isActive: currentPath.includes("/dashboard/admin/settings"), isCollapsed: isCollapsed }), _jsx(SidebarLink, { to: "/dashboard/admin/billing", icon: _jsx(CreditCard, { className: "h-5 w-5" }), label: "Billing", isActive: currentPath.includes("/dashboard/admin/billing"), isCollapsed: isCollapsed })] }) }) })] }));
    };
    return (_jsx("aside", { className: cn("fixed left-0 top-0 z-20 hidden h-full transition-all lg:flex", isCollapsed ? "w-16" : "w-[240px]"), children: _jsxs("div", { className: "flex h-full w-full flex-col overflow-y-auto bg-gray-950 p-0", children: [_jsx("div", { className: "pt-[80px]" }), _jsxs("nav", { className: "space-y-1 pl-3", children: [mainLinks.map((link) => (_jsx(SidebarLink, { to: link.to, icon: link.icon, label: link.label, isActive: currentPath === link.to || currentPath.startsWith(link.to + '/'), isCollapsed: isCollapsed }, link.to))), _jsx(SidebarLink, { to: "#", icon: _jsx(Layers, { className: "h-5 w-5" }), label: "Apps", isActive: isAppSectionActive, isCollapsed: isCollapsed, onClick: () => toggleSection('ai'), hasChildren: true, isExpanded: expandedSections.ai }), expandedSections.ai && !isCollapsed && (_jsx("div", { className: "space-y-1 pl-0", children: appLinks.map((link) => (_jsx(NestedLink, { to: link.to, icon: link.icon, label: link.label, isActive: currentPath === link.to || currentPath.startsWith(link.to + '/'), isCollapsed: isCollapsed }, link.to))) })), additionalMainLinks.map((link) => (_jsx(SidebarLink, { to: link.to, icon: link.icon, label: link.label, isActive: currentPath === link.to || currentPath.startsWith(link.to + '/'), isCollapsed: isCollapsed }, link.to)))] }), isAdmin && (_jsxs("div", { className: cn("mt-6 pt-6 border-t border-gray-200 dark:border-gray-800", isCollapsed ? "px-1" : ""), children: [!isCollapsed && (_jsx("div", { className: "px-3 mb-2", children: _jsx("p", { className: "text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider", children: "ADMIN" }) })), isCollapsed && (_jsx("div", { className: "flex justify-center mb-2", children: _jsx("div", { className: "flex items-center justify-center w-6 h-6 rounded-full bg-red-600/20 border border-red-600/50", title: "Admin Navigation", children: _jsx(Shield, { className: "w-3 h-3 text-red-600" }) }) })), _jsxs("nav", { className: cn("space-y-1", isCollapsed ? "px-1" : "pl-3"), children: [_jsx(SidebarLink, { to: adminLinks[0].to, icon: _jsx("div", { className: "text-red-600 dark:text-red-400", children: adminLinks[0].icon }), label: adminLinks[0].label, isActive: currentPath.includes(adminLinks[0].to), isCollapsed: isCollapsed }, adminLinks[0].to), _jsx(SidebarLink, { to: adminLinks[1].to, icon: _jsx("div", { className: "text-red-600 dark:text-red-400", children: adminLinks[1].icon }), label: adminLinks[1].label, isActive: currentPath.includes(adminLinks[1].to), isCollapsed: isCollapsed }, adminLinks[1].to), _jsx(SidebarLink, { to: adminLinks[2].to, icon: _jsx("div", { className: "text-red-600 dark:text-red-400", children: adminLinks[2].icon }), label: adminLinks[2].label, isActive: currentPath.includes(adminLinks[2].to), isCollapsed: isCollapsed }, adminLinks[2].to), _jsx(SidebarLink, { to: adminLinks[3].to, icon: _jsx("div", { className: "text-red-600 dark:text-red-400", children: adminLinks[3].icon }), label: adminLinks[3].label, isActive: currentPath.includes(adminLinks[3].to), isCollapsed: isCollapsed }, adminLinks[3].to), !isCollapsed && (_jsx(SidebarLink, { to: "#", icon: _jsx("div", { className: "text-red-600 dark:text-red-400", children: _jsx(Gauge, { className: "h-5 w-5" }) }), label: "General", isActive: currentPath.includes("/admin/settings"), isCollapsed: isCollapsed, onClick: () => toggleSection('admin'), hasChildren: true, isExpanded: expandedSections.admin })), (expandedSections.admin || isCollapsed) && (_jsx(_Fragment, { children: adminLinks.slice(4, 5).map((link) => (_jsx(SidebarLink, { to: link.to, icon: _jsx("div", { className: "text-red-600 dark:text-red-400", children: link.icon }), label: link.label, isActive: currentPath.includes(link.to), isCollapsed: isCollapsed }, link.to))) })), !isCollapsed && (_jsx(SidebarLink, { to: "#", icon: _jsx("div", { className: "text-red-600 dark:text-red-400", children: _jsx(Layout, { className: "h-5 w-5" }) }), label: "Content", isActive: currentPath.includes("/admin/blog") ||
                                        currentPath.includes("/admin/landing-pages") ||
                                        currentPath.includes("/admin/lead-magnets") ||
                                        currentPath.includes("/admin/email-templates"), isCollapsed: isCollapsed, onClick: () => toggleSection('channels'), hasChildren: true, isExpanded: expandedSections.channels })), expandedSections.channels && !isCollapsed && (_jsx(_Fragment, { children: adminLinks.slice(5, 8).map((link) => (_jsx(NestedLink, { to: link.to, icon: _jsx("div", { className: "text-red-600 dark:text-red-400", children: link.icon }), label: link.label, isActive: currentPath.includes(link.to), isCollapsed: isCollapsed }, link.to))) })), !isCollapsed && (_jsx(SidebarLink, { to: "#", icon: _jsx("div", { className: "text-red-600 dark:text-red-400", children: _jsx(Shield, { className: "h-5 w-5" }) }), label: "Compliance", isActive: currentPath.includes("/dashboard/admin/compliance") ||
                                        currentPath.includes("/dashboard/admin/moderation"), isCollapsed: isCollapsed, onClick: () => toggleSection('admin'), hasChildren: true, isExpanded: expandedSections.admin })), expandedSections.admin && !isCollapsed && (_jsx(_Fragment, { children: adminLinks.slice(8, 9).map((link) => (_jsx(NestedLink, { to: link.to, icon: _jsx("div", { className: "text-red-600 dark:text-red-400", children: link.icon }), label: link.label, isActive: currentPath.includes(link.to), isCollapsed: isCollapsed }, link.to))) })), !isCollapsed && (_jsx(SidebarLink, { to: "#", icon: _jsx("div", { className: "text-red-600 dark:text-red-400", children: _jsx(Users, { className: "h-5 w-5" }) }), label: "Partners", isActive: currentPath.includes("/dashboard/admin/affiliates") ||
                                        currentPath.includes("/dashboard/admin/packages") ||
                                        currentPath.includes("/dashboard/admin/billing"), isCollapsed: isCollapsed, onClick: () => toggleSection('admin'), hasChildren: true, isExpanded: expandedSections.admin })), expandedSections.admin && !isCollapsed && (_jsx(_Fragment, { children: [adminLinks[10], adminLinks[11], adminLinks[12]].map((link) => (_jsx(NestedLink, { to: link.to, icon: _jsx("div", { className: "text-red-600 dark:text-red-400", children: link.icon }), label: link.label, isActive: currentPath.includes(link.to), isCollapsed: isCollapsed }, link.to))) })), !isCollapsed && (_jsx(SidebarLink, { to: "#", icon: _jsx("div", { className: "text-red-600 dark:text-red-400", children: _jsx(RefreshCcw, { className: "h-5 w-5" }) }), label: "Migrations", isActive: currentPath.includes("/dashboard/admin/user-sync") ||
                                        currentPath.includes("/dashboard/admin/user-status-migration") ||
                                        currentPath.includes("/dashboard/admin/user-profile-migration") ||
                                        currentPath.includes("/dashboard/admin/run-migration"), isCollapsed: isCollapsed, onClick: () => toggleSection('admin'), hasChildren: true, isExpanded: expandedSections.admin })), expandedSections.admin && !isCollapsed && (_jsx(_Fragment, { children: adminLinks.slice(13, 17).map((link) => (_jsx(NestedLink, { to: link.to, icon: _jsx("div", { className: "text-red-600 dark:text-red-400", children: link.icon }), label: link.label, isActive: currentPath.includes(link.to), isCollapsed: isCollapsed }, link.to))) })), !isCollapsed && (_jsx(SidebarLink, { to: "#", icon: _jsx("div", { className: "text-red-600 dark:text-red-400", children: _jsx(Database, { className: "h-5 w-5" }) }), label: "Technical", isActive: currentPath.includes("/dashboard/admin/workflows") ||
                                        currentPath.includes("/dashboard/admin/n8n-workflows") ||
                                        currentPath.includes("/dashboard/admin/database-schema") ||
                                        currentPath.includes("/dashboard/admin/manage-instances") ||
                                        currentPath.includes("/dashboard/admin/supabase-check") ||
                                        currentPath.includes("/dashboard/admin/admin-check"), isCollapsed: isCollapsed, onClick: () => toggleSection('admin'), hasChildren: true, isExpanded: expandedSections.admin })), expandedSections.admin && !isCollapsed && (_jsx(_Fragment, { children: adminLinks.slice(17).map((link) => (_jsx(NestedLink, { to: link.to, icon: _jsx("div", { className: "text-red-600 dark:text-red-400", children: link.icon }), label: link.label, isActive: currentPath.includes(link.to), isCollapsed: isCollapsed }, link.to))) })), isCollapsed && (_jsx(_Fragment, { children: adminLinks.slice(4).map((link) => (_jsx(SidebarLink, { to: link.to, icon: _jsx("div", { className: "text-red-600 dark:text-red-400", children: link.icon }), label: link.label, isActive: currentPath.includes(link.to), isCollapsed: isCollapsed }, link.to))) }))] })] })), renderAdminSection(), _jsxs("div", { className: "mt-auto pt-6 space-y-1 pl-3", children: [bottomLinks.map((link) => (_jsx(SidebarLink, { to: link.to, icon: link.icon, label: link.label, isActive: currentPath === link.to, isCollapsed: isCollapsed }, link.to))), _jsxs("button", { onClick: handleLogout, className: cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive", isCollapsed ? "justify-center" : ""), children: [_jsx("div", { className: "w-5 h-5 flex items-center justify-center overflow-hidden shrink-0", children: _jsx(LogOut, { className: "w-[18px] h-[18px]", size: 18, strokeWidth: 2 }) }), !isCollapsed && _jsx("span", { children: "Logout" })] }), _jsxs("button", { onClick: onToggle, className: cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground mt-4 border-t dark:border-gray-800 pt-4", isCollapsed ? "justify-center" : ""), title: isCollapsed ? "Expand sidebar" : "Collapse sidebar", children: [_jsx("div", { className: "w-5 h-5 flex items-center justify-center overflow-hidden shrink-0", children: isCollapsed ? (_jsx(PanelLeftOpen, { className: "w-[18px] h-[18px]", size: 18, strokeWidth: 2 })) : (_jsx(PanelLeftClose, { className: "w-[18px] h-[18px]", size: 18, strokeWidth: 2 })) }), !isCollapsed && _jsx("span", { children: "Collapse Sidebar" })] })] })] }) }));
};
export default Sidebar;
