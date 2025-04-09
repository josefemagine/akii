var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { cn } from "@/lib/utils";
import { Home, FileText, Users, Settings, LogOut, MessageSquare, Bot, Layers, Shield, UserCheck, Database, CreditCard, BarChart2, Globe, MessageCircle, FileUp, ClipboardList, Server, HelpCircle, Circle, ChevronRight, ChevronDown, Smartphone, Send, ShoppingBag, Monitor, } from "lucide-react";
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
export const ConsolidatedSidebar = ({ isCollapsed = false, onToggle = () => { }, }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, profile, signOut, isAdmin } = useAuth();
    const currentPath = location.pathname;
    // State to track expanded sections
    const [expandedSections, setExpandedSections] = useState({
        apps: true,
    });
    // Toggle expanded section
    const toggleSection = (section) => {
        if (!isCollapsed) {
            setExpandedSections((prev) => (Object.assign(Object.assign({}, prev), { [section]: !prev[section] })));
        }
    };
    // Define main navigation links (visible to all users)
    const mainLinks = [
        { to: "/dashboard", icon: _jsx(Home, { className: "h-5 w-5" }), label: "Dashboard" },
        { to: "/dashboard/agents", icon: _jsx(Bot, { className: "h-5 w-5" }), label: "AI Instances" },
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
        { to: "/dashboard/private-ai", icon: _jsx(Server, { className: "h-5 w-5" }), label: "Private AI API" },
    ];
    // Additional main links that come after the Apps section
    const additionalMainLinks = [
        { to: "/dashboard/team", icon: _jsx(Users, { className: "h-5 w-5" }), label: "Team" },
        { to: "/dashboard/settings", icon: _jsx(Settings, { className: "h-5 w-5" }), label: "Settings" },
    ];
    // Define admin navigation links (now visible to all users)
    const adminLinks = [
        { to: "/admin/users", icon: _jsx(Users, { className: "h-5 w-5" }), label: "Users" },
        { to: "/admin/user-sync", icon: _jsx(UserCheck, { className: "h-5 w-5" }), label: "User Sync" },
        { to: "/admin/users-page", icon: _jsx(Users, { className: "h-5 w-5" }), label: "Users Page" },
        { to: "/admin/moderation", icon: _jsx(Shield, { className: "h-5 w-5" }), label: "Moderation" },
        {
            to: "/admin/email-templates",
            icon: _jsx(MessageSquare, { className: "h-5 w-5" }),
            label: "Email Templates",
        },
        { to: "/admin/billing", icon: _jsx(CreditCard, { className: "h-5 w-5" }), label: "Billing" },
        { to: "/admin/workflows", icon: _jsx(Layers, { className: "h-5 w-5" }), label: "Workflows" },
        { to: "/admin/n8n-workflows", icon: _jsx(Layers, { className: "h-5 w-5" }), label: "n8n Workflows" },
        {
            to: "/admin/database-schema",
            icon: _jsx(Database, { className: "h-5 w-5" }),
            label: "Database Schema",
        },
        { to: "/admin/settings", icon: _jsx(Settings, { className: "h-5 w-5" }), label: "Admin Settings" },
        { to: "/admin/check", icon: _jsx(Shield, { className: "h-5 w-5" }), label: "Admin Check" },
        { to: "/admin/supabase-check", icon: _jsx(Database, { className: "h-5 w-5" }), label: "Supabase Check" },
        { to: "/admin/affiliates", icon: _jsx(ClipboardList, { className: "h-5 w-5" }), label: "Affiliates" },
        { to: "/admin/blog", icon: _jsx(FileText, { className: "h-5 w-5" }), label: "Blog" },
        { to: "/admin/compliance", icon: _jsx(Shield, { className: "h-5 w-5" }), label: "Compliance" },
        { to: "/admin/dashboard", icon: _jsx(BarChart2, { className: "h-5 w-5" }), label: "Dashboard" },
        { to: "/admin/landing-pages", icon: _jsx(Globe, { className: "h-5 w-5" }), label: "Landing Pages" },
        {
            to: "/admin/lead-magnets",
            icon: _jsx(MessageCircle, { className: "h-5 w-5" }),
            label: "Lead Magnets",
        },
        { to: "/admin/packages", icon: _jsx(FileText, { className: "h-5 w-5" }), label: "Packages" },
        { to: "/admin/run-migration", icon: _jsx(FileUp, { className: "h-5 w-5" }), label: "Run Migration" },
        {
            to: "/admin/user-status-migration",
            icon: _jsx(UserCheck, { className: "h-5 w-5" }),
            label: "User Status Migration",
        },
    ];
    // Define bottom links (settings, help, etc.)
    const bottomLinks = [
        { to: "/help", icon: _jsx(HelpCircle, { className: "h-5 w-5" }), label: "Help & Support" },
    ];
    // Add admin dashboard link to bottom links if user is admin
    if (isAdmin) {
        bottomLinks.unshift({
            to: "/admin/dashboard",
            icon: _jsx(Shield, { className: "h-5 w-5" }),
            label: "Admin Dashboard",
        });
    }
    const handleLogout = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (signOut) {
                yield signOut();
                navigate("/");
            }
        }
        catch (error) {
            console.error("Error during logout:", error);
        }
    });
    // Check if any app link is active
    const isAppSectionActive = appLinks.some(link => currentPath === link.to || currentPath.startsWith(link.to + '/'));
    return (_jsx("aside", { className: cn("fixed left-0 top-0 z-20 hidden h-full transition-all lg:flex", isCollapsed ? "w-16" : "w-[200px]"), children: _jsxs("div", { className: "flex h-full w-full flex-col overflow-y-auto bg-gray-950 p-0", children: [_jsx("div", { className: cn("flex items-center py-3 pl-3", isCollapsed ? "justify-center" : "justify-start"), children: isCollapsed ? (_jsxs("div", { className: "relative flex h-10 w-10 items-center justify-center", children: [_jsx(Circle, { className: "h-8 w-8 fill-green-500 text-green-500" }), isAdmin && (_jsx("div", { className: "absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-600 rounded-full", children: _jsx("span", { className: "text-[8px] font-bold text-white", children: "A" }) }))] })) : (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Circle, { className: "h-6 w-6 fill-green-500 text-green-500" }), _jsx("span", { className: "text-xl font-bold", children: "Akii" }), isAdmin && (_jsx("div", { className: "flex items-center border border-red-600 dark:border-red-500 rounded-md px-2 py-0.5 ml-2", children: _jsx("span", { className: "text-xs font-medium text-red-600 dark:text-red-500", children: "Admin" }) }))] })) }), _jsxs("nav", { className: "space-y-1 mt-3 pl-3", children: [mainLinks.map((link) => (_jsx(SidebarLink, { to: link.to, icon: link.icon, label: link.label, isActive: currentPath === link.to || currentPath.startsWith(link.to + '/'), isCollapsed: isCollapsed }, link.to))), _jsx(SidebarLink, { to: "#", icon: _jsx(Layers, { className: "h-5 w-5" }), label: "Apps", isActive: isAppSectionActive, isCollapsed: isCollapsed, onClick: () => toggleSection('apps'), hasChildren: true, isExpanded: expandedSections.apps }), expandedSections.apps && !isCollapsed && (_jsx("div", { className: "space-y-1 pl-0", children: appLinks.map((link) => (_jsx(NestedLink, { to: link.to, icon: link.icon, label: link.label, isActive: currentPath === link.to || currentPath.startsWith(link.to + '/'), isCollapsed: isCollapsed }, link.to))) })), additionalMainLinks.map((link) => (_jsx(SidebarLink, { to: link.to, icon: link.icon, label: link.label, isActive: currentPath === link.to || currentPath.startsWith(link.to + '/'), isCollapsed: isCollapsed }, link.to)))] }), isAdmin && (_jsxs("div", { className: cn("mt-6 pt-6 border-t border-gray-200 dark:border-gray-800", isCollapsed ? "px-1" : ""), children: [!isCollapsed && (_jsx("div", { className: "px-3 mb-2", children: _jsx("p", { className: "text-xs font-semibold text-muted-foreground", children: "ADMIN" }) })), isCollapsed && (_jsx("div", { className: "flex justify-center mb-2", children: _jsx("div", { className: "flex items-center justify-center w-6 h-6 rounded-full bg-red-600/20 border border-red-600/50", title: "Admin Navigation", children: _jsx(Shield, { className: "w-3 h-3 text-red-600" }) }) })), _jsx("nav", { className: cn("space-y-1", isCollapsed ? "px-1" : "pl-3"), children: adminLinks.map((link) => (_jsx(SidebarLink, { to: link.to, icon: link.icon, label: link.label, isActive: currentPath.includes(link.to), isCollapsed: isCollapsed }, link.to))) })] })), _jsxs("div", { className: "mt-auto pt-6 space-y-1 pl-3", children: [bottomLinks.map((link) => (_jsx(SidebarLink, { to: link.to, icon: link.icon, label: link.label, isActive: currentPath === link.to, isCollapsed: isCollapsed }, link.to))), _jsxs("button", { onClick: handleLogout, className: cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive", isCollapsed ? "justify-center" : ""), children: [_jsx("div", { className: "w-5 h-5 flex items-center justify-center overflow-hidden shrink-0", children: _jsx(LogOut, { className: "w-[18px] h-[18px]", size: 18, strokeWidth: 2 }) }), !isCollapsed && _jsx("span", { children: "Logout" })] })] })] }) }));
};
export default ConsolidatedSidebar;
