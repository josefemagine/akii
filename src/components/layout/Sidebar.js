import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, PlusCircle, Circle, MessageSquare, Users, Settings, ChevronDown, Layout, Bot, BarChart3, CreditCard, FileText, ArrowUpCircle, UserCircle, Shield, Database, Box, Network, UserCheck, ArrowRight as Workflow, Monitor, Smartphone, MessageCircle, Send, ShoppingBag, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
const SidebarItem = ({ icon = _jsx(Home, { className: "h-5 w-5" }), label = "Menu Item", href = "/", active = false, onClick = () => { }, subItems, collapsed = false, className, }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasSubItems = subItems && subItems.length > 0;
    const location = useLocation();
    const navigate = useNavigate();
    const isSubItemActive = (subHref) => location.pathname === subHref;
    const isAnySubItemActive = hasSubItems && subItems.some((item) => isSubItemActive(item.href));
    return (_jsxs("div", { children: [_jsxs("a", { href: hasSubItems ? "#" : href, onClick: (e) => {
                    e.preventDefault();
                    if (hasSubItems) {
                        setIsOpen(!isOpen);
                    }
                    else {
                        navigate(href);
                        onClick();
                    }
                }, className: cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all", !className && "hover:bg-gray-100 dark:hover:bg-gray-800", !className && (active || isAnySubItemActive)
                    ? "bg-gray-100 text-primary dark:bg-gray-800"
                    : "text-gray-500 dark:text-gray-400", className), children: [icon, !collapsed && (_jsxs(_Fragment, { children: [_jsx("span", { className: "flex-1", children: label }), hasSubItems && (_jsx(ChevronDown, { className: cn("h-4 w-4 transition-transform", isOpen && "transform rotate-180") }))] }))] }), !collapsed && hasSubItems && isOpen && (_jsx("div", { className: "ml-8 mt-1 space-y-1", children: subItems.map((item, index) => (_jsxs("a", { href: item.href, onClick: (e) => {
                        e.preventDefault();
                        navigate(item.href);
                    }, className: cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800", isSubItemActive(item.href)
                        ? "bg-gray-100 text-primary dark:bg-gray-800"
                        : "text-gray-500 dark:text-gray-400"), children: [item.icon, item.label] }, index))) }))] }));
};
// Simplified Sidebar component that doesn't rely on auth context
const SimpleSidebar = ({ collapsed = false, onToggle = () => { } }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    // Always show all items regardless of admin status
    const sidebarItems = [
        {
            icon: _jsx(PlusCircle, { className: "h-5 w-5" }),
            label: "Create AI Instance",
            href: "/dashboard/create",
            className: "create-instance-btn bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white dark:hover:bg-primary/90"
        },
        {
            icon: _jsx(Circle, { className: "h-5 w-5" }),
            label: "AI Instances",
            href: "/dashboard/agents",
            subItems: [
                {
                    label: "My Instances",
                    href: "/dashboard/agents",
                },
                {
                    label: "Recent Activity",
                    href: "/dashboard/activity",
                },
            ],
        },
        {
            icon: _jsx(FileText, { className: "h-5 w-5" }),
            label: "Training Data",
            href: "/dashboard/training",
        },
        {
            icon: _jsx(MessageSquare, { className: "h-5 w-5" }),
            label: "Conversations",
            href: "/dashboard/conversations",
        },
        {
            icon: _jsx(Layout, { className: "h-5 w-5" }),
            label: "Apps",
            href: "#",
            subItems: [
                {
                    label: "Web Chat",
                    href: "/dashboard/apps/web",
                    icon: _jsx(Monitor, { className: "h-4 w-4" })
                },
                {
                    label: "Mobile Chat",
                    href: "/dashboard/apps/mobile",
                    icon: _jsx(Smartphone, { className: "h-4 w-4" })
                },
                {
                    label: "WhatsApp Chat",
                    href: "/dashboard/apps/whatsapp",
                    icon: _jsx(MessageCircle, { className: "h-4 w-4" })
                },
                {
                    label: "Telegram Chat",
                    href: "/dashboard/apps/telegram",
                    icon: _jsx(Send, { className: "h-4 w-4" })
                },
                {
                    label: "Shopify Chat",
                    href: "/dashboard/apps/shopify",
                    icon: _jsx(ShoppingBag, { className: "h-4 w-4" })
                },
                {
                    label: "WordPress Chat",
                    href: "/dashboard/apps/wordpress",
                    icon: _jsx(Globe, { className: "h-4 w-4" })
                },
            ],
        },
        {
            icon: _jsx(Users, { className: "h-5 w-5" }),
            label: "Team",
            href: "/dashboard/team",
        },
        {
            icon: _jsx(Settings, { className: "h-5 w-5" }),
            label: "Settings",
            href: "/dashboard/settings",
        },
    ];
    // Admin section items for testing
    const adminItems = [
        {
            icon: _jsx(BarChart3, { className: "h-5 w-5" }),
            label: "Admin Dashboard",
            href: "/admin/dashboard",
        },
        {
            icon: _jsx(Users, { className: "h-5 w-5" }),
            label: "User Management",
            href: "/admin/users",
        },
        {
            icon: _jsx(Settings, { className: "h-5 w-5" }),
            label: "Admin Settings",
            href: "/admin/settings",
        },
        {
            icon: _jsx(CreditCard, { className: "h-5 w-5" }),
            label: "Billing",
            href: "/admin/billing",
        },
        {
            icon: _jsx(MessageSquare, { className: "h-5 w-5" }),
            label: "Email Templates",
            href: "/admin/email-templates",
        },
        {
            icon: _jsx(Layout, { className: "h-5 w-5" }),
            label: "Landing Pages",
            href: "/admin/landing-pages",
        },
        {
            icon: _jsx(Bot, { className: "h-5 w-5" }),
            label: "Lead Magnets",
            href: "/admin/lead-magnets",
        },
        {
            icon: _jsx(Shield, { className: "h-5 w-5" }),
            label: "Moderation",
            href: "/admin/moderation",
        },
        {
            icon: _jsx(Box, { className: "h-5 w-5" }),
            label: "Packages",
            href: "/admin/packages",
        },
        {
            icon: _jsx(Users, { className: "h-5 w-5" }),
            label: "Affiliates",
            href: "/admin/affiliates",
        },
        {
            icon: _jsx(FileText, { className: "h-5 w-5" }),
            label: "Blog",
            href: "/admin/blog",
        },
        {
            icon: _jsx(Shield, { className: "h-5 w-5" }),
            label: "Compliance",
            href: "/admin/compliance",
        },
        {
            icon: _jsx(Database, { className: "h-5 w-5" }),
            label: "Database Schema",
            href: "/admin/database-schema",
        },
        {
            icon: _jsx(Network, { className: "h-5 w-5" }),
            label: "n8n Workflows",
            href: "/admin/n8n-workflows",
        },
        {
            icon: _jsx(ArrowUpCircle, { className: "h-5 w-5" }),
            label: "Run Migration",
            href: "/admin/run-migration",
        },
        {
            icon: _jsx(UserCircle, { className: "h-5 w-5" }),
            label: "User Sync",
            href: "/admin/user-sync",
        },
        {
            icon: _jsx(UserCheck, { className: "h-5 w-5" }),
            label: "User Status Migration",
            href: "/admin/user-status-migration",
        },
        {
            icon: _jsx(Workflow, { className: "h-5 w-5" }),
            label: "Workflows",
            href: "/admin/workflows",
        }
    ];
    return (_jsx("aside", { className: cn("fixed top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-all", collapsed && "w-16"), children: _jsxs("div", { className: "flex h-full flex-col gap-4 p-4", children: [_jsx("div", { className: "h-[80px]" }), _jsxs("nav", { className: "flex flex-1 flex-col gap-1", children: [sidebarItems.map((item, index) => (_jsx(SidebarItem, { icon: item.icon, label: item.label, href: item.href, active: isActive(item.href), subItems: item.subItems, collapsed: collapsed, className: item.className }, index))), _jsx("div", { className: "my-2 border-t dark:border-gray-800" }), !collapsed && (_jsx("div", { className: "px-3 py-2", children: _jsx("h2", { className: "mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400", children: "More" }) })), adminItems.map((item, index) => (_jsx(SidebarItem, { icon: item.icon, label: item.label, href: item.href, active: isActive(item.href), collapsed: collapsed }, `admin-${index}`)))] })] }) }));
};
export default SimpleSidebar;
