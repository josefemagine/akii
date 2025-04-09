import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import DashboardOverview from "./dashboard/DashboardOverview";
const SidebarLink = ({ icon, label, active = false, href = "#", onClick = () => { }, }) => {
    return (_jsxs("a", { href: href, onClick: (e) => {
            e.preventDefault();
            onClick();
        }, className: `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${active ? "bg-primary text-primary-foreground" : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"}`, children: [icon, _jsx("span", { children: label })] }));
};
const Sidebar = ({ activePage = "dashboard", onNavigate = () => { }, }) => {
    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: "🏠" },
        { id: "agents", label: "AI Agents", icon: "🤖" },
        { id: "training", label: "Training Data", icon: "📚" },
        { id: "integrations", label: "Integrations", icon: "🔌" },
        { id: "analytics", label: "Analytics", icon: "📊" },
        { id: "settings", label: "Settings", icon: "⚙️" },
    ];
    return (_jsxs("div", { className: "w-64 h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col", children: [_jsx("div", { className: "p-6", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-2xl", children: "\u26A1" }), _jsx("h1", { className: "text-xl font-bold", children: "Akii" })] }) }), _jsx("nav", { className: "flex-1 px-4 space-y-1 overflow-y-auto", children: navItems.map((item) => (_jsx(SidebarLink, { icon: _jsx("span", { className: "text-xl", children: item.icon }), label: item.label, active: activePage === item.id, onClick: () => onNavigate(item.id) }, item.id))) }), _jsx("div", { className: "p-4 border-t border-gray-200 dark:border-gray-800", children: _jsxs("div", { className: "flex items-center gap-3 rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white", children: "U" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium truncate", children: "User Name" }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 truncate", children: "user@example.com" })] })] }) })] }));
};
const Header = ({ onToggleSidebar = () => { } }) => {
    return (_jsxs("header", { className: "h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-between px-6", children: [_jsx("button", { onClick: onToggleSidebar, className: "lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800", children: "\u2630" }), _jsx("div", { className: "flex-1 ml-4 lg:ml-0", children: _jsxs("div", { className: "relative max-w-md", children: [_jsx("input", { type: "text", placeholder: "Search...", className: "w-full h-10 pl-10 pr-4 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary" }), _jsx("span", { className: "absolute left-3 top-2.5", children: "\uD83D\uDD0D" })] }) }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("button", { className: "p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 relative", children: ["\uD83D\uDD14", _jsx("span", { className: "absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" })] }), _jsx("button", { className: "p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800", children: "\u2699\uFE0F" }), _jsx("button", { className: "p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800", children: "\uD83C\uDF19" })] })] }));
};
const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    return (_jsxs("div", { className: "flex h-screen bg-gray-50 dark:bg-gray-900", children: [_jsx("div", { className: `fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out`, children: _jsx(Sidebar, {}) }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx(Header, { onToggleSidebar: () => setSidebarOpen(!sidebarOpen) }), _jsx("main", { className: "flex-1 overflow-y-auto", children: children })] }), sidebarOpen && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden", onClick: () => setSidebarOpen(false) }))] }));
};
const Home = () => {
    return (_jsx(DashboardLayout, { children: _jsx(DashboardOverview, {}) }));
};
export default Home;
