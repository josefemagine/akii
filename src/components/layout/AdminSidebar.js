import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Users, Settings, Circle, FileText, X, Package, Mail, Layout, BookOpen, Users2, FileCheck, Terminal, } from "lucide-react";
import { cn } from "@/lib/utils";
const SidebarItem = ({ icon = _jsx(Home, { className: "h-5 w-5" }), label = "Menu Item", href = "/", active = false, onClick = () => { }, }) => {
    return (_jsxs("a", { href: href, onClick: (e) => {
            e.preventDefault();
            onClick();
        }, className: cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800", active
            ? "bg-gray-100 text-primary dark:bg-gray-800"
            : "text-gray-500 dark:text-gray-400"), children: [icon, _jsx("span", { children: label })] }));
};
const AdminSidebar = ({ collapsed = false, onToggle = () => { }, }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const adminSidebarItems = [
        {
            icon: _jsx(Home, { className: "h-5 w-5" }),
            label: "Dashboard",
            href: "/admin",
        },
        {
            icon: _jsx(Users, { className: "h-5 w-5" }),
            label: "Users",
            href: "/admin/users",
        },
        {
            icon: _jsx(Settings, { className: "h-5 w-5" }),
            label: "Settings",
            href: "/admin/settings",
        },
        {
            icon: _jsx(Package, { className: "h-5 w-5" }),
            label: "Packages",
            href: "/admin/packages",
        },
        {
            icon: (_jsx("div", { className: "h-5 w-5", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }) }) })),
            label: "Moderation",
            href: "/admin/moderation",
        },
        {
            icon: _jsx(Mail, { className: "h-5 w-5" }),
            label: "Email Templates",
            href: "/admin/email-templates",
        },
        {
            icon: _jsx(FileText, { className: "h-5 w-5" }),
            label: "Lead Magnets",
            href: "/admin/lead-magnets",
        },
        {
            icon: _jsx(Layout, { className: "h-5 w-5" }),
            label: "Landing Pages",
            href: "/admin/landing-pages",
        },
        {
            icon: _jsx(BookOpen, { className: "h-5 w-5" }),
            label: "Blog",
            href: "/admin/blog",
        },
        {
            icon: _jsx(Users2, { className: "h-5 w-5" }),
            label: "Affiliates",
            href: "/admin/affiliates",
        },
        {
            icon: _jsx(FileCheck, { className: "h-5 w-5" }),
            label: "Compliance",
            href: "/admin/compliance",
        },
        {
            icon: _jsx(Terminal, { className: "h-5 w-5" }),
            label: "Run Migration",
            href: "/admin/run-migration",
        },
    ];
    return (_jsxs("div", { className: cn("flex h-full flex-col border-r bg-white dark:bg-gray-950 dark:border-gray-800 transition-all duration-300", collapsed ? "w-[70px]" : "w-[280px]"), children: [_jsxs("div", { className: "flex h-14 items-center border-b px-3 dark:border-gray-800", children: [collapsed ? (_jsx("div", { className: "flex w-full justify-center", children: _jsx("div", { className: "h-6 w-6 fill-red-500 text-red-500", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }) }) }) })) : (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "h-6 w-6 fill-red-500 text-red-500", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }) }) }), _jsx("span", { className: "text-xl font-bold", children: "Admin Panel" })] })), _jsx(Button, { variant: "ghost", size: "icon", className: "ml-auto h-8 w-8 lg:hidden", onClick: onToggle, children: _jsx(X, { className: "h-4 w-4" }) })] }), _jsx("div", { className: "flex-1 overflow-auto py-2", children: _jsx("nav", { className: "grid gap-1 px-2", children: adminSidebarItems.map((item, index) => (_jsx(SidebarItem, { icon: item.icon, label: collapsed ? "" : item.label, href: item.href, active: isActive(item.href), onClick: () => navigate(item.href) }, index))) }) }), _jsx("div", { className: "mt-auto p-4 border-t dark:border-gray-800", children: !collapsed && (_jsx("div", { className: "flex flex-col space-y-4", children: _jsxs(Button, { variant: "outline", size: "sm", className: "w-full", onClick: () => navigate("/dashboard"), children: [_jsx(Circle, { className: "mr-2 h-4 w-4 fill-green-500 text-green-500" }), "Back to Dashboard"] }) })) })] }));
};
export default AdminSidebar;
